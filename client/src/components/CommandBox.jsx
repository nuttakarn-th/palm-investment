import { useState } from 'react';
import { PRESETS } from '../agents.js';

export default function CommandBox({ onRun, running }) {
  const [text, setText] = useState('');

  const submit = () => {
    if (!text.trim() || running) return;
    onRun({ command: text.trim(), pipeline: 'full' });
    setText('');
  };

  const runPreset = (preset) => {
    if (running) return;
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
          placeholder="พิมพ์คำสั่งให้ป้อม (CIO)… เช่น วิเคราะห์ NVDA"
          rows={3}
          className="w-full resize-none rounded-lg bg-[#111] border border-[#242424] px-3 py-2 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-[#4F8EF7]"
        />
        <button
          onClick={submit}
          disabled={running || !text.trim()}
          className="mt-1 w-full rounded-lg bg-[#4F8EF7] text-black font-semibold text-sm py-2 disabled:opacity-30 hover:brightness-110 transition"
        >
          {running ? '⏳ ทีมกำลังทำงาน…' : '▶ RUN PIPELINE'}
        </button>
      </div>

      <div>
        <div className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Presets</div>
        <div className="grid grid-cols-2 gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => runPreset(p)}
              disabled={running}
              className="rounded-lg border border-[#242424] bg-[#101010] px-2 py-2 text-left text-[11px] hover:border-neutral-500 disabled:opacity-30 transition"
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
