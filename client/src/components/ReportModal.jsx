import { AGENTS } from '../agents.js';

export default function ReportModal({ report, onClose }) {
  if (!report) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="w-[680px] max-h-[85vh] overflow-y-auto rounded-2xl border border-[#2a2a2a] bg-[#0d0d0d] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="text-sm font-semibold">{report.command}</div>
            <div className="text-[11px] text-neutral-600 mt-0.5">
              {new Date(report.createdAt).toLocaleString('th-TH')} · {report.type} ·{' '}
              {(report.totals?.input || 0) + (report.totals?.output || 0)} tokens
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white shrink-0">✕</button>
        </div>

        <pre className="whitespace-pre-wrap text-sm text-neutral-300 font-[inherit] border border-[#1e1e1e] rounded-lg p-4 bg-[#0a0a0a]">
          {report.summary}
        </pre>

        {report.outputs && (
          <details className="mt-4">
            <summary className="text-[11px] text-neutral-500 cursor-pointer uppercase tracking-wider">
              ผลวิเคราะห์รายคน ({Object.keys(report.outputs).length} agents)
            </summary>
            <div className="mt-2 space-y-3">
              {Object.entries(report.outputs).map(([k, text]) => (
                <div key={k} className="border border-[#1e1e1e] rounded-lg p-3">
                  <div className="text-xs font-semibold mb-1.5">
                    {AGENTS[k]?.nickname || k} <span className="text-neutral-600 font-normal">— {AGENTS[k]?.title}</span>
                  </div>
                  <pre className="whitespace-pre-wrap text-[11px] text-neutral-400 font-[inherit]">{text}</pre>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
