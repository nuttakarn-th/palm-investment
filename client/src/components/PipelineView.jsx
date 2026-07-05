import { useState } from 'react';
import { AGENTS, TEAM_COLORS, PIPELINE_STAGES } from '../agents.js';

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
  const { status, text, usage, lastSearch } = state || {};
  if (status === 'done') {
    const tok = (usage?.input ?? 0) + (usage?.output ?? 0);
    return `เสร็จแล้ว ✓  ${tok.toLocaleString()} tokens`;
  }
  if (status === 'error') return '⚠ เกิดข้อผิดพลาด';
  if (status === 'active') {
    const cleaned = (text || '').trim().replace(/^#+\s*/, '').replace(/\*+/g, '');
    if (cleaned.length > 30) return cleaned.slice(0, 100) + (cleaned.length > 100 ? '…' : '');
    if (lastSearch) return `🔍 ${lastSearch}`;
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
        className="rounded-xl flex items-center justify-center font-bold shrink-0"
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
      className={`rounded-xl object-cover shrink-0 bg-black transition-all duration-300 ${
        status === 'pending' ? 'grayscale opacity-40' : ''
      }`}
      onError={() => setFailed(true)}
    />
  );
}

function StatusChip({ status, color }) {
  if (status === 'active')
    return <span className="badge-live text-[10px] font-bold shrink-0" style={{ color }}>● LIVE</span>;
  if (status === 'done')
    return <span className="text-emerald-400 text-[10px] font-bold shrink-0">✓ DONE</span>;
  if (status === 'error')
    return <span className="text-red-500 text-[10px] font-bold shrink-0">⚠ ERROR</span>;
  return <span className="text-neutral-700 text-[10px] shrink-0">○</span>;
}

// Card for all stages — bigger and more readable
function MainCard({ agentKey, state }) {
  const agent = AGENTS[agentKey];
  const color = TEAM_COLORS[agent.team];
  const { status = 'pending' } = state || {};
  const statusText = getStatusText(agentKey, state);

  return (
    <div
      className={`flex-1 min-w-0 rounded-2xl border bg-[#0d0d0d] p-4 transition-all duration-300 ${
        status === 'active'  ? 'card-active' :
        status === 'done'   ? 'border-[#2a2a2a]' :
        status === 'error'  ? 'border-red-700' :
        'border-[#181818]'
      }`}
      style={{ '--team': color }}
    >
      <div className="flex items-center gap-3 mb-3">
        <AgentAvatar agent={agent} size={52} status={status} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="font-bold text-base text-white truncate">{agent.nickname}</span>
            <StatusChip status={status} color={color} />
          </div>
          <div className="text-xs text-neutral-500 truncate">{agent.title}</div>
          <div className="text-[10px] uppercase tracking-wider text-neutral-700 mt-0.5">{agent.model}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full bg-[#1a1a1a] overflow-hidden mb-2.5">
        {status === 'active' && (
          <div className="h-full rounded-full agent-bar-active" style={{ background: color }} />
        )}
        {status === 'done' && (
          <div className="h-full rounded-full bg-emerald-500 w-full transition-all duration-700" />
        )}
      </div>

      <div className={`text-xs leading-relaxed line-clamp-2 ${
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
    <div className="text-[11px] font-bold uppercase tracking-widest text-neutral-600 mb-2">
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
  const progressPct = totalCount > 0
    ? Math.round(((doneCount + activeCount * 0.5) / totalCount) * 100)
    : 0;

  const currentStageIdx = stages.findIndex((s) => s.some((k) => agents[k]?.status === 'active'));
  const currentStage =
    currentStageIdx >= 0
      ? currentStageIdx + 1
      : stages.findIndex((s) => s.some((k) => (agents[k]?.status ?? 'pending') !== 'done')) + 1 || stages.length;

  if (status === 'idle') {
    const groups = [
      { label: 'Research',  keys: ['piya', 'min'],              color: '#4F8EF7' },
      { label: 'Analysis',  keys: ['nem', 'ko'],                color: '#A78BFA' },
      { label: 'Risk',      keys: ['rat', 'lungchai'],          color: '#FB923C' },
      { label: 'Strategy · Committee · Report', keys: ['kaew', 'pom', 'nat'], color: '#34D399' },
    ];
    return (
      <div style={{ borderRadius: '18px', border: '1px solid #181818', background: '#090909', padding: '18px 20px' }}>
        <style>{`
          @keyframes agent-breath { 0%,100%{opacity:.28} 50%{opacity:.72} }
          @keyframes hud-blink { 0%,100%{opacity:1} 49%{opacity:1} 50%{opacity:0} 99%{opacity:0} }
        `}</style>

        {/* header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
            <span style={{ fontSize:'9px', color:'#4F8EF7', animation:'hud-blink 1.2s step-start infinite' }}>■</span>
            <span style={{ fontSize:'10px', letterSpacing:'.14em', color:'#2e2e2e', fontWeight:700, textTransform:'uppercase' }}>Pipeline Status</span>
          </div>
          <span style={{ fontSize:'10px', letterSpacing:'.12em', fontWeight:700, color:'#1e3050' }}>SYSTEM STANDBY</span>
        </div>

        {/* agent groups */}
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {groups.map(({ label, keys, color }, gi) => (
            <div key={label}>
              <div style={{ fontSize:'9px', letterSpacing:'.12em', fontWeight:700, color:`${color}60`, textTransform:'uppercase', marginBottom:'6px' }}>{label}</div>
              <div style={{ display:'flex', gap:'8px' }}>
                {keys.map((k, i) => {
                  const agent = AGENTS[k];
                  return (
                    <div key={k} style={{
                      flex:1, display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'12px',
                      background:`${color}08`, border:`1px solid ${color}20`,
                      animation:`agent-breath 3s ease-in-out ${(gi*2+i)*0.25}s infinite`,
                    }}>
                      <AgentAvatar agent={agent} size={40} status="pending" />
                      <div style={{ minWidth:0, flex:1 }}>
                        <div style={{ fontSize:'13px', fontWeight:700, color:'#3a3a3a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{agent.nickname}</div>
                        <div style={{ fontSize:'10px', color:'#252525', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{agent.title}</div>
                      </div>
                      <span style={{ fontSize:'9px', color:`${color}38`, flexShrink:0, fontWeight:700 }}>○</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* stage pipeline bar */}
        <div style={{ display:'flex', alignItems:'center', marginTop:'16px' }}>
          {PIPELINE_STAGES.full.flatMap((_, i) => [
            i > 0 ? <div key={`l${i}`} style={{ flex:1, height:'1px', background:'#181818' }} /> : null,
            <div key={`s${i}`} style={{
              fontSize:'9px', fontWeight:700, padding:'3px 9px', borderRadius:'99px', flexShrink:0,
              background:'#0d0d0d', border:'1px solid #1c1c1c', color:'#272727',
            }}>S{i+1}</div>,
          ]).filter(Boolean)}
        </div>
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

  const parallelStages = stages.filter((s) => s.length > 1);
  const seqStages     = stages.filter((s) => s.length === 1);
  const parallelCount = parallelStages.length;

  return (
    <div className="space-y-4">
      <style>{`
        .seq-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
        @media (orientation: landscape) { .seq-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>

      {/* Overall progress bar */}
      <div className="flex items-center gap-3">
        <div className="text-[13px] font-bold text-neutral-500 shrink-0 tabular-nums">
          {status === 'done' ? '✓ เสร็จสิ้น' : `Stage ${currentStage} / ${stages.length}`}
        </div>
        <div className="flex-1 h-1.5 bg-[#1e1e1e] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${status === 'done' ? 100 : progressPct}%`,
              background: status === 'done' ? '#34D399' : '#4F8EF7',
            }}
          />
        </div>
        <div className="text-[13px] font-bold text-neutral-500 shrink-0 tabular-nums w-10 text-right">
          {status === 'done' ? '100%' : `${progressPct}%`}
        </div>
      </div>

      {/* Parallel stages — each on its own labeled row */}
      {parallelStages.map((stage, i) => {
        const teamLabel = TEAM_LABEL[AGENTS[stage[0]]?.team] || '';
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

      {/* Sequential stages — 1 col portrait, 2 col landscape */}
      {seqStages.length > 0 && (
        <div className="seq-grid">
          {seqStages.map((stage, i) => {
            const k = stage[0];
            const teamLabel = TEAM_LABEL[AGENTS[k]?.team] || '';
            return (
              <div key={k}>
                <SectionLabel>Stage {parallelCount + i + 1} · {teamLabel}</SectionLabel>
                <MainCard agentKey={k} state={agents[k]} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
