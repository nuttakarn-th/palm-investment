// Simple JSON-file persistence for settings / portfolio / reports.
// Client keeps its own copy in localStorage; the server copy exists so the
// weekly cron can run without a browser open.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

function file(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function read(name, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file(name), 'utf8'));
  } catch {
    return fallback;
  }
}

function write(name, value) {
  fs.writeFileSync(file(name), JSON.stringify(value, null, 2));
  return value;
}

export const DEFAULT_SETTINGS = {
  email: '',
  telegramBotToken: '',
  telegramChatId: '',
  weeklyEnabled: true,
  defaultMarket: 'all', // us | set | crypto | all
  homepage: {
    badge: 'AI-Powered Investment Team',
    headline: 'วิเคราะห์ลึก\nตัดสินใจเร็ว\nลงทุนมั่นใจ',
    subheadline: 'ทีม AI 9 คน วิเคราะห์พอร์ตโฟลิโอของคุณแบบ real-time ครอบคลุมทุกตลาด US Stocks, SET และ Crypto',
    cta: 'เข้าสู่ Mission Control',
    ctaSub: 'ดูพอร์ตและวิเคราะห์ตลาด',
  },
};

export const store = {
  getSettings: () => ({ ...DEFAULT_SETTINGS, ...read('settings', {}) }),
  saveSettings: (s) => write('settings', { ...DEFAULT_SETTINGS, ...s }),

  getPortfolio: () => read('portfolio', []),
  savePortfolio: (p) => write('portfolio', Array.isArray(p) ? p : []),

  getReports: () => read('reports', []),
  addReport: (report) => {
    const reports = read('reports', []);
    reports.unshift(report);
    // keep the newest 100
    return write('reports', reports.slice(0, 100));
  },
};
