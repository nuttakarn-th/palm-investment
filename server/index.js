import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runPipeline, PIPELINES } from './pipeline.js';
import { ROLE_LIST } from './roles/index.js';
import { store } from './store.js';
import { notifyAll, sendEmail, sendTelegram } from './notify.js';
import { startScheduler, runWeeklyReport } from './scheduler.js';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 3001;

// ── In-memory active run (shared within process instance) ─────────────────────
let memRun = null;          // latest run snapshot — served by GET /api/pipeline/state
const runAbort = new Map(); // runId -> AbortController

// ── Auth helpers ──────────────────────────────────────────────────────────────

const SITE_PASSWORD = process.env.SITE_PASSWORD || '';
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

function sessionToken() {
  return crypto.createHmac('sha256', SESSION_SECRET).update(SITE_PASSWORD).digest('hex');
}

function parseCookies(header = '') {
  return Object.fromEntries(
    header.split(';').map((c) => c.trim().split('=')).filter(([k]) => k).map(([k, ...v]) => [k.trim(), v.join('=').trim()])
  );
}

function isAuthed(req) {
  if (!SITE_PASSWORD) return true;
  const cookies = parseCookies(req.headers.cookie);
  return cookies.palm_sid === sessionToken();
}

function requireAuth(req, res, next) {
  if (isAuthed(req)) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// ── Auth endpoints (public) ───────────────────────────────────────────────────

app.post('/api/auth/login', (req, res) => {
  if (!SITE_PASSWORD) return res.json({ ok: true });
  const { password } = req.body || {};
  if (password !== SITE_PASSWORD) {
    return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
  }
  const maxAge = 30 * 24 * 60 * 60;
  res.setHeader('Set-Cookie', `palm_sid=${sessionToken()}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax`);
  res.json({ ok: true });
});

app.post('/api/auth/logout', (_req, res) => {
  res.setHeader('Set-Cookie', 'palm_sid=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
  res.json({ authenticated: isAuthed(req), protected: Boolean(SITE_PASSWORD) });
});

// ── Market data proxy (Yahoo Finance) ────────────────────────────────────────

const mktCache = new Map();
const MKT_TTL = 5 * 60 * 1000;

app.get('/api/market', requireAuth, async (req, res) => {
  const symbols = String(req.query.symbols || '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 30);
  if (!symbols.length) return res.json({});

  const result = {};
  const now = Date.now();

  await Promise.allSettled(
    symbols.map(async (sym) => {
      const cached = mktCache.get(sym);
      if (cached && now - cached.ts < MKT_TTL) { result[sym] = cached; return; }
      try {
        const r = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=1d`,
          { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) }
        );
        const data = await r.json();
        const meta = data?.chart?.result?.[0]?.meta;
        if (meta?.regularMarketPrice) {
          const entry = {
            price: meta.regularMarketPrice,
            change: meta.regularMarketChange ?? 0,
            changePct: meta.regularMarketChangePercent ?? 0,
            currency: meta.currency ?? 'USD',
            ts: now,
          };
          mktCache.set(sym, entry);
          result[sym] = entry;
        }
      } catch { /* network error — skip symbol */ }
    })
  );

  res.json(result);
});

// ---- meta ----------------------------------------------------------------

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    hasApiKey: Boolean(process.env.ANTHROPIC_API_KEY),
    hasResend: Boolean(process.env.RESEND_API_KEY),
  });
});

app.get('/api/roles', (_req, res) => {
  res.json(
    ROLE_LIST.map(({ key, nickname, title, team, model, avatar }) => ({
      key, nickname, title, team, model, avatar,
    }))
  );
});

// ---- pipeline state (polling endpoint for cross-device / post-refresh) ------

app.get('/api/pipeline/state', requireAuth, async (_req, res) => {
  if (memRun) return res.json(memRun);
  const stored = await store.getCurrentRun();
  res.json(stored || { status: 'idle' });
});

// ---- pipeline cancel --------------------------------------------------------

app.post('/api/pipeline/cancel', requireAuth, async (_req, res) => {
  if (!memRun || memRun.status !== 'running') return res.json({ ok: false });
  const ctrl = runAbort.get(memRun.id);
  if (ctrl) ctrl.abort();
  runAbort.delete(memRun.id);
  memRun = { ...memRun, status: 'cancelled', updatedAt: new Date().toISOString() };
  store.saveCurrentRun(memRun).catch(() => {});
  res.json({ ok: true });
});

// ---- pipeline (SSE over POST) -----------------------------------------------

app.post('/api/pipeline/run', requireAuth, async (req, res) => {
  const { command, portfolio = [], pipeline = 'full', mode = 'manual', notify = true } = req.body || {};
  if (!command?.trim()) return res.status(400).json({ error: 'command is required' });
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY ยังไม่ได้ตั้งค่าใน .env' });
  }
  if (!PIPELINES[pipeline]) return res.status(400).json({ error: `unknown pipeline: ${pipeline}` });

  // Cancel any existing run before starting a new one
  if (memRun?.status === 'running') {
    const old = runAbort.get(memRun.id);
    if (old) old.abort();
    runAbort.delete(memRun.id);
    memRun = { ...memRun, status: 'cancelled', updatedAt: new Date().toISOString() };
    store.saveCurrentRun(memRun).catch(() => {});
  }

  const runId = `run_${Date.now().toString(36)}`;
  const stages = PIPELINES[pipeline] || PIPELINES.full;
  const initialAgents = Object.fromEntries(
    stages.flat().map((k) => [k, { status: 'pending' }])
  );

  memRun = {
    id: runId,
    status: 'running',
    command: command.trim(),
    pipeline,
    mode,
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    agents: initialAgents,
    totals: { input: 0, output: 0, cost: 0 },
    report: null,
    error: null,
  };
  store.saveCurrentRun(memRun).catch(() => {});

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  // SSE write — silently ignores closed connections (pipeline continues server-side)
  const emit = (event) => {
    try { res.write(`data: ${JSON.stringify(event)}\n\n`); } catch {}
    // Update in-memory run on milestone events (not agent_delta which fires per token)
    if (memRun?.id === runId) {
      switch (event.type) {
        case 'agent_start':
          memRun = { ...memRun, agents: { ...memRun.agents, [event.agent]: { status: 'active', text: '' } }, updatedAt: new Date().toISOString() };
          store.saveCurrentRun(memRun).catch(() => {});
          break;
        case 'agent_delta':
          // Keep updatedAt fresh so stale-run detection doesn't fire during long streams
          if (memRun?.id === runId) {
            memRun = { ...memRun, updatedAt: new Date().toISOString() };
          }
          break;
        case 'agent_done':
          memRun = { ...memRun, agents: { ...memRun.agents, [event.agent]: { status: 'done', usage: event.usage, text: event.text || '' } }, updatedAt: new Date().toISOString() };
          store.saveCurrentRun(memRun).catch(() => {});
          break;
        case 'stage_done':
          memRun = { ...memRun, totals: event.totals };
          break;
        case 'pipeline_done':
          memRun = { ...memRun, status: 'done', report: event.report, updatedAt: new Date().toISOString() };
          store.saveCurrentRun(memRun).catch(() => {});
          break;
        case 'error':
          memRun = { ...memRun, status: 'error', error: event.message, updatedAt: new Date().toISOString() };
          store.saveCurrentRun(memRun).catch(() => {});
          break;
      }
    }
  };

  const abort = new AbortController();
  runAbort.set(runId, abort);
  // No abort on SSE disconnect — pipeline continues server-side after refresh

  emit({ type: 'run_id', id: runId });

  try {
    const report = await runPipeline({
      command: command.trim(),
      portfolio,
      pipeline,
      mode,
      emit,
      signal: abort.signal,
    });
    await store.addReport(report);

    if (notify) {
      const notified = await notifyAll(report);
      emit({ type: 'notified', ...notified });
    }
  } catch (e) {
    if (abort.signal.aborted) {
      emit({ type: 'pipeline_cancelled' }); // tell initiating client it was cancelled
    } else {
      emit({ type: 'error', message: e.message });
    }
  } finally {
    runAbort.delete(runId);
    try { res.end(); } catch {}
  }
});

// ---- settings / portfolio / reports ----------------------------------------

app.get('/api/settings', requireAuth, async (_req, res) => res.json(await store.getSettings()));
app.post('/api/settings', requireAuth, async (req, res) => res.json(await store.saveSettings(req.body || {})));

app.get('/api/portfolio', requireAuth, async (_req, res) => res.json(await store.getPortfolio()));
app.post('/api/portfolio', requireAuth, async (req, res) => res.json(await store.savePortfolio(req.body || [])));

app.get('/api/reports', requireAuth, async (_req, res) => res.json(await store.getReports()));

// ---- notifications test + weekly manual trigger ----------------------------

const testReport = () => ({
  type: 'test',
  createdAt: new Date().toISOString(),
  command: 'ทดสอบการแจ้งเตือน',
  finalCall: 'TEST OK ✅',
  summary: '# 🎯 ทดสอบระบบแจ้งเตือน\n\nถ้าได้รับข้อความนี้แปลว่าตั้งค่าถูกต้องแล้ว',
  totals: { input: 0, output: 0, cost: 0 },
});

app.post('/api/test/email', requireAuth, async (_req, res) => res.json(await sendEmail(testReport())));
app.post('/api/test/telegram', requireAuth, async (_req, res) => res.json(await sendTelegram(testReport())));

app.post('/api/weekly/run', requireAuth, async (_req, res) => {
  try {
    const { report, notified } = await runWeeklyReport();
    res.json({ ok: true, reportId: report.id, notified });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ---- Vercel Cron — GET /api/cron/weekly (Sunday 08:00 Asia/Bangkok) --------

app.get('/api/cron/weekly', async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const settings = await store.getSettings();
    if (!settings.weeklyEnabled) {
      return res.json({ ok: true, skipped: true, reason: 'weeklyEnabled = false' });
    }
    const { report, notified } = await runWeeklyReport();
    res.json({ ok: true, reportId: report.id, notified });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ---- static client (production build) --------------------------------------

const clientDist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`[server] Palm Investment OS API on http://localhost:${PORT}`);
    startScheduler();
  });
}

export default app;
