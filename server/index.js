import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runPipeline, PIPELINES } from './pipeline.js';
import { ROLE_LIST } from './roles/index.js';
import { store } from './store.js';
import { notifyAll, sendEmail, sendTelegram } from './notify.js';
import { startScheduler, runWeeklyReport } from './scheduler.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 3001;

// ---- meta ----------------------------------------------------------------

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    hasApiKey: Boolean(process.env.ANTHROPIC_API_KEY),
    hasResend: Boolean(process.env.RESEND_API_KEY),
  });
});

app.get('/api/roles', (_req, res) => {
  // system prompts stay server-side; expose display metadata only
  res.json(
    ROLE_LIST.map(({ key, nickname, title, team, model, avatar }) => ({
      key, nickname, title, team, model, avatar,
    }))
  );
});

// ---- pipeline (SSE over POST) ---------------------------------------------

app.post('/api/pipeline/run', async (req, res) => {
  const { command, portfolio = [], pipeline = 'full', mode = 'manual', notify = true } = req.body || {};
  if (!command?.trim()) return res.status(400).json({ error: 'command is required' });
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY ยังไม่ได้ตั้งค่าใน .env' });
  }
  if (!PIPELINES[pipeline]) return res.status(400).json({ error: `unknown pipeline: ${pipeline}` });

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const emit = (event) => res.write(`data: ${JSON.stringify(event)}\n\n`);
  const abort = new AbortController();
  req.on('close', () => abort.abort());

  try {
    const report = await runPipeline({
      command: command.trim(),
      portfolio,
      pipeline,
      mode,
      emit,
      signal: abort.signal,
    });
    store.addReport(report);

    if (notify) {
      const notified = await notifyAll(report);
      emit({ type: 'notified', ...notified });
    }
  } catch (e) {
    if (!abort.signal.aborted) emit({ type: 'error', message: e.message });
  } finally {
    res.end();
  }
});

// ---- settings / portfolio / reports ----------------------------------------

app.get('/api/settings', (_req, res) => res.json(store.getSettings()));
app.post('/api/settings', (req, res) => res.json(store.saveSettings(req.body || {})));

app.get('/api/portfolio', (_req, res) => res.json(store.getPortfolio()));
app.post('/api/portfolio', (req, res) => res.json(store.savePortfolio(req.body || [])));

app.get('/api/reports', (_req, res) => res.json(store.getReports()));

// ---- notifications test + weekly manual trigger ----------------------------

const testReport = () => ({
  type: 'test',
  createdAt: new Date().toISOString(),
  command: 'ทดสอบการแจ้งเตือน',
  finalCall: 'TEST OK ✅',
  summary: '# 🎯 ทดสอบระบบแจ้งเตือน\n\nถ้าได้รับข้อความนี้แปลว่าตั้งค่าถูกต้องแล้ว',
  totals: { input: 0, output: 0, cost: 0 },
});

app.post('/api/test/email', async (_req, res) => res.json(await sendEmail(testReport())));
app.post('/api/test/telegram', async (_req, res) => res.json(await sendTelegram(testReport())));

app.post('/api/weekly/run', async (_req, res) => {
  try {
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

app.listen(PORT, () => {
  console.log(`[server] Palm Investment OS API on http://localhost:${PORT}`);
  startScheduler();
});
