const TYPE_ICON = { analysis: '📊', weekly: '📅', macro: '📰', risk: '⚠️', test: '🧪' };

export default function ReportHistory({ reports, onOpen }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Report History</div>

      {reports.length === 0 && <div className="text-[11px] text-neutral-700">ยังไม่มีรายงาน</div>}

      <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
        {reports.map((r) => (
          <button
            key={r.id}
            onClick={() => onOpen(r)}
            className="block w-full rounded-lg border border-[#1c1c1c] bg-[#0e0e0e] px-2.5 py-2 text-left hover:border-neutral-600 transition"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="truncate text-neutral-300">
                {TYPE_ICON[r.type] || '📄'} {r.command}
              </span>
            </div>
            <div className="flex items-center justify-between mt-0.5 text-[10px] text-neutral-600">
              <span>{new Date(r.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}</span>
              {r.finalCall && <span className="text-[#FCD34D] truncate ml-2">{r.finalCall}</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
