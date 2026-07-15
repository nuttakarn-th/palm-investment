import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MiniChart from './MiniChart.jsx';

const MD_COMPONENTS = {
  h1: ({ children }) => (
    <h1 className="text-lg font-bold text-[#FCD34D] mt-2 mb-2 leading-snug">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-sm font-semibold text-neutral-200 mt-3 mb-1 leading-snug">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-semibold text-neutral-400 mt-2 mb-0.5 leading-snug">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-sm text-neutral-300 mb-2 leading-relaxed">{children}</p>
  ),
  ul: ({ children }) => <ul className="mb-2 space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 space-y-0.5 list-decimal ml-4">{children}</ol>,
  li: ({ children }) => <li className="text-sm text-neutral-300 ml-3 list-disc">{children}</li>,
  strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
  em: ({ children }) => <em className="text-neutral-500 text-[13px] not-italic">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-[#F59E0B] pl-3 text-neutral-500 text-sm mb-2">{children}</blockquote>
  ),
  pre: ({ children }) => (
    <pre className="mb-3 overflow-x-auto rounded bg-[#111] border border-[#1e1e1e] p-3">{children}</pre>
  ),
  code: ({ className, children }) => {
    const isBlock = /language-/.test(className || '');
    return isBlock ? (
      <code className="text-[13px] font-mono text-neutral-300">{children}</code>
    ) : (
      <code className="bg-[#1a1a1a] rounded px-1 py-0.5 text-[13px] font-mono text-neutral-300">{children}</code>
    );
  },
  table: ({ children }) => (
    <div className="overflow-x-auto mb-3">
      <table className="w-full text-[13px] border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => (
    <th className="text-left text-neutral-400 border-b border-[#242424] pb-1.5 pr-4 font-semibold">{children}</th>
  ),
  td: ({ children }) => (
    <td className="text-neutral-300 border-b border-[#1a1a1a] py-1.5 pr-4">{children}</td>
  ),
  hr: () => <hr className="border-[#1e1e1e] my-3" />,
};

export default function CEOSummary({ report, notified, onReset, portfolio }) {
  if (!report) return null;

  return (
    <div className="rounded-xl border border-[#FCD34D]/30 bg-[#0d0c08] p-5">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="text-[11px] uppercase tracking-widest text-[#FCD34D]">CEO Summary Panel</div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => navigator.clipboard.writeText(report.summary)}
            className="text-[11px] rounded border border-[#333] px-2 py-1 text-neutral-400 hover:text-white"
          >
            📋 Copy
          </button>
          <button
            onClick={onReset}
            className="text-[11px] rounded border border-[#333] px-2 py-1 text-neutral-400 hover:text-white"
          >
            ↺ Standby
          </button>
        </div>
      </div>

      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
        {report.summary}
      </ReactMarkdown>

      {portfolio && portfolio.length > 0 && (
        <div className="mt-5 border-t border-[#1e1e1e] pt-4">
          <div className="text-[10px] uppercase tracking-widest text-neutral-600 mb-3">📈 Price Charts</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {portfolio.map(item => (
              <MiniChart key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#1e1e1e] pt-3 text-[11px] text-neutral-600">
        <span>
          🪙 {(report.totals.input + report.totals.output).toLocaleString()} tokens · ~${report.totals.cost.toFixed(4)}
        </span>
        <span>⏱ {(report.durationMs / 1000).toFixed(1)}s</span>
        {notified?.email && (
          <span title={notified.email.reason || notified.email.error || ''}>
            {notified.email.ok ? '📧 Email ส่งแล้ว' : notified.email.skipped ? '📧 Email ข้าม (ยังไม่ตั้งค่า)' : '📧 Email ล้มเหลว'}
          </span>
        )}
        {notified?.telegram && (
          <span title={notified.telegram.reason || notified.telegram.error || ''}>
            {notified.telegram.ok ? '✈️ Telegram ส่งแล้ว' : notified.telegram.skipped ? '✈️ Telegram ข้าม (ยังไม่ตั้งค่า)' : '✈️ Telegram ล้มเหลว'}
          </span>
        )}
      </div>
    </div>
  );
}
