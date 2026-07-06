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
      <style>{`
        @keyframes mission-glow {
          0%,100% { box-shadow:0 0 20px rgba(79,142,247,0.05),inset 0 1px 0 rgba(79,142,247,0.04); border-color:#1a2233; }
          50%      { box-shadow:0 0 42px rgba(79,142,247,0.14),inset 0 1px 0 rgba(79,142,247,0.1); border-color:rgba(79,142,247,0.28); }
        }
        @keyframes obj-glow {
          0%,100% { box-shadow:0 0 0 0 rgba(79,142,247,0); }
          50%      { box-shadow:0 0 10px 2px rgba(79,142,247,0.22); }
        }
        @keyframes badge-beat {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.75; transform:scale(0.96); }
        }
@keyframes dot-blink {
          0%,100% { opacity:1; } 49%{ opacity:1; } 50%{ opacity:0; } 99%{ opacity:0; }
        }
        @keyframes tick-in {
          from { opacity:0; transform:scale(0.7) translateX(-6px); }
          to   { opacity:1; transform:scale(1) translateX(0); }
        }
      `}</style>
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
          <span className="hidden sm:inline text-[11px] font-bold text-neutral-600 border border-[#242424] rounded px-1.5 py-0.5 uppercase tracking-widest">
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
          fixed top-0 left-0 h-full z-50 w-72 bg-[#080808] border-r border-[#2a2a2a] p-4 space-y-5 overflow-y-auto
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
        <main className="flex-1 p-4 lg:p-6 space-y-6 overflow-x-auto min-w-0"
          style={{ backgroundImage:'radial-gradient(circle,#141414 1px,transparent 1px)', backgroundSize:'28px 28px' }}>
          <PipelineView pipeline={pipe.pipeline} agents={pipe.agents} status={pipe.status} />

          {/* Mission briefing — shown when idle */}
          {pipe.status === 'idle' && (
            <div className="max-w-2xl mx-auto">
              {portfolio.items.length === 0 ? (
                /* ── No portfolio: Mission Briefing card ── */
                <div style={{ position:'relative', overflow:'hidden', borderRadius:'18px', border:'1px solid #1a2233', background:'#090909', padding:'20px', animation:'mission-glow 4s ease-in-out infinite' }}>
                  <div style={{ position:'relative', zIndex:1 }}>
                    {/* header badge */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px' }}>
                      <div style={{ display:'inline-flex', alignItems:'center', gap:'7px', padding:'4px 12px', borderRadius:'99px',
                        border:'1px solid rgba(79,142,247,0.28)', background:'rgba(79,142,247,0.08)',
                        animation:'badge-beat 2.8s ease-in-out infinite' }}>
                        <span style={{ fontSize:'8px', color:'#4F8EF7' }}>◆</span>
                        <span style={{ fontSize:'9px', fontWeight:700, letterSpacing:'.14em', color:'#4F8EF7', textTransform:'uppercase' }}>Mission Briefing</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                        <span style={{ fontSize:'7px', color:'#4F8EF7', animation:'dot-blink 1.2s step-start infinite' }}>●</span>
                        <span style={{ fontSize:'8px', color:'#1e2e44', letterSpacing:'.1em', fontWeight:700 }}>3 OBJECTIVES</span>
                      </div>
                    </div>

                    {/* objectives */}
                    {[
                      { n:'01', color:'#4F8EF7', title:'เพิ่มหุ้นในพอร์ต', desc:'กด "+ เพิ่ม" ในแถบซ้าย ใส่ Ticker เช่น NVDA, PTT, BTC แล้วใส่ราคาซื้อ', action:() => setSidebarOpen(true), btn:'⊕ DEPLOY ASSETS' },
                      { n:'02', color:'#34D399', title:'เลือก Preset หรือพิมพ์คำสั่ง', desc:'เลือก Preset สำเร็จรูป หรือพิมพ์คำสั่งเองใน Command Box' },
                      { n:'03', color:'#FCD34D', title:'กด RUN PIPELINE', desc:'ทีม AI 9 คนทำงาน 7 ขั้นตอน ส่งรายงานภายใน ~2 นาที' },
                    ].map(({ n, color, title, desc, action, btn }, i) => (
                      <div key={n} style={{ display:'flex', gap:'14px', alignItems:'flex-start', marginBottom: i < 2 ? '20px' : 0 }}>
                        <div style={{ flexShrink:0, width:'42px', height:'42px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center',
                          background:`${color}12`, border:`1px solid ${color}35`,
                          animation: n==='01' ? 'obj-glow 2.5s ease-in-out infinite' : undefined }}>
                          <span style={{ fontSize:'13px', fontWeight:900, color, fontVariantNumeric:'tabular-nums' }}>{n}</span>
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:'15px', fontWeight:700, color:'#d8d8d8', marginBottom:'4px' }}>{title}</div>
                          <div style={{ fontSize:'12px', color:'#3a3a3a', lineHeight:1.55 }}>{desc}</div>
                          {btn && (
                            <button onClick={action} style={{
                              marginTop:'12px', fontSize:'11px', fontWeight:800, padding:'8px 20px',
                              borderRadius:'10px', border:`1px solid ${color}45`, background:`${color}12`, color,
                              cursor:'pointer', letterSpacing:'.08em', textTransform:'uppercase',
                              animation:'obj-glow 2.5s ease-in-out infinite',
                            }}>{btn}</button>
                          )}
                        </div>
                        <span style={{ color:`${color}35`, fontSize:'12px', fontWeight:700, flexShrink:0, paddingTop:'10px' }}>▷</span>
                      </div>
                    ))}

                    {/* footer */}
                    <div style={{ marginTop:'18px', borderTop:'1px solid #121212', paddingTop:'12px', display:'flex', alignItems:'center', justifyContent:'center', gap:'7px' }}>
                      <span style={{ fontSize:'8px', color:'#4F8EF7', animation:'dot-blink 1.8s step-start infinite' }}>●</span>
                      <span style={{ fontSize:'9px', color:'#1e2e44', letterSpacing:'.1em', fontWeight:700 }}>AGENTS WAITING FOR ORDERS</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Has portfolio: Active Positions card ── */
                <div style={{ position:'relative', overflow:'hidden', borderRadius:'18px', border:'1px solid #1a2233', background:'#090909', padding:'18px', animation:'mission-glow 5s ease-in-out infinite' }}>
                  <div style={{ position:'relative', zIndex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
                      <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'3px 11px', borderRadius:'99px',
                        border:'1px solid rgba(52,211,153,0.28)', background:'rgba(52,211,153,0.07)' }}>
                        <span style={{ fontSize:'7px', color:'#34D399', animation:'dot-blink 1.4s step-start infinite' }}>●</span>
                        <span style={{ fontSize:'9px', fontWeight:700, letterSpacing:'.12em', color:'#34D399', textTransform:'uppercase' }}>Active Positions</span>
                      </div>
                      <span style={{ fontSize:'9px', color:'#1e2e44', fontWeight:700, letterSpacing:'.1em' }}>{portfolio.items.length} ASSETS LOADED</span>
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'7px', marginBottom:'14px' }}>
                      {portfolio.items.map((item) => {
                        const live = marketData.getPrice(item.ticker, item.market);
                        const pct = live ? ((live.price - parseFloat(item.buyPrice)) / parseFloat(item.buyPrice)) * 100 : null;
                        const pos = pct === null ? null : pct >= 0;
                        return (
                          <div key={item.id} style={{
                            padding:'8px 12px', borderRadius:'10px', background:'#0f0f0f',
                            border:`1px solid ${pos === null ? '#1e1e1e' : pos ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
                            boxShadow: pos === true ? '0 0 10px rgba(52,211,153,0.06)' : pos === false ? '0 0 10px rgba(248,113,113,0.06)' : 'none',
                          }}>
                            <div style={{ fontSize:'12px', fontWeight:700, color:'#d0d0d0', letterSpacing:'.04em' }}>{item.ticker}</div>
                            {pct !== null ? (
                              <div style={{ fontSize:'11px', fontWeight:700, color: pos ? '#34D399' : '#f87171', marginTop:'2px', fontVariantNumeric:'tabular-nums' }}>
                                {pos ? '+' : ''}{pct.toFixed(1)}%
                              </div>
                            ) : item.buyPrice ? (
                              <div style={{ fontSize:'10px', color:'#2a2a2a', marginTop:'2px' }}>฿{item.buyPrice}</div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ fontSize:'11px', color:'#2a3a4a', display:'flex', alignItems:'center', gap:'6px' }}>
                      <span style={{ fontSize:'8px', color:'#4F8EF7', animation:'dot-blink 1.6s step-start infinite' }}>●</span>
                      พร้อม — เลือก Preset หรือพิมพ์คำสั่งในแถบซ้าย แล้วกด
                      <span style={{ color:'#4F8EF7', fontWeight:700 }}>▶ RUN PIPELINE</span>
                    </div>
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
