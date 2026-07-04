import '@fontsource/kanit/700.css';
import '@fontsource/kanit/800.css';

const AGENTS = [
  {
    key: 'pom', nickname: 'ป้อม', title: 'CIO — Committee Lead',
    team: 'committee', teamLabel: 'COMMITTEE', teamIcon: '👑',
    model: 'Sonnet', color: '#FCD34D', lv: 'LV.6', featured: true,
    stat: { SPD: 72, DEP: 98, STR: 95 },
  },
  {
    key: 'kaew', nickname: 'แก้ว', title: 'Portfolio Strategist',
    team: 'strategy', teamLabel: 'STRATEGY', teamIcon: '🎯',
    model: 'Sonnet', color: '#34D399', lv: 'LV.5',
    stat: { SPD: 70, DEP: 90, STR: 92 },
  },
  {
    key: 'lungchai', nickname: 'ลุงชาย', title: 'Portfolio Risk Manager',
    team: 'risk', teamLabel: 'RISK', teamIcon: '🛡️',
    model: 'Sonnet', color: '#F97316', lv: 'LV.4',
    stat: { SPD: 68, DEP: 88, STR: 85 },
  },
  {
    key: 'rat', nickname: 'รัฐ', title: 'Position Risk Analyst',
    team: 'risk', teamLabel: 'RISK', teamIcon: '🛡️',
    model: 'Sonnet', color: '#F97316', lv: 'LV.3',
    stat: { SPD: 70, DEP: 85, STR: 82 },
  },
  {
    key: 'nem', nickname: 'เนม', title: 'Fundamental Analyst',
    team: 'analysis', teamLabel: 'ANALYSIS', teamIcon: '📊',
    model: 'Haiku', color: '#A78BFA', lv: 'LV.2',
    stat: { SPD: 92, DEP: 80, STR: 75 },
  },
  {
    key: 'ko', nickname: 'โก้', title: 'Technical Analyst',
    team: 'analysis', teamLabel: 'ANALYSIS', teamIcon: '📊',
    model: 'Haiku', color: '#A78BFA', lv: 'LV.2',
    stat: { SPD: 90, DEP: 78, STR: 74 },
  },
  {
    key: 'piya', nickname: 'ปิยะ', title: 'Macro Researcher',
    team: 'research', teamLabel: 'RESEARCH', teamIcon: '🔍',
    model: 'Haiku', color: '#4F8EF7', lv: 'LV.1',
    stat: { SPD: 95, DEP: 75, STR: 70 },
  },
  {
    key: 'min', nickname: 'มิน', title: 'Data Researcher',
    team: 'research', teamLabel: 'RESEARCH', teamIcon: '🔍',
    model: 'Haiku', color: '#4F8EF7', lv: 'LV.1',
    stat: { SPD: 94, DEP: 74, STR: 70 },
  },
  {
    key: 'nat', nickname: 'นัท', title: 'Report Presenter',
    team: 'presenter', teamLabel: 'PRESENTER', teamIcon: '📢',
    model: 'Haiku', color: '#22D3EE', lv: 'LV.7',
    stat: { SPD: 96, DEP: 70, STR: 88 },
  },
];

function StatBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] text-neutral-500 w-7 shrink-0">{label}</span>
      <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="text-[9px] text-neutral-400 w-5 text-right">{value}</span>
    </div>
  );
}

function AgentCard({ agent }) {
  const isSonnet = agent.model === 'Sonnet';
  return (
    <div
      className="group relative rounded-2xl overflow-hidden transition-all duration-300 cursor-default select-none"
      style={{
        background: 'linear-gradient(160deg, #111 0%, #0a0a0a 100%)',
        border: `1px solid ${agent.color}33`,
        boxShadow: '0 0 0 transparent',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
        e.currentTarget.style.boxShadow = `0 0 32px ${agent.color}55, 0 0 0 1px ${agent.color}66`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '0 0 0 transparent';
      }}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)` }} />

      {/* LV + Model badges */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1">
        <span
          className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded"
          style={{ color: agent.color, background: `${agent.color}18`, border: `1px solid ${agent.color}33` }}
        >
          {agent.lv}
        </span>
        <span
          className="text-[9px] font-semibold tracking-widest px-2 py-0.5 rounded"
          style={{
            color: isSonnet ? '#FCD34D' : '#94a3b8',
            background: isSonnet ? '#FCD34D18' : '#ffffff0d',
            border: `1px solid ${isSonnet ? '#FCD34D33' : '#ffffff15'}`,
          }}
        >
          {isSonnet ? '⚡ SONNET' : '◆ HAIKU'}
        </span>
      </div>

      {/* Avatar */}
      <div className="relative mx-auto flex items-center justify-center px-4 pb-2 pt-1">
        <div
          className="relative w-full rounded-xl overflow-hidden"
          style={{ aspectRatio: '1/1', background: '#161616' }}
        >
          <img
            src={`/avatars/${agent.key}.jpg`}
            alt={agent.nickname}
            className="w-full h-full object-cover"
            onError={e => { e.currentTarget.style.opacity = '0.3'; }}
          />
          {/* bottom gradient over avatar */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
        </div>
      </div>

      {/* Name + Title */}
      <div className="px-3 pb-2 text-center">
        <div
          className="text-xl font-bold leading-tight"
          style={{ fontFamily: "'Kanit', sans-serif", color: '#fff' }}
        >
          {agent.nickname}
        </div>
        <div className="text-[10px] text-neutral-500 leading-snug mb-2">{agent.title}</div>

        {/* Team badge */}
        <div
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest mb-3"
          style={{ color: agent.color, background: `${agent.color}15`, border: `1px solid ${agent.color}30` }}
        >
          <span>{agent.teamIcon}</span> {agent.teamLabel}
        </div>

        {/* Stats */}
        <div className="space-y-1.5">
          <StatBar label="SPD" value={agent.stat.SPD} color={agent.color} />
          <StatBar label="DEP" value={agent.stat.DEP} color={agent.color} />
          <StatBar label="STR" value={agent.stat.STR} color={agent.color} />
        </div>
      </div>

      {/* Bottom accent */}
      <div className="h-px w-full mt-2" style={{ background: `linear-gradient(90deg, transparent, ${agent.color}33, transparent)` }} />
    </div>
  );
}

export default function TeamPage({ onBack, onEnter }) {
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Header */}
      <nav className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#080808]/90 backdrop-blur">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
        >
          ← กลับ
        </button>
        <div className="flex items-center gap-2">
          <span>🎯</span>
          <span className="font-bold tracking-tight text-sm">
            PALM INVESTMENT <span className="text-[#4F8EF7]">OS</span>
          </span>
        </div>
        <button
          onClick={onEnter}
          className="text-sm font-semibold text-[#4F8EF7] hover:text-white transition-colors"
        >
          Mission Control →
        </button>
      </nav>

      {/* Hero */}
      <div className="text-center pt-12 pb-8 px-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#4F8EF7]/30 bg-[#4F8EF7]/8 px-4 py-1.5 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-[#4F8EF7] animate-pulse" />
          <span className="text-[11px] font-semibold text-[#4F8EF7] tracking-widest uppercase">AI AGENT ROSTER</span>
        </div>
        <h1
          className="text-4xl md:text-5xl font-extrabold mb-3"
          style={{ fontFamily: "'Kanit', sans-serif" }}
        >
          พบกับทีม<span className="text-[#4F8EF7]"> AI 9 คน</span>
        </h1>
        <p className="text-neutral-500 text-sm max-w-md mx-auto">
          แต่ละ agent ถูก design มาเพื่อ role เฉพาะ ทำงานต่อเนื่องกัน 7 ขั้นตอน
        </p>
      </div>

      {/* Cards Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {AGENTS.map(agent => (
            <AgentCard key={agent.key} agent={agent} />
          ))}
        </div>

        {/* Pipeline flow hint */}
        <div className="mt-12 rounded-2xl border border-white/5 bg-white/2 p-5">
          <div className="text-xs font-semibold text-neutral-500 mb-3 tracking-widest uppercase">Pipeline Flow</div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: 'Stage 1', agents: 'ปิยะ + มิน', color: '#4F8EF7' },
              { label: 'Stage 2', agents: 'เนม + โก้', color: '#A78BFA' },
              { label: 'Stage 3', agents: 'รัฐ', color: '#F97316' },
              { label: 'Stage 4', agents: 'ลุงชาย', color: '#F97316' },
              { label: 'Stage 5', agents: 'แก้ว', color: '#34D399' },
              { label: 'Stage 6', agents: 'ป้อม CIO', color: '#FCD34D' },
              { label: 'Stage 7', agents: 'นัท', color: '#22D3EE' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px]"
                  style={{ background: `${s.color}12`, border: `1px solid ${s.color}30`, color: s.color }}
                >
                  <span className="font-bold">{s.label}</span>
                  <span className="text-white/50">·</span>
                  <span>{s.agents}</span>
                </div>
                {i < 6 && <span className="text-neutral-700">→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
