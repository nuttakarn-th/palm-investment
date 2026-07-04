import { useState } from 'react';
import { PRESETS } from '../agents.js';

export default function CommandBox({ onRun, running, onCancel }) {
  const [text, setText] = useState('');

  const submit = () => {
    if (!text.trim()) return;
    onRun({ command: text.trim(), pipeline: 'full' });
    setText('');
  };

  const runPreset = (preset) => {
    let ticker = '';
    if (preset.needsTicker) {
      ticker = window.prompt(preset.tickerPrompt || 'Ticker? เช่น NVDA, PTT, BTC') || '';
      if (!ticker.trim()) return;
    }
    onRun({
      command: preset.command(ticker.trim()),
      pipeline: preset.pipeline,
      mode: preset.mode || 'manual',
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Command Box</div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={
            running
              ? 'พิมพ์คำสั่งใหม่เพื่อเริ่มต้นใหม่ทันที…'
              : 'พิมพ์คำสั่งให้ป้อม (CIO)… เช่น วิเคราะห์ NVDA'
          }
          rows={3}
          className="w-full resize-none rounded-lg bg-[#111] border border-[#242424] px-3 py-2 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-[#4F8EF7]"
        />

        <div className="flex gap-1.5 mt-1">
          {running && (
            <button
              onClick={onCancel}
              className="flex-shrink-0 rounded-lg border border-red-900/60 bg-red-950/30 text-red-400 font-semibold text-sm py-2 px-3 hover:bg-red-900/40 hover:text-red-300 transition-all active:scale-95"
            >
              ✕ ยกเลิก
            </button>
          )}
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="flex-1 rounded-lg bg-[#4F8EF7] text-black font-semibold text-sm py-2 disabled:opacity-30 hover:brightness-110 transition active:scale-95"
          >
            {running ? '↺ เริ่มใหม่' : '▶ RUN PIPELINE'}
          </button>
        </div>
      </div>

      <div>
        <div className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Presets</div>
        <div className="grid grid-cols-2 gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => runPreset(p)}
              className="rounded-lg border border-[#242424] bg-[#101010] px-2 py-2 text-left text-[11px] hover:border-neutral-500 transition"
              style={{ opacity: running ? 0.45 : 1 }}
              title={running ? 'กดเพื่อยกเลิกงานปัจจุบันและเริ่มใหม่' : undefined}
            >
              <span className="mr-1">{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
