// Minimal markdown renderer for the CEO summary (headers, bold, bullets).
function renderMd(md) {
  return md.split('\n').map((line, i) => {
    const bold = (s) =>
      s.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
        part.startsWith('**') ? (
          <strong key={j} className="text-white">
            {part.slice(2, -2)}
          </strong>
        ) : (
          part
        )
      );
    if (line.startsWith('# ')) return <h1 key={i} className="text-lg font-bold text-[#FCD34D] mt-2 mb-2">{bold(line.slice(2))}</h1>;
    if (line.startsWith('## ')) return <h2 key={i} className="text-sm font-semibold text-neutral-200 mt-3 mb-1">{bold(line.slice(3))}</h2>;
    if (line.startsWith('- [ ] ')) return <div key={i} className="text-sm text-neutral-300 ml-1">☐ {bold(line.slice(6))}</div>;
    if (line.startsWith('- ')) return <div key={i} className="text-sm text-neutral-300 ml-1">• {bold(line.slice(2))}</div>;
    if (/^\d+\.\s/.test(line)) return <div key={i} className="text-sm text-neutral-300 ml-1">{bold(line)}</div>;
    if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**'))
      return <div key={i} className="text-[11px] text-neutral-600 italic mt-2">{line.replaceAll('*', '')}</div>;
    if (!line.trim()) return <div key={i} className="h-1.5" />;
    return <div key={i} className="text-sm text-neutral-300">{bold(line)}</div>;
  });
}

export default function CEOSummary({ report, notified, onReset }) {
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

      <div>{renderMd(report.summary)}</div>

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
