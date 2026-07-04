import { useState } from 'react';
import { AGENTS, TEAM_COLORS, PIPELINE_STAGES } from '../agents.js';

// Contextual status messages per agent — shown while streaming hasn't produced enough text yet
const WORKING_MSG = {
  piya: 'กำลังค้นข้อมูล Macro ตลาดโลก ดัชนี Fed และแนวโน้มเศรษฐกิจ...',
  min: 'กำลังเข้าไปดึงข้อมูลราคา ปริมาณซื้อขาย และข่าวหุ้นในพอร์ต...',
  nem: 'กำลังวิเคราะห์งบกำไร-ขาดทุน P/E และปัจจัยพื้นฐานของหุ้น...',
  ko: 'กำลังอ่าน chart pattern, RSI, MACD และแนวรับ-แนวต้าน...',
  rat: 'กำลังคำนวณ VaR, Beta และ max drawdown ของแต่ละ position...',
  lungchai: 'กำลังประเมิน correlation risk และ portfolio drawdown...',
  kaew: 'กำลังร่าง action plan ตาม risk-return trade-off...',
  pom: 'กำลังสรุปผล investment committee และตัดสินใจขั้นสุดท้าย...',
  nat: 'กำลังจัดทำรายงาน CEO summary ฉบับสมบูรณ์...',
};

const TEAM_LABEL = {
  research: 'Research',
  analysis: 'Analysis',
  risk: 'Risk',
  strategy: 'Strategy',
  committee: 'Committee',
  presenter: 'Report',
};

function getStatusText(agentKey, state) {
  const { status, text, usage } = state || {};
  if (status === 'done') {
    const tok = (usage?.input ?? 0) + (usage?.output ?? 0);
    return `เสร็จแล้ว ✓  ${tok.toLocaleString()} tokens`;
  }
  if (status === 'error') return '⚠ เกิดข้อผิดพลาด';
  if (status === 'active') {
    const cleaned = (text || '').trim().replace(/^#+\s*/, '').replace(/\*+/g, '');
    if (cleaned.length > 30) return cleaned.slice(0, 100) + (cleaned.length > 100 ? '…' : '');
    return WORKING_MSG[agentKey] || 'กำลังทำงาน...';
  }
  return 'รอรับข้อมูลจาก stage ก่อน';
}

function AgentAvatar({ agent, size, status }) {
  const [failed, setFailed] = useState(false);
  const color = TEAM_COLORS[agent.team];
  if (failed) {
    return (
      <div
        className="rounded-lg flex items-center justify-center font-bold shrink-0"
        style={{ width: size, height: size, background: `${color}22`, color, fontSize: Math.round(size / 2.2) }}
      >
        {agent.nickname[0]}
      </div>
    );
  }
  return (
    <img
      src={`/avatars/${agent.avatar}`}
      alt={agent.nickname}
      width={size}
      height={size}
      className={`rounded-lg object-cover shrink-0 bg-black transition-all duration-300 ${
        status === 'pending' ? 'grayscale opacity-40' : ''
      }`}
      onError={() => setFailed(true)}
    />
  );
}

function StatusChip({ status, color }) {
  if (status === 'active')
    return <span className="badge-live text-[9px] font-bold shrink-0" style={{ color }}>● LIVE</span>;
  if (status === 'done')
    return <span className="text-emerald-400 text-[9px] font-bold shrink-0">✓ DONE</span>;
  if (status === 'error')
    return <span className="text-red-500 text-[9px] font-bold shrink-0">⚠ ERROR</span>;
  return <span className="text-neutral-700 text-[9px] shrink-0">○</span>;
}

// Card for parallel stages (stages with 2 agents)
function MainCard({ agentKey, state }) {
  const agent = AGENTS[agentKey];
  const color = TEAM_COLORS[agent.team];
  const { status = 'pending' } = state || {};
  const statusText = getStatusText(agentKey, state);

  return (
    <div
      className={`flex-1 min-w-0 rounded-xl border bg-[#0d0d0d] p-3 transition-all duration-300 ${
        status === 'active'  ? 'card-active' :
        status === 'done'   ? 'border-[#2a2a2a]' :
        status === 'error'  ? 'border-red-700' :
        'border-[#181818]'
      }`}
      style={{ '--team': color }}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <AgentAvatar agent={agent} size={40} status={status} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="font-bold text-sm text-white truncate">{agent.nickname}</span>
            <StatusChip status={status} color={color} />
          </div>
          <div className="text-[11px] text-neutral-500 truncate">{agent.title}</div>
          <div className="text-[9px] uppercase tracking-wider text-neutral-700">{agent.model}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-[3px] rounded-full bg-[#1a1a1a] overflow-hidden mb-2">
        {status === 'active' && (
          <div className="h-full rounded-full agent-bar-active" style={{ background: color }} />
        )}
        {status === 'done' && (
          <div className="h-full rounded-full bg-emerald-500 w-full transition-all duration-700" />
        )}
      </div>

      <div className={`text-[11px] leading-relaxed line-clamp-2 ${
        status === 'done'    ? 'text-emerald-700' :
        status === 'active'  ? 'text-neutral-400' :
        'text-neutral-700'
      }`}>
        {statusText}
      </div>
    </div>
  );
}

// Compact card for sequential stages (1 agent per stage)
function CompactCard({ agentKey, state }) {
  const agent = AGENTS[agentKey];
  const color = TEAM_COLORS[agent.team];
  const { status = 'pending' } = state || {};
  const statusText = getStatusText(agentKey, state);

  return (
    <div
      className={`flex-1 min-w-0 rounded-xl border bg-[#0d0d0d] p-2.5 transition-all duration-300 ${
        status === 'active'  ? 'card-active' :
        status === 'done'   ? 'border-[#2a2a2a]' :
        status === 'error'  ? 'border-red-700' :
        'border-[#181818]'
      }`}
      style={{ '--team': color }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <AgentAvatar agent={agent} size={30} status={status} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="font-bold text-xs text-white truncate">{agent.nickname}</span>
            <StatusChip status={status} color={color} />
          </div>
          <div className="text-[10px] text-neutral-600 truncate">{agent.title}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-[2px] rounded-full bg-[#1a1a1a] overflow-hidden mb-1.5">
        {status === 'active' && (
          <div className="h-full rounded-full agent-bar-active" style={{ background: color }} />
        )}
        {status === 'done' && (
          <div className="h-full rounded-full bg-emerald-500 w-full" />
        )}
      </div>

      <div className={`text-[10px] leading-snug truncate ${
        status === 'done'    ? 'text-emerald-700' :
        status === 'active'  ? 'text-neutral-400' :
        'text-neutral-700'
      }`}>
        {statusText}
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-700 mb-2">
      {children}
    </div>
  );
}

export default function PipelineView({ pipeline, agents, status }) {
  const stages = PIPELINE_STAGES[pipeline] || PIPELINE_STAGES.full;

  const allKeys = stages.flat();
  const doneCount   = allKeys.filter((k) => agents[k]?.status === 'done').length;
  const activeCount = allKeys.filter((k) => agents[k]?.status === 'active').length;
  const totalCount  = allKeys.length;
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const currentStageIdx = stages.findIndex((s) => s.some((k) => agents[k]?.status === 'active'));
  const currentStage =
    currentStageIdx >= 0
      ? currentStageIdx + 1
      : stages.findIndex((s) => s.some((k) => (agents[k]?.status ?? 'pending') !== 'done')) + 1 || stages.length;

  if (status === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="text-4xl mb-3">🎯</div>
        <div className="text-sm font-bold text-neutral-400">พร้อมวิเคราะห์พอร์ตของคุณ</div>
        <div className="text-xs mt-1.5 text-neutral-700">9 agents standby · 7 pipeline stages · 3 ตลาด</div>
      </div>
    );
  }

  const isInitializing =
    status === 'running' &&
    activeCount === 0 &&
    doneCount === 0;

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="text-sm font-bold text-neutral-500 animate-pulse">กำลังเริ่ม pipeline…</div>
      </div>
    );
  }

  // Split into parallel stages (2+ agents) and sequential (1 agent)
  const parallelStages = stages.filter((s) => s.length > 1);
  const seqKeys = stages.filter((s) => s.length === 1).map((s) => s[0]);

  return (
    <div className="space-y-3">
      {/* Overall progress bar */}
      <div className="flex items-center gap-3">
        <div className="text-[11px] font-bold text-neutral-600 shrink-0 tabular-nums">
          {status === 'done' ? '✓ เสร็จสิ้น' : `Stage ${currentStage} / ${stages.length}`}
        </div>
        <div className="flex-1 h-1 bg-[#1e1e1e] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${status === 'done' ? 100 : progressPct}%`,
              background: status === 'done' ? '#34D399' : '#4F8EF7',
            }}
          />
        </div>
        <div className="text-[11px] font-bold text-neutral-600 shrink-0 tabular-nums w-8 text-right">
          {status === 'done' ? '100%' : `${progressPct}%`}
        </div>
      </div>

      {parallelStages.length === 0 ? (
        /* Small pipeline (macro / risk) — all sequential, use MainCards in a row */
        <div>
          <SectionLabel>Pipeline · {TEAM_LABEL[AGENTS[seqKeys[0]]?.team] ?? ''}</SectionLabel>
          <div className="flex gap-3 flex-wrap">
            {seqKeys.map((k) => (
              <MainCard key={k} agentKey={k} state={agents[k]} />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Parallel stage sections */}
          {parallelStages.map((stage, i) => {
            const teamLabel = TEAM_LABEL[AGENTS[stage[0]].team] || stage[0];
            return (
              <div key={i}>
                <SectionLabel>Stage {i + 1} · {teamLabel}</SectionLabel>
                <div className="flex gap-3">
                  {stage.map((k) => (
                    <MainCard key={k} agentKey={k} state={agents[k]} />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Sequential agents — compact horizontal strip */}
          {seqKeys.length > 0 && (
            <div>
              <SectionLabel>Stages {parallelStages.length + 1}–{stages.length} · Sequential</SectionLabel>
              <div className="flex gap-2">
                {seqKeys.map((k) => (
                  <CompactCard key={k} agentKey={k} state={agents[k]} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
