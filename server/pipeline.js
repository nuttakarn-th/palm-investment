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

  const tools = role.usesSearch && process.env.TAVILY_API_KEY ? [WEB_SEARCH_TOOL] : [];
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
      if (block.type === 'tool_use' && block.name === 'web_search') {
        emit({ type: 'agent_search', agent: role.key, query: block.input.query });
        const result = await tavilySearch(block.input.query, signal);
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
