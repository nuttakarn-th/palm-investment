import { useEffect, useRef, useState } from 'react';
import CommandBox from './components/CommandBox.jsx';
import PipelineView from './components/PipelineView.jsx';
import PortfolioPanel from './components/PortfolioPanel.jsx';
import CEOSummary from './components/CEOSummary.jsx';
import ReportHistory from './components/ReportHistory.jsx';
import ReportModal from './components/ReportModal.jsx';
import Settings from './components/Settings.jsx';
import { usePipeline } from './hooks/usePipeline.js';
import { usePortfolio } from './hooks/usePortfolio.js';
import { useSettings } from './hooks/useSettings.js';
import { useHistory } from './hooks/useHistory.js';

export default function App() {
  const pipe = usePipeline();
  const portfolio = usePortfolio();
  const { settings, save } = useSettings();
  const history = useHistory();

  const [showSettings, setShowSettings] = useState(false);
  const [openReport, setOpenReport] = useState(null);
  const [health, setHealth] = useState(null);
  const summaryRef = useRef(null);

  useEffect(() => {
    fetch('/api/health').then((r) => r.json()).then(setHealth).catch(() => setHealth({ ok: false }));
  }, []);

  // when a run finishes: save to history + scroll to summary
  useEffect(() => {
    if (pipe.status === 'done' && pipe.report) {
      history.addLocal(pipe.report);
      setTimeout(() => summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    }
  }, [pipe.status, pipe.report]); // eslint-disable-line react-hooks/exhaustive-deps

  const onRun = ({ command, pipeline, mode }) => {
    pipe.run({ command, portfolio: portfolio.items, pipeline: pipeline || 'full', mode: mode || 'manual' });
  };

  const running = pipe.status === 'running';
  const tokens = pipe.totals.input + pipe.totals.output;

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* HEADER */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#1a1a1a] bg-[#080808]/90 backdrop-blur px-5 py-3">
        <div className="flex items-center gap-3">
          <img
            src="/avatars/CEO.jpg"
            alt="ปาล์ม (CEO)"
            title="ปาล์ม — CEO"
            className="h-8 w-8 rounded-full object-cover border border-[#333]"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
          <h1 className="font-bold tracking-wide text-sm">
            🎯 PALM INVESTMENT <span className="text-[#4F8EF7]">OS</span>
          </h1>
          <span className="text-[10px] text-neutral-600 border border-[#242424] rounded px-1.5 py-0.5 uppercase">
            Mission Control
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className={running ? 'text-[#4F8EF7]' : pipe.status === 'error' ? 'text-red-400' : 'text-neutral-500'}>
            {running ? '● PIPELINE RUNNING' : pipe.status === 'done' ? '✓ COMPLETE' : pipe.status === 'error' ? '⚠ ERROR' : '○ STANDBY'}
          </span>
          <span className="text-neutral-500">
            🪙 {tokens.toLocaleString()} <span className="text-neutral-700">·</span> ~${pipe.totals.cost.toFixed(4)}
          </span>
          {health && !health.hasApiKey && (
            <span className="text-red-400" title="ตั้ง ANTHROPIC_API_KEY ใน .env แล้ว restart server">
              ⚠ NO API KEY
            </span>
          )}
          <button
            onClick={() => setShowSettings(true)}
            className="rounded border border-[#242424] px-2 py-1 text-neutral-400 hover:text-white hover:border-neutral-500 transition"
          >
            ⚙️ Settings
          </button>
        </div>
      </header>

      <div className="flex">
        {/* LEFT SIDEBAR */}
        <aside className="w-72 shrink-0 border-r border-[#1a1a1a] p-4 space-y-6 min-h-[calc(100vh-53px)]">
          <PortfolioPanel portfolio={portfolio} />
          <CommandBox onRun={onRun} running={running} />
          <ReportHistory reports={history.reports} onOpen={setOpenReport} />
        </aside>

        {/* MAIN */}
        <main className="flex-1 p-6 space-y-6 overflow-x-auto">
          <PipelineView pipeline={pipe.pipeline} agents={pipe.agents} status={pipe.status} />

          {pipe.error && (
            <div className="rounded-xl border border-red-800 bg-red-950/30 p-4 text-sm text-red-300">
              ⚠ Pipeline error: {pipe.error}
              <button onClick={pipe.reset} className="ml-3 underline text-red-400">
                กลับ standby
              </button>
            </div>
          )}

          <div ref={summaryRef}>
            {pipe.status === 'done' && (
              <CEOSummary report={pipe.report} notified={pipe.notified} onReset={pipe.reset} />
            )}
          </div>
        </main>
      </div>

      {showSettings && <Settings settings={settings} onSave={save} onClose={() => setShowSettings(false)} />}
      <ReportModal report={openReport} onClose={() => setOpenReport(null)} />
    </div>
  );
}
