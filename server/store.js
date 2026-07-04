import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const IS_VERCEL = process.env.VERCEL === '1';
const HAS_KV = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

// ── File-based storage (local dev + Railway) ─────────────────────────────────
const DATA_DIR = IS_VERCEL
  ? '/tmp/palm-data'
  : path.join(path.dirname(fileURLToPath(import.meta.url)), 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

function filePath(name) { return path.join(DATA_DIR, `${name}.json`); }
function fileRead(name, fallback) {
  try { return JSON.parse(fs.readFileSync(filePath(name), 'utf8')); }
  catch { return fallback; }
}
function fileWrite(name, value) {
  fs.writeFileSync(filePath(name), JSON.stringify(value, null, 2));
  return value;
}

// ── Vercel KV (persistent storage when KV_REST_API_URL is configured) ────────
async function kvGet(key, fallback) {
  try {
    const { kv } = await import('@vercel/kv');
    const val = await kv.get(key);
    return val ?? fallback;
  } catch { return fallback; }
}
async function kvSet(key, value) {
  try {
    const { kv } = await import('@vercel/kv');
    await kv.set(key, value);
  } catch {}
  return value;
}

function useKV() { return IS_VERCEL && HAS_KV; }

// ── Defaults ──────────────────────────────────────────────────────────────────
export const DEFAULT_SETTINGS = {
  email: '',
  telegramBotToken: '',
  telegramChatId: '',
  weeklyEnabled: true,
  defaultMarket: 'all',
  homepage: {
    badge: 'AI-Powered Investment Team',
    headline: 'ลงทุนฉลาดขึ้น มั่นใจขึ้น\nด้วยทีม AI 9 คน',
    subheadline: 'วิเคราะห์พอร์ตของคุณแบบ real-time ครอบคลุมทุกตลาด US Stocks · SET · Crypto',
    cta: 'เข้าสู่ Mission Control',
    ctaSub: 'ดูพอร์ตและวิเคราะห์ตลาด',
  },
};

// ── Store API (all methods async) ─────────────────────────────────────────────
export const store = {
  async getSettings() {
    const saved = useKV() ? await kvGet('settings', {}) : fileRead('settings', {});
    return { ...DEFAULT_SETTINGS, ...saved };
  },
  async saveSettings(s) {
    const merged = { ...DEFAULT_SETTINGS, ...s };
    useKV() ? await kvSet('settings', merged) : fileWrite('settings', merged);
    return merged;
  },

  async getPortfolio() {
    return useKV() ? await kvGet('portfolio', []) : fileRead('portfolio', []);
  },
  async savePortfolio(p) {
    const val = Array.isArray(p) ? p : [];
    useKV() ? await kvSet('portfolio', val) : fileWrite('portfolio', val);
    return val;
  },

  async getReports() {
    return useKV() ? await kvGet('reports', []) : fileRead('reports', []);
  },
  async addReport(report) {
    const reports = await this.getReports();
    reports.unshift(report);
    const trimmed = reports.slice(0, 100);
    useKV() ? await kvSet('reports', trimmed) : fileWrite('reports', trimmed);
    return trimmed;
  },
};
