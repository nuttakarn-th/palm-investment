import { useEffect, useRef, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';

import CommandBox from './components/CommandBox.jsx';
import PipelineView from './components/PipelineView.jsx';
import PortfolioPanel from './components/PortfolioPanel.jsx';
import CEOSummary from './components/CEOSummary.jsx';
import ReportHistory from './components/ReportHistory.jsx';
import ReportModal from './components/ReportModal.jsx';
import Settings from './components/Settings.jsx';
import LoginGate from './components/LoginGate.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import PageTransition from './components/PageTransition.jsx';

import HomePage from './pages/HomePage.jsx';
import TeamPage from './pages/TeamPage.jsx';

import PrivacyPage from './pages/PrivacyPage.jsx';
import TermsPage from './pages/TermsPage.jsx';

import { usePipeline } from './hooks/usePipeline.js';
import { usePortfolio } from './hooks/usePortfolio.js';
import { useSettings } from './hooks/useSettings.js';
import { useHistory } from './hooks/useHistory.js';
import { useMarketData } from './hooks/useMarketData.js';

// ── AppPage (Mission Control) ─────────────────────────────────────────────────

function AppPage() {
  const navigate = useNavigate();

  // All hooks unconditionally at top
  const [authState, setAuthState] = useState('checking'); // 'checking' | 'ok' | 'login'
  const pipe = usePipeline();
  const portfolio = usePortfolio();
  const { settings, save } = useSettings();
  const history = useHistory();
  const marketData = useMarketData(portfolio.items);

  const [showSettings, setShowSettings] = useState(false);
  const [openReport, setOpenReport] = useState(null);
  const [health, setHealth] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const summaryRef = useRef(null);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setAuthState(d.authenticated ? 'ok' : 'login'))
      .catch(() => setAuthState('ok'));
  }, []);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ ok: false }));
  }, []);

  useEffect(() => {
    if (pipe.status === 'done' && pipe.report) {
      history.addLocal(pipe.report);
      setTimeout(
        () =>
          summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        300,
      );
    }
  }, [pipe.status, pipe.report]); // eslint-disable-line react-hooks/exhaustive-deps

  const onRun = ({ command, pipeline, mode }) => {
    pipe.run({
      command,
      portfolio: portfolio.items,
      pipeline: pipeline || 'full',
      mode: mode || 'manual',
    });
  };

  const running = pipe.status === 'running';
  const tokens = pipe.totals.input + pipe.totals.output;

  if (authState === 'checking') {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-neutral-600 text-sm animate-pulse">กำลังโหลด...</div>
      </div>
    );
  }
  if (authState === 'login') {
    return <LoginGate onLogin={() => setAuthState('ok')} />;
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* HEADER */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#1a1a1a] bg-[#080808]/90 backdrop-blur px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden rounded border border-[#242424] px-2 py-1.5 text-neutral-400 hover:text-white transition"
          >
            ☰
          </button>
          <img
            src="/avatars/CEO.jpg"
            alt="ปาล์ม (CEO)"
            title="ปาล์ม — CEO"
            className="h-8 w-8 rounded-full object-cover border border-[#333] cursor-pointer hidden sm:block"
            onClick={() => navigate('/')}
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
          <button
            onClick={() => navigate('/')}
            className="font-bold tracking-wider text-sm hover:opacity-80 transition-opacity text-left"
          >
            🎯 PALM <span className="text-[#4F8EF7]">OS</span>
          </button>
          <span className="hidden sm:inline text-[10px] font-bold text-neutral-600 border border-[#242424] rounded px-1.5 py-0.5 uppercase tracking-widest">
            Mission Control
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span
            className={
              running
                ? 'text-[#4F8EF7]'
                : pipe.status === 'error'
                  ? 'text-red-400'
                  : 'hidden sm:inline text-neutral-500'
            }
          >
            {running
              ? '● RUNNING'
              : pipe.status === 'done'
                ? '✓ COMPLETE'
                : pipe.status === 'error'
                  ? '⚠ ERROR'
                  : '○ STANDBY'}
          </span>
          <span className="hidden md:inline text-neutral-500">
            🪙 {tokens.toLocaleString()} · ~${pipe.totals.cost.toFixed(4)}
          </span>
          {health && !health.hasApiKey && (
            <span className="text-red-400" title="ตั้ง ANTHROPIC_API_KEY ใน .env">⚠ NO KEY</span>
          )}
          <button
            onClick={() => navigate('/team')}
            className="hidden sm:inline-flex rounded border border-[#242424] px-2 py-1 text-neutral-400 hover:text-white hover:border-neutral-500 transition"
          >
            👥 ทีม
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="rounded border border-[#242424] px-2 py-1 text-neutral-400 hover:text-white hover:border-neutral-500 transition"
          >
            ⚙️
          </button>
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
              setAuthState('login');
            }}
            className="rounded border border-[#242424] px-2 py-1 text-neutral-600 hover:text-red-400 hover:border-red-800 transition"
            title="ออกจากระบบ"
          >
            ⏏
          </button>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* LEFT SIDEBAR */}
        <aside className={`
          fixed top-0 left-0 h-full z-50 w-72 bg-[#080808] border-r border-[#1a1a1a] p-4 space-y-5 overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:top-auto lg:h-auto lg:z-auto lg:min-h-[calc(100vh-53px)] lg:shrink-0
        `}>
          {/* Close button mobile */}
          <div className="flex items-center justify-between lg:hidden pb-2 border-b border-[#1a1a1a]">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">เมนู</span>
            <button onClick={() => setSidebarOpen(false)} className="text-neutral-500 hover:text-white text-lg">×</button>
          </div>
          <PortfolioPanel portfolio={portfolio} marketData={marketData} />
          <CommandBox onRun={onRun} running={running} onCancel={pipe.cancel} />
          <ReportHistory reports={history.reports} onOpen={setOpenReport} />
        </aside>

        {/* MAIN */}
        <main className="flex-1 p-4 lg:p-6 space-y-6 overflow-x-auto min-w-0">
          <PipelineView pipeline={pipe.pipeline} agents={pipe.agents} status={pipe.status} />

          {/* Onboarding guide — shown when idle and nothing has run yet */}
          {pipe.status === 'idle' && (
            <div className="max-w-2xl mx-auto">
              {portfolio.items.length === 0 ? (
                <div className="rounded-2xl border border-[#1a1a1a] bg-[#0d0d0d] p-6 space-y-5">
                  <div className="text-center mb-2">
                    <div className="text-xs text-neutral-600 uppercase tracking-widest mb-1">เริ่มต้นใช้งาน</div>
                    <div className="text-base font-semibold text-neutral-300">3 ขั้นตอน พร้อมใช้ภายใน 2 นาที</div>
                  </div>
                  {[
                    {
                      n: '1', color: '#4F8EF7',
                      title: 'เพิ่มหุ้นในพอร์ต',
                      desc: 'กด "+ เพิ่ม" ในแถบซ้าย ใส่ Ticker เช่น NVDA, PTT, BTC แล้วใส่ราคาซื้อ — ราคาปัจจุบันดึงอัตโนมัติ',
                      action: () => setSidebarOpen(true),
                      btn: '+ เพิ่มหุ้นตอนนี้',
                    },
                    {
                      n: '2', color: '#34D399',
                      title: 'เลือก Preset หรือพิมพ์คำสั่ง',
                      desc: 'เลือก Preset สำเร็จรูป เช่น "วิเคราะห์หุ้น" หรือพิมพ์คำสั่งเองใน Command Box',
                    },
                    {
                      n: '3', color: '#F59E0B',
                      title: 'กด RUN PIPELINE',
                      desc: 'ทีม AI 9 คนจะทำงานใน 7 ขั้นตอน วิเคราะห์พอร์ตแล้วส่งรายงานให้ภายใน ~2 นาที',
                    },
                  ].map(({ n, color, title, desc, action, btn }) => (
                    <div key={n} className="flex gap-4 items-start">
                      <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ background: `${color}18`, border: `1px solid ${color}40`, color }}>
                        {n}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-neutral-200 mb-0.5">{title}</div>
                        <div className="text-xs text-neutral-600 leading-relaxed">{desc}</div>
                        {btn && (
                          <button onClick={action}
                            className="mt-2 text-xs rounded-lg px-3 py-1.5 font-semibold transition"
                            style={{ background: `${color}18`, border: `1px solid ${color}40`, color }}>
                            {btn}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-[#1a1a1a] bg-[#0d0d0d] p-6">
                  <div className="text-xs text-neutral-600 uppercase tracking-widest mb-3">พอร์ตคุณ</div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {portfolio.items.map((item) => {
                      const live = marketData.getPrice(item.ticker, item.market);
                      const pct = live
                        ? ((live.price - parseFloat(item.buyPrice)) / parseFloat(item.buyPrice)) * 100
                        : null;
                      return (
                        <div key={item.id} className="rounded-lg border border-[#1e1e1e] bg-[#111] px-3 py-2 text-xs">
                          <div className="font-semibold text-neutral-200">{item.ticker}</div>
                          {live && (
                            <div className={`mt-0.5 font-medium ${pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {pct >= 0 ? '+' : ''}{pct?.toFixed(1)}%
                            </div>
                          )}
                          {!live && item.buyPrice && <div className="text-neutral-700 mt-0.5">ราคาซื้อ {item.buyPrice}</div>}
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-xs text-neutral-600">
                    พร้อมแล้ว — เลือก Preset หรือพิมพ์คำสั่งในแถบซ้าย แล้วกด{' '}
                    <span className="text-[#4F8EF7] font-semibold">RUN PIPELINE</span>
                  </div>
                </div>
              )}
            </div>
          )}

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

      {showSettings && (
        <Settings settings={settings} onSave={save} onClose={() => setShowSettings(false)} />
      )}
      <ReportModal report={openReport} onClose={() => setOpenReport(null)} />
    </div>
  );
}

// ── Routes wrapper with transitions ──────────────────────────────────────────

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
      <Route
        path="/"
        element={
          <PageTransition key="home">
            <HomePage />
          </PageTransition>
        }
      />
      <Route
        path="/team"
        element={
          <PageTransition key="team">
            <TeamPage />
          </PageTransition>
        }
      />
      <Route
        path="/app"
        element={
          <PageTransition key="app">
            <AppPage />
          </PageTransition>
        }
      />
      <Route
        path="/privacy"
        element={
          <PageTransition key="privacy">
            <PrivacyPage />
          </PageTransition>
        }
      />
      <Route
        path="/terms"
        element={
          <PageTransition key="terms">
            <TermsPage />
          </PageTransition>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AnimatedRoutes />
      </ErrorBoundary>
    </BrowserRouter>
  );
}
