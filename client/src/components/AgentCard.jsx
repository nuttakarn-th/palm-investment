import { useEffect, useRef, useState } from 'react';
import { AGENTS, TEAM_COLORS } from '../agents.js';

function Avatar({ agent, size = 64, color }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className="flex items-center justify-center rounded-lg font-bold shrink-0"
        style={{ width: size, height: size, background: `${color}22`, color, fontSize: size / 2.4 }}
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
      className="rounded-lg object-cover shrink-0 bg-black"
      onError={() => setFailed(true)}
    />
  );
}

const STATUS_BADGE = {
  pending: <span className="text-neutral-600 text-[10px]">— STANDBY</span>,
  active: <span className="badge-live text-[10px] font-semibold" style={{ color: 'var(--team)' }}>● LIVE</span>,
  done: <span className="text-emerald-400 text-[10px] font-semibold">✓ DONE</span>,
  error: <span className="text-red-500 text-[10px] font-semibold">⚠ ERROR</span>,
};

export default function AgentCard({ agentKey, state }) {
  const agent = AGENTS[agentKey];
  const color = TEAM_COLORS[agent.team];
  const { status = 'pending', text = '', usage } = state || {};
  const bodyRef = useRef(null);

  // auto-scroll streaming text
  useEffect(() => {
    if (status === 'active' && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [text, status]);

  return (
    <div
      className={`w-64 rounded-xl border bg-[#0d0d0d] transition-all duration-300 ${
        status === 'active' ? 'card-active' : status === 'error' ? 'border-red-600' : status === 'done' ? 'border-neutral-700' : 'border-[#222] opacity-70'
      }`}
      style={{ '--team': color }}
    >
      <div className="flex items-center gap-3 p-3">
        <div className={status === 'pending' ? 'grayscale opacity-50' : ''}>
          <Avatar agent={agent} size={48} color={color} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-sm truncate">{agent.nickname}</span>
            {STATUS_BADGE[status]}
          </div>
          <div className="text-[11px] text-neutral-500 truncate">{agent.title}</div>
          <div className="text-[9px] text-neutral-600 uppercase">{agent.model}</div>
        </div>
      </div>

      {(text || status === 'active') && (
        <div
          ref={bodyRef}
          className="border-t border-[#1c1c1c] px-3 py-2 text-[11px] leading-relaxed text-neutral-300 whitespace-pre-wrap max-h-40 overflow-y-auto"
        >
          {text}
          {status === 'active' && <span className="stream-cursor" style={{ color }}>▋</span>}
        </div>
      )}

      {usage && (
        <div className="border-t border-[#1c1c1c] px-3 py-1.5 text-[10px] text-neutral-600">
          {usage.input + usage.output} tokens
        </div>
      )}
    </div>
  );
}
