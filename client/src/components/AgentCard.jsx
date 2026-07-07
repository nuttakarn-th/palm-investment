import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

const CARD_MD = {
  p: ({ children }) => <p className="text-[11px] text-neutral-300 mb-1 leading-relaxed">{children}</p>,
  h1: ({ children }) => <h1 className="text-[12px] font-bold text-white mt-1 mb-1">{children}</h1>,
  h2: ({ children }) => <h2 className="text-[11px] font-semibold text-neutral-200 mt-1 mb-0.5">{children}</h2>,
  h3: ({ children }) => <h3 className="text-[11px] font-semibold text-neutral-400 mt-1 mb-0.5">{children}</h3>,
  ul: ({ children }) => <ul className="mb-1 space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="mb-1 list-decimal ml-3">{children}</ol>,
  li: ({ children }) => <li className="text-[11px] text-neutral-300 ml-2 list-disc">{children}</li>,
  strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
  em: ({ children }) => <em className="text-neutral-500 not-italic">{children}</em>,
  table: ({ children }) => (
    <div className="overflow-x-auto mb-1 -mx-1">
      <table className="text-[10px] border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => (
    <th className="text-left text-neutral-400 border-b border-[#2a2a2a] pb-1 pr-3 font-semibold whitespace-nowrap">{children}</th>
  ),
  td: ({ children }) => (
    <td className="text-neutral-300 border-b border-[#1a1a1a] py-0.5 pr-3 whitespace-nowrap">{children}</td>
  ),
  code: ({ children }) => (
    <code className="bg-[#1a1a1a] rounded px-0.5 text-[10px] font-mono text-neutral-300">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="overflow-x-auto rounded bg-[#111] border border-[#1e1e1e] p-2 mb-1">{children}</pre>
  ),
  hr: () => <hr className="border-[#1e1e1e] my-1" />,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-[#444] pl-2 text-neutral-500 text-[10px] mb-1">{children}</blockquote>
  ),
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
          className="border-t border-[#1c1c1c] px-3 py-2 max-h-48 overflow-y-auto"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={CARD_MD}>
            {text}
          </ReactMarkdown>
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
