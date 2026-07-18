/**
 * patternScanner.js
 * Detects 5 chart patterns across US / SET / Crypto watchlists.
 * Grades A/B/C — sends Telegram alert for A and B.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.VERCEL === '1'
  ? '/tmp/palm-data'
  : path.join(__dir, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });
const STORE_FILE = path.join(DATA_DIR, 'patterns.json');

// ── Watchlists ────────────────────────────────────────────────────────────────
export const WATCHLIST = {
  us: [
    'SPY','QQQ','IWM','GLD','TLT',
    'AAPL','MSFT','NVDA','AMZN','GOOGL','META','TSLA',
    'AMD','AVGO','JPM','V','MA','XOM','UNH','LLY',
    'NFLX','COST','PLTR','ORCL','CRM',
  ],
  set: [
    'PTT','PTTEP','ADVANC','INTUCH','CPALL','CPN',
    'SCB','KBANK','BBL','SCC','BDMS','GULF',
    'EA','OR','DELTA','AOT','HANA','MINT',
  ],
  crypto: [
    'BTC','ETH','BNB','SOL','XRP',
    'DOGE','ADA','AVAX','LINK','DOT','LTC','TON',
  ],
};

// ── Persistence ───────────────────────────────────────────────────────────────
function loadStore() {
  try { return JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')); }
  catch { return { results: [], lastScan: null, alertsSent: {} }; }
}
function saveStore(data) {
  try { fs.writeFileSync(STORE_FILE, JSON.stringify(data)); } catch {}
}

// ── Data fetching ─────────────────────────────────────────────────────────────
async function fetchBinance(ticker) {
  const sym = `${ticker.toUpperCase()}USDT`;
  const url = `https://api.binance.com/api/v3/klines?symbol=${sym}&interval=1d&limit=180`;
  const r = await fetch(url, { signal: AbortSignal.timeout(9000) });
  if (!r.ok) throw new Error(`Binance ${r.status}`);
  const rows = await r.json();
  if (!Array.isArray(rows)) throw new Error('unexpected');
  return rows.map(k => ({ ts: k[0] / 1000, o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5] }));
}

async function fetchYahoo(sym) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=6mo&includePrePost=false`;
  const r = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; palm-investment/1.0)' },
    signal: AbortSignal.timeout(9000),
  });
  if (!r.ok) throw new Error(`Yahoo ${r.status}`);
  const data = await r.json();
  const res = data?.chart?.result?.[0];
  if (!res) throw new Error('no result');
  const { timestamp: ts = [] } = res;
  const q = res.indicators?.quote?.[0] || {};
  return ts.map((t, i) => ({
    ts: t, o: q.open?.[i], h: q.high?.[i], l: q.low?.[i], c: q.close?.[i], v: q.volume?.[i],
  })).filter(d => d.c != null && !isNaN(d.c));
}

async function fetchOHLCV(ticker, market) {
  const sym = market === 'set' ? `${ticker}.BK` : ticker;
  return market === 'crypto' ? fetchBinance(ticker) : fetchYahoo(sym);
}

// ── Utility ───────────────────────────────────────────────────────────────────
function localPeaks(arr, win = 5) {
  const mins = [], maxs = [];
  for (let i = win; i < arr.length - win; i++) {
    let isMin = true, isMax = true;
    for (let j = i - win; j <= i + win; j++) {
      if (j === i) continue;
      if (arr[j] < arr[i]) isMin = false;
      if (arr[j] > arr[i]) isMax = false;
      if (!isMin && !isMax) break;
    }
    if (isMin) mins.push({ idx: i, price: arr[i] });
    if (isMax) maxs.push({ idx: i, price: arr[i] });
  }
  return { mins, maxs };
}

function avg(arr) {
  const valid = arr.filter(v => v != null && !isNaN(v));
  return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
}

function linTrend(arr) {
  const n = arr.length;
  if (n < 3) return { slope: 0, r2: 0 };
  const xm = (n - 1) / 2;
  const ym = avg(arr);
  let num = 0, den = 0;
  arr.forEach((y, x) => { num += (x - xm) * (y - ym); den += (x - xm) ** 2; });
  const slope = den ? num / den : 0;
  const ssTot = arr.reduce((a, y) => a + (y - ym) ** 2, 0);
  if (!ssTot) return { slope, r2: 1 };
  const ssRes = arr.reduce((a, y, x) => a + (y - (ym + slope * (x - xm))) ** 2, 0);
  return { slope, r2: Math.max(0, 1 - ssRes / ssTot) };
}

function grade(score) {
  if (score >= 75) return 'A';
  if (score >= 55) return 'B';
  if (score >= 35) return 'C';
  return 'D';
}

function round2(n) { return Math.round(n * 100) / 100; }

// ── Pattern 1: Double Bottom ──────────────────────────────────────────────────
function detectDoubleBottom(ohlcv) {
  const c = ohlcv.map(d => d.c);
  const v = ohlcv.map(d => d.v || 0);
  const n = c.length;
  const { mins } = localPeaks(c, 7);
  if (mins.length < 2) return null;

  let best = null;
  for (let i = 0; i < mins.length - 1; i++) {
    for (let j = i + 1; j < mins.length; j++) {
      const m1 = mins[i], m2 = mins[j];
      const span = m2.idx - m1.idx;
      if (span < 10 || span > 110) continue;
      const pctDiff = Math.abs(m1.price - m2.price) / ((m1.price + m2.price) / 2);
      if (pctDiff > 0.05) continue;

      const neckline = Math.max(...c.slice(m1.idx, m2.idx + 1));
      const avgBot = (m1.price + m2.price) / 2;
      const height = (neckline - avgBot) / avgBot;
      if (height < 0.07) continue;

      const cur = c[n - 1];
      const recovery = (cur - m2.price) / (neckline - m2.price);
      if (recovery < 0.3 || recovery > 1.08) continue;

      const v1 = avg(v.slice(Math.max(0, m1.idx - 3), m1.idx + 4));
      const v2 = avg(v.slice(Math.max(0, m2.idx - 3), m2.idx + 4));
      const volScore  = v2 < v1 ? 25 : v2 < v1 * 1.3 ? 12 : 4;
      const symScore  = Math.max(0, 28 - pctDiff * 500);
      const hgtScore  = Math.min(22, height * 110);
      const recScore  = recovery > 0.55 && recovery < 0.95 ? 25 : 8;
      const total = volScore + symScore + hgtScore + recScore;

      if (!best || total > best.score) {
        best = {
          pattern: 'double_bottom', label: 'Double Bottom', bias: 'bullish',
          score: total, grade: grade(total),
          entry: round2(neckline * 1.005),
          tp:    round2(neckline + (neckline - avgBot)),
          sl:    round2(avgBot * 0.97),
          duration: span,
          meta: { neckline: round2(neckline), support: round2(avgBot), recovery: Math.round(recovery * 100) },
        };
      }
    }
  }
  return best;
}

// ── Pattern 2: Cup & Handle ───────────────────────────────────────────────────
function detectCupHandle(ohlcv) {
  const c = ohlcv.map(d => d.c);
  const v = ohlcv.map(d => d.v || 0);
  const n = c.length;
  if (n < 40) return null;
  const { maxs } = localPeaks(c, 7);
  let best = null;

  for (const leftRim of maxs) {
    if (leftRim.idx < 10 || leftRim.idx > n * 0.55) continue;

    const ahead = c.slice(leftRim.idx, Math.min(n, leftRim.idx + 75));
    const botRel = ahead.indexOf(Math.min(...ahead));
    const botIdx  = leftRim.idx + botRel;
    const botPrice = c[botIdx];
    const depth = (leftRim.price - botPrice) / leftRim.price;
    if (depth < 0.12 || depth > 0.45) continue;

    // Find right rim: recovery to ≥85% of left rim height
    let rightRimIdx = -1;
    for (let k = botIdx + 8; k < Math.min(n - 4, botIdx + 85); k++) {
      if ((c[k] - botPrice) / (leftRim.price - botPrice) >= 0.85) { rightRimIdx = k; break; }
    }
    if (rightRimIdx < 0) continue;
    const rimDiff = Math.abs(c[rightRimIdx] - leftRim.price) / leftRim.price;
    if (rimDiff > 0.09) continue;
    const cupDur = rightRimIdx - leftRim.idx;
    if (cupDur < 12 || cupDur > 110) continue;

    // Roundness: midpoint between left rim and bottom should still be low
    const midIdx = Math.floor((leftRim.idx + botIdx) / 2);
    const roundness = (c[midIdx] - botPrice) / (leftRim.price - botPrice);
    if (roundness > 0.45) continue;

    // Handle: small drift down from right rim
    const handlePrices = c.slice(rightRimIdx);
    const handleLow = Math.min(...handlePrices);
    const handleDrift = handlePrices.length > 1
      ? (c[rightRimIdx] - handleLow) / (leftRim.price - botPrice)
      : 0;
    if (handleDrift > 0.5) continue;

    const cupVol    = avg(v.slice(leftRim.idx, rightRimIdx));
    const handleVol = avg(v.slice(rightRimIdx));
    const volScore    = handleVol < cupVol * 0.8 ? 28 : handleVol < cupVol ? 15 : 4;
    const roundScore  = Math.max(0, 26 - roundness * 58);
    const depthScore  = depth >= 0.15 && depth <= 0.35 ? 24 : 12;
    const handleScore = handleDrift < 0.35 ? 22 : 8;
    const total = volScore + roundScore + depthScore + handleScore;

    if (!best || total > best.score) {
      best = {
        pattern: 'cup_handle', label: 'Cup & Handle', bias: 'bullish',
        score: total, grade: grade(total),
        entry: round2(c[rightRimIdx] * 1.005),
        tp:    round2(c[rightRimIdx] + (c[rightRimIdx] - botPrice)),
        sl:    round2(handleLow * 0.97),
        duration: cupDur,
        meta: { rimPrice: round2(c[rightRimIdx]), bottom: round2(botPrice), depth: Math.round(depth * 100) },
      };
    }
  }
  return best;
}

// ── Pattern 3: Bull Flag ──────────────────────────────────────────────────────
function detectBullFlag(ohlcv) {
  const c = ohlcv.map(d => d.c);
  const v = ohlcv.map(d => d.v || 0);
  const n = c.length;
  let best = null;

  for (let pEnd = 15; pEnd < n - 5; pEnd++) {
    for (let pLen = 5; pLen <= 20; pLen++) {
      const pStart = pEnd - pLen;
      if (pStart < 5) continue;
      const gain = (c[pEnd] - c[pStart]) / c[pStart];
      if (gain < 0.12) continue;

      const poleVol = avg(v.slice(pStart, pEnd));
      const baseVol = avg(v.slice(Math.max(0, pStart - 15), pStart));
      if (poleVol < baseVol * 1.0) continue;

      const flagC = c.slice(pEnd);
      if (flagC.length < 4) continue;
      const { slope, r2 } = linTrend(flagC);
      const slopeN = slope / c[pEnd];
      if (slopeN > 0.003 || slopeN < -0.013) continue;
      if (r2 < 0.2) continue;

      const flagHigh = Math.max(...flagC);
      const flagLow  = Math.min(...flagC);
      const flagRange = (flagHigh - flagLow) / c[pEnd];
      if (flagRange > gain * 0.65) continue;

      const flagVol = avg(v.slice(pEnd));
      const volScore   = flagVol < poleVol * 0.7 ? 28 : flagVol < poleVol ? 15 : 3;
      const gainScore  = Math.min(28, gain * 140);
      const chanScore  = Math.round(r2 * 24);
      const rangeScore = Math.max(0, 20 - flagRange * 240);
      const total = gainScore + chanScore + volScore + rangeScore;

      if (!best || total > best.score) {
        best = {
          pattern: 'bull_flag', label: 'Bull Flag', bias: 'bullish',
          score: total, grade: grade(total),
          entry: round2(flagHigh * 1.005),
          tp:    round2(c[pEnd] + (c[pEnd] - c[pStart])),
          sl:    round2(flagLow * 0.98),
          duration: n - 1 - pStart,
          meta: { poleGain: Math.round(gain * 100), flagLen: flagC.length },
        };
      }
    }
  }
  return best;
}

// ── Pattern 4: Head & Shoulders (bearish reversal) ───────────────────────────
function detectHeadAndShoulders(ohlcv) {
  const c = ohlcv.map(d => d.c);
  const v = ohlcv.map(d => d.v || 0);
  const n = c.length;
  const { maxs } = localPeaks(c, 6);
  if (maxs.length < 3) return null;
  let best = null;

  for (let i = 0; i < maxs.length - 2; i++) {
    const ls = maxs[i], hd = maxs[i + 1], rs = maxs[i + 2];
    if (hd.price <= ls.price || hd.price <= rs.price) continue;
    const shDiff = Math.abs(ls.price - rs.price) / ((ls.price + rs.price) / 2);
    if (shDiff > 0.09) continue;
    const hdHeight = (hd.price - (ls.price + rs.price) / 2) / ((ls.price + rs.price) / 2);
    if (hdHeight < 0.02) continue;
    if (rs.idx < n * 0.4) continue; // right shoulder must be recent

    const t1 = Math.min(...c.slice(ls.idx, hd.idx));
    const t2 = Math.min(...c.slice(hd.idx, rs.idx));
    const neckline = (t1 + t2) / 2;
    const patH = (hd.price - neckline) / neckline;
    if (patH < 0.04) continue;

    const cur = c[n - 1];
    const approaching = cur < rs.price && cur > neckline * 0.96;
    const broken      = cur < neckline;

    const lsVol = avg(v.slice(Math.max(0, ls.idx - 3), ls.idx + 4));
    const hdVol = avg(v.slice(Math.max(0, hd.idx - 3), hd.idx + 4));
    const volScore = hdVol < lsVol ? 24 : hdVol < lsVol * 1.2 ? 12 : 4;
    const symScore = Math.max(0, 28 - shDiff * 290);
    const hgtScore = Math.min(24, patH * 200);
    const posScore = (approaching || broken) ? 24 : 6;
    const total    = volScore + symScore + hgtScore + posScore;

    if (!best || total > best.score) {
      best = {
        pattern: 'head_shoulders', label: 'Head & Shoulders', bias: 'bearish',
        score: total, grade: grade(total),
        entry: round2(neckline * 0.998),
        tp:    round2(neckline - (hd.price - neckline)),
        sl:    round2(rs.price * 1.02),
        duration: rs.idx - ls.idx,
        meta: { head: round2(hd.price), neckline: round2(neckline), shDiff: Math.round(shDiff * 100) },
      };
    }
  }
  return best;
}

// ── Pattern 5: Ascending Triangle ────────────────────────────────────────────
function detectAscendingTriangle(ohlcv) {
  const c = ohlcv.map(d => d.c);
  const h = ohlcv.map(d => d.h || d.c);
  const l = ohlcv.map(d => d.l || d.c);
  const v = ohlcv.map(d => d.v || 0);
  const n = c.length;
  if (n < 30) return null;

  const scanStart = Math.max(0, n - 85);
  const segH = h.slice(scanStart);
  const segL = l.slice(scanStart);
  const segV = v.slice(scanStart);

  const { maxs, mins } = localPeaks(segH, 4);
  if (maxs.length < 2 || mins.length < 2) return null;

  // Flat resistance: find cluster of highs within 3% of the top
  const topMax = Math.max(...maxs.map(m => m.price));
  const touches = maxs.filter(m => Math.abs(m.price - topMax) / topMax < 0.03).length;
  if (touches < 2) return null;

  // Rising support
  const lowPrices = localPeaks(segL, 4).mins.map(m => m.price);
  if (lowPrices.length < 2) return null;
  const { slope: lowSlope, r2: lowR2 } = linTrend(lowPrices);
  if (lowSlope <= 0 || lowR2 < 0.4) return null;

  const lowRise = (lowPrices[lowPrices.length - 1] - lowPrices[0]) / lowPrices[0];
  if (lowRise < 0.025) return null;

  const { slope: volSlope } = linTrend(segV);
  const volScore  = volSlope < 0 ? 24 : 8;
  const resScore  = Math.min(28, touches * 10);
  const supScore  = Math.min(22, lowR2 * 30);
  const convScore = lowRise > 0.06 ? 26 : lowRise > 0.03 ? 14 : 4;
  const total     = resScore + supScore + volScore + convScore;

  const lastLowPrice = lowPrices[lowPrices.length - 1];
  const patH = topMax - lowPrices[0];

  return {
    pattern: 'ascending_triangle', label: 'Ascending Triangle', bias: 'bullish',
    score: total, grade: grade(total),
    entry: round2(topMax * 1.005),
    tp:    round2(topMax + patH),
    sl:    round2(lastLowPrice * 0.97),
    duration: segH.length,
    meta: { resistance: round2(topMax), touches, lowRise: Math.round(lowRise * 100) },
  };
}

// ── Detect all patterns on one OHLCV series ───────────────────────────────────
function detectAll(ohlcv) {
  const detectors = [
    detectDoubleBottom,
    detectCupHandle,
    detectBullFlag,
    detectHeadAndShoulders,
    detectAscendingTriangle,
  ];
  const results = [];
  for (const fn of detectors) {
    try {
      const r = fn(ohlcv);
      if (r && r.grade !== 'D') results.push(r);
    } catch { /* ignore individual detector errors */ }
  }
  return results.sort((a, b) => b.score - a.score);
}

// ── Alert text ────────────────────────────────────────────────────────────────
function alertText(ticker, market, p) {
  const suffix = market === 'set' ? '.SET' : market === 'crypto' ? '' : ' · US';
  const icon = p.grade === 'A' ? (p.bias === 'bullish' ? '🚀' : '🔻') :
               p.grade === 'B' ? (p.bias === 'bullish' ? '📈' : '⬇️') : '📊';
  return [
    `${icon} ${ticker}${suffix} — ${p.label} (Grade ${p.grade})`,
    p.bias === 'bullish' ? '⬆️ Bullish setup' : '⬇️ Bearish reversal',
    `Entry: ${p.entry}  TP: ${p.tp}  SL: ${p.sl}`,
    `Pattern duration: ~${Math.round(p.duration / 5)} weeks`,
    ``,
    `เปิดดูกราฟใน PALM OS`,
  ].join('\n');
}

// ── Main scanner ──────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

export async function scanAll({ telegramFn = null, extraTickers = [] } = {}) {
  const st = loadStore();
  const now = Date.now();
  const newResults = [];

  // Merge watchlist + any extra tickers (e.g. from user portfolio)
  const allTickers = [];
  for (const [market, tickers] of Object.entries(WATCHLIST)) {
    for (const ticker of tickers) allTickers.push({ ticker, market });
  }
  for (const { ticker, market } of extraTickers) {
    if (!allTickers.find(t => t.ticker === ticker && t.market === market)) {
      allTickers.push({ ticker, market });
    }
  }

  for (const { ticker, market } of allTickers) {
    await sleep(250);
    let ohlcv;
    try { ohlcv = await fetchOHLCV(ticker, market); }
    catch { continue; }
    if (!ohlcv || ohlcv.length < 30) continue;

    const patterns = detectAll(ohlcv);
    if (!patterns.length) continue;
    newResults.push({ ticker, market, patterns, scannedAt: now });

    // Telegram alert for A/B — max once per 24h per symbol+pattern
    if (telegramFn) {
      for (const p of patterns) {
        if (p.grade !== 'A' && p.grade !== 'B') continue;
        const key = `${ticker}:${p.pattern}`;
        const last = st.alertsSent?.[key] || 0;
        if (now - last < 24 * 60 * 60 * 1000) continue;
        try { await telegramFn(alertText(ticker, market, p)); } catch {}
        if (!st.alertsSent) st.alertsSent = {};
        st.alertsSent[key] = now;
      }
    }
  }

  st.results = newResults;
  st.lastScan = now;
  saveStore(st);
  return { results: newResults, lastScan: now, count: newResults.length };
}

export function getStoredResults() {
  return loadStore();
}
