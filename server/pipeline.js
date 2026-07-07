// Pipeline orchestration — runs the 9-agent investment team with streaming.
import Anthropic from '@anthropic-ai/sdk';
import { ROLES } from './roles/index.js';

const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY from env

const WEB_SEARCH_TOOL = {
  name: 'web_search',
  description:
    'Search the web for current financial news, market data, stock prices, and economic indicators. Use for up-to-date information that training data may not have.',
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query in English for best results (e.g. "NVDA stock price 2025", "Fed rate decision June 2025")',
      },
    },
    required: ['query'],
  },
};

const STOCK_PRICE_TOOL = {
  name: 'get_stock_price',
  description:
    'Get real-time/delayed stock price via Polygon.io (fallback: Yahoo Finance). Returns price, change%, volume, and exact data timestamp. Always use this instead of web_search for price queries. US stocks: "NVDA", "AAPL", "SPY". Crypto: "BTC-USD", "ETH-USD". Indices: "^SPX", "^IXIC", "^VIX". SET stocks: "PTT.BK" (Yahoo fallback).',
  input_schema: {
    type: 'object',
    properties: {
      ticker: {
        type: 'string',
        description: 'Ticker symbol. US stock: "NVDA". Crypto: "BTC-USD". Index: "^SPX". SET: "PTT.BK".',
      },
    },
    required: ['ticker'],
  },
};

// Yahoo Finance fallback (for SET stocks and when Polygon key is absent)
async function yahooPrice(ticker, signal) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d&includePrePost=true`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; palm-investment/1.0)', Accept: 'application/json' },
      signal,
    });
    if (!res.ok) return `[Price unavailable: HTTP ${res.status} for ${ticker}]`;
    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) return `[No data for ${ticker}]`;
    const price = meta.regularMarketPrice;
    const prev = meta.chartPreviousClose;
    const changePct = prev ? ((price - prev) / prev * 100) : null;
    const ts = meta.regularMarketTime
      ? new Date(meta.regularMarketTime * 1000).toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
      : 'unknown';
    const lines = [`${meta.symbol || ticker}: ${price} ${meta.currency || ''}`, `[source: Yahoo Finance]`];
    if (prev) lines.push(`Prev close: ${prev}`);
    if (changePct !== null) lines.push(`Change: ${changePct > 0 ? '+' : ''}${changePct.toFixed(2)}%`);
    if (meta.regularMarketVolume) lines.push(`Volume: ${meta.regularMarketVolume.toLocaleString()}`);
    lines.push(`Market state: ${meta.marketState || 'unknown'}`);
    lines.push(`Data as of: ${ts}`);
    return lines.join('\n');
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    return `[Price error for ${ticker}: ${e.message}]`;
  }
}

function _parsePolygonSnap(data, label) {
  const snap = data?.ticker;
  if (!snap) return null;
  const price = snap.lastTrade?.p ?? snap.day?.c;
  if (price === undefined) return null;
  const ts = snap.updated
    ? new Date(snap.updated / 1e6).toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
    : 'unknown';
  const lines = [`${snap.ticker || label}: ${price}`, `[source: Polygon.io]`];
  if (snap.prevDay?.c) lines.push(`Prev close: ${snap.prevDay.c}`);
  if (snap.todaysChangePerc !== undefined)
    lines.push(`Change: ${snap.todaysChangePerc > 0 ? '+' : ''}${snap.todaysChangePerc.toFixed(2)}%`);
  if (snap.day?.v) lines.push(`Volume: ${snap.day.v.toLocaleString()}`);
  lines.push(`Data as of: ${ts}`);
  return lines.join('\n');
}

async function getStockPrice(ticker, signal) {
  const key = process.env.POLYGON_API_KEY;
  // SET stocks (.BK) — Polygon doesn't cover Thai market; always use Yahoo
  if (!key || ticker.toUpperCase().endsWith('.BK')) return yahooPrice(ticker, signal);

  try {
    const t = ticker.toUpperCase();
    let url, parse;

    if (t.startsWith('^')) {
      // Index: ^SPX → I:SPX
      const idx = `I:${t.slice(1)}`;
      url = `https://api.polygon.io/v3/snapshot/indices?ticker.any_of=${encodeURIComponent(idx)}&apiKey=${key}`;
      parse = (data) => {
        const r = data?.results?.[0];
        if (!r) return null;
        const ts = r.last_updated
          ? new Date(r.last_updated / 1e6).toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
          : 'unknown';
        const lines = [`${r.ticker || idx}: ${r.value}`, `[source: Polygon.io]`];
        if (r.session?.change_percent !== undefined)
          lines.push(`Change: ${r.session.change_percent > 0 ? '+' : ''}${r.session.change_percent.toFixed(2)}%`);
        lines.push(`Data as of: ${ts}`);
        return lines.join('\n');
      };
    } else if (t.includes('-USD') || t.includes('-USDT') || t.startsWith('X:')) {
      // Crypto: BTC-USD → X:BTC-USD
      const ct = t.startsWith('X:') ? t : `X:${t}`;
      url = `https://api.polygon.io/v2/snapshot/locale/global/markets/crypto/tickers/${encodeURIComponent(ct)}?apiKey=${key}`;
      parse = (data) => _parsePolygonSnap(data, ct);
    } else {
      // US stock
      url = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${encodeURIComponent(t)}?apiKey=${key}`;
      parse = (data) => _parsePolygonSnap(data, t);
    }

    const res = await fetch(url, { signal });
    if (!res.ok) return yahooPrice(ticker, signal); // fallback on HTTP error
    const data = await res.json();
    const result = parse(data);
    return result || yahooPrice(ticker, signal); // fallback if parse returns null
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    return yahooPrice(ticker, signal); // fallback on network error
  }
}

async function tavilySearch(query, signal) {
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        search_depth: 'basic',
        max_results: 5,
      }),
      signal,
    });
    if (!res.ok) return `[Search unavailable: HTTP ${res.status}]`;
    const data = await res.json();
    const results = data.results || [];
    if (results.length === 0) return '[No results found]';
    return results
      .map((r, i) => {
        const date = r.published_date ? `${r.published_date.slice(0, 10)} | ` : '';
        return `[${i + 1}] ${r.title}\n${r.url}\n${date}${r.content || ''}`;
      })
      .join('\n\n');
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    return `[Search error: ${e.message}]`;
  }
}

// USD per 1M tokens
const PRICING = {
  'claude-haiku-4-5': { input: 1, output: 5 },
  'claude-sonnet-4-6': { input: 3, output: 15 },
};

// Stage layout per pipeline type (PRD §5.1, §5.4)
export const PIPELINES = {
  // Full: research → analysis → risk → strategy → committee → report (needs portfolio)
  full: [['piya', 'min'], ['nem', 'ko'], ['rat'], ['lungchai'], ['kaew'], ['pom'], ['nat']],
  // Ideas: research → analysis → strategy → committee → report (no portfolio required)
  ideas: [['piya', 'min'], ['nem', 'ko'], ['kaew'], ['pom'], ['nat']],
  macro: [['piya'], ['pom'], ['nat']],
  risk: [['rat'], ['lungchai'], ['pom'], ['nat']],
};

function formatPortfolio(portfolio) {
  if (!portfolio?.length) return '(ปาล์มยังไม่ได้กรอกพอร์ต)';
  return portfolio
    .map((p) => {
      const parts = [
        `${p.ticker} [${(p.market || '').toUpperCase()}]`,
        p.amount ? `ลงทุน ${p.amount} บาท` : null,
        p.buyPrice ? `ราคาซื้อ ${p.buyPrice}` : null,
        p.currentPrice ? `ราคาปัจจุบัน ${p.currentPrice}` : null,
        p.buyDate ? `ซื้อ ${p.buyDate}` : null,
        p.note || null,
      ].filter(Boolean);
      return `- ${parts.join(', ')}`;
    })
    .join('\n');
}

// Which prior outputs each agent needs (keep handoffs lean — PRD §5.3)
const HANDOFF = {
  piya: [],
  min: [],
  nem: ['piya', 'min'],
  ko: ['piya', 'min'],
  rat: ['min', 'nem', 'ko'],
  lungchai: ['rat'],
  kaew: ['piya', 'nem', 'ko', 'rat', 'lungchai'],
  pom: ['piya', 'rat', 'lungchai', 'kaew'],
  nat: ['pom', 'kaew', 'rat'],
};

function buildUserPrompt({ role, command, portfolio, outputs, mode }) {
  const sections = [
    `## คำสั่งจาก CEO (ปาล์ม)\n${command}`,
    `## พอร์ตปัจจุบัน\n${formatPortfolio(portfolio)}`,
  ];
  for (const dep of HANDOFF[role.key] || []) {
    if (outputs[dep]) {
      const r = ROLES[dep];
      sections.push(`## ผลวิเคราะห์จาก ${r.nickname} (${r.title})\n${outputs[dep]}`);
    }
  }
  if (mode === 'weekly') {
    sections.push('## โหมด\nนี่คือ Weekly Report ประจำสัปดาห์ — เน้นรีวิวพอร์ต ความเสี่ยง และแผนสัปดาห์หน้า');
  }
  sections.push('ทำหน้าที่ของคุณตาม role ที่กำหนด ตอบตามรูปแบบผลลัพธ์ กระชับ');
  return sections.join('\n\n');
}

async function runAgent({ role, command, portfolio, outputs, mode, emit, signal }) {
  emit({ type: 'agent_start', agent: role.key });

  const tools = [];
  if (role.usesSearch) {
    tools.push(STOCK_PRICE_TOOL); // no API key needed — always available
    if (process.env.TAVILY_API_KEY) tools.push(WEB_SEARCH_TOOL);
  }
  let messages = [{ role: 'user', content: buildUserPrompt({ role, command, portfolio, outputs, mode }) }];

  let fullText = '';
  const totalUsage = { input: 0, output: 0 };

  const TURN_TIMEOUT = 9 * 60 * 1000; // 9 min per API call — prevents infinite hang

  while (true) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    const stream = anthropic.messages.stream({
      model: role.model,
      max_tokens: role.maxTokens,
      system: role.system,
      tools,
      messages,
    });

    // Abort on main signal OR per-turn timeout
    let turnTimeoutId = setTimeout(() => stream.abort(), TURN_TIMEOUT);
    signal?.addEventListener('abort', () => { clearTimeout(turnTimeoutId); stream.abort(); }, { once: true });

    stream.on('text', (delta) => {
      fullText += delta;
      emit({ type: 'agent_delta', agent: role.key, text: delta });
    });

    let final;
    try {
      final = await stream.finalMessage();
    } finally {
      clearTimeout(turnTimeoutId);
    }

    totalUsage.input += final.usage.input_tokens;
    totalUsage.output += final.usage.output_tokens;

    if (final.stop_reason !== 'tool_use') break;

    const toolResults = [];
    for (const block of final.content) {
      if (block.type !== 'tool_use') continue;
      if (block.name === 'web_search') {
        emit({ type: 'agent_search', agent: role.key, query: block.input.query });
        const result = await tavilySearch(block.input.query, signal);
        toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result });
      } else if (block.name === 'get_stock_price') {
        emit({ type: 'agent_search', agent: role.key, query: `💹 ${block.input.ticker}` });
        const result = await getStockPrice(block.input.ticker, signal);
        toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result });
      }
    }

    if (toolResults.length === 0) break;

    messages = [
      ...messages,
      { role: 'assistant', content: final.content },
      { role: 'user', content: toolResults },
    ];
  }

  const price = PRICING[role.model] || PRICING['claude-haiku-4-5'];
  const cost = (totalUsage.input * price.input + totalUsage.output * price.output) / 1_000_000;

  emit({ type: 'agent_done', agent: role.key, text: fullText, usage: totalUsage, cost });
  return { text: fullText, usage: totalUsage, cost };
}

/**
 * Run a pipeline. `emit(event)` is called for every streaming event.
 * Returns the completed report object.
 */
export async function runPipeline({ command, portfolio = [], pipeline = 'full', mode = 'manual', emit = () => {}, signal }) {
  const stages = PIPELINES[pipeline] || PIPELINES.full;
  const outputs = {};
  const totals = { input: 0, output: 0, cost: 0 };
  const startedAt = Date.now();

  emit({ type: 'pipeline_start', pipeline, stages, startedAt });

  for (let i = 0; i < stages.length; i++) {
    if (signal?.aborted) throw new Error('aborted');
    const stage = stages[i];
    emit({ type: 'stage_start', index: i, agents: stage });

    const results = await Promise.all(
      stage.map((key) =>
        runAgent({ role: ROLES[key], command, portfolio, outputs, mode, emit, signal })
      )
    );

    stage.forEach((key, j) => {
      outputs[key] = results[j].text;
      totals.input += results[j].usage.input;
      totals.output += results[j].usage.output;
      totals.cost += results[j].cost;
    });

    emit({ type: 'stage_done', index: i, totals: { ...totals } });
  }

  const report = {
    id: `rpt_${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    type: mode === 'weekly' ? 'weekly' : pipeline === 'full' ? 'analysis' : pipeline,
    command,
    pipeline,
    summary: outputs.nat || outputs.pom || '',
    finalCall: extractFinalCall(outputs.pom || ''),
    outputs,
    totals,
    durationMs: Date.now() - startedAt,
  };

  emit({ type: 'pipeline_done', report });
  return report;
}

function extractFinalCall(pomText) {
  const m = pomText.match(/Final Call:\**\s*([^\n]+)/i);
  return m ? m[1].replace(/\*/g, '').trim() : '';
}
