import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fontsource/kanit/700.css';
import '@fontsource/kanit/800.css';
import '@fontsource/kanit/900.css';
import Footer from '../components/Footer.jsx';

const DEFAULT_CONTENT = {
  badge: 'AI-Powered Investment Team',
  headline: 'ลงทุนฉลาดขึ้น มั่นใจขึ้น\nด้วยทีม AI 9 คน',
  subheadline: 'วิเคราะห์พอร์ตของคุณแบบ real-time ครอบคลุมทุกตลาด US Stocks · SET · Crypto',
  cta: 'เข้าสู่ Mission Control',
  ctaSub: 'ดูพอร์ตและวิเคราะห์ตลาด',
};

function getInitialContent() {
  try {
    const local = JSON.parse(localStorage.getItem('palm-os:settings') || '{}');
    if (local.homepage) return { ...DEFAULT_CONTENT, ...local.homepage };
  } catch {}
  return DEFAULT_CONTENT;
}

const PIPELINE_STEPS = [
  { stage: 'Stage 1', agents: 'ปิยะ + มิน',  role: 'Research',       color: '#4F8EF7', avatars: ['piya.jpg', 'min.jpg'] },
  { stage: 'Stage 2', agents: 'เนม + โก้',   role: 'Analysis',       color: '#A78BFA', avatars: ['nem.jpg', 'ko.jpg'] },
  { stage: 'Stage 3', agents: 'รัฐ',          role: 'Position Risk',  color: '#FB923C', avatars: ['rat.jpg'] },
  { stage: 'Stage 4', agents: 'ลุงชาย',       role: 'Portfolio Risk', color: '#FB923C', avatars: ['lungchai.jpg'] },
  { stage: 'Stage 5', agents: 'แก้ว',         role: 'Strategy',       color: '#34D399', avatars: ['kaew.jpg'] },
  { stage: 'Stage 6', agents: 'ป้อม CIO',     role: 'Committee',      color: '#F9A8D4', avatars: ['pom.jpg'] },
  { stage: 'Stage 7', agents: 'นัท',          role: 'Report',         color: '#FCD34D', avatars: ['nat.jpg'] },
];

const MARKETS = [
  {
    flag: '🇺🇸', name: 'US Stocks', color: '#4F8EF7',
    bullets: ['S&P 500 / NASDAQ / Dow', 'Sector rotation analysis', 'Individual stock deep-dive'],
  },
  {
    flag: '🇹🇭', name: 'SET หุ้นไทย', color: '#34D399',
    bullets: ['SET Index & MAI', 'หุ้นไทยรายตัว', 'ปัจจัยเศรษฐกิจไทย'],
  },
  {
    flag: '₿', name: 'Crypto', color: '#FCD34D',
    bullets: ['BTC / ETH / Altcoins', 'On-chain metrics', 'Market sentiment & fear/greed'],
  },
];

// ── Scroll-triggered visibility ───────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

// ── Floating particles canvas ──────────────────────────────────────────────
function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const pts = Array.from({ length: 45 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: -(Math.random() * 0.28 + 0.08),
      r: Math.random() * 1.3 + 0.4,
      a: Math.random() * 0.22 + 0.06,
    }));
    let raf;
    const draw = () => {
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -2) p.y = h + 2;
        if (p.x < -2) p.x = w + 2;
        if (p.x > w + 2) p.x = -2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(79,142,247,${p.a})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <canvas
      ref={ref}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}
    />
  );
}

// ── Digit scramble hook ────────────────────────────────────────────────────
function useScramble(target, active, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => {
      const dur = 1100;
      const s = Date.now();
      let raf;
      const tick = () => {
        const p = Math.min((Date.now() - s) / dur, 1);
        setVal(p < 0.65 ? Math.floor(Math.random() * (target + 6)) : Math.round(p * target));
        if (p < 1) raf = requestAnimationFrame(tick); else setVal(target);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, delay);
    return () => clearTimeout(t);
  }, [active, target, delay]);
  return val;
}

// ── Boot screen ────────────────────────────────────────────────────────────
function BootScreen({ pct, state }) {
  if (state === 'done') return null;
  const label =
    pct < 0.3 ? 'INITIALIZING AGENTS...' :
    pct < 0.6 ? 'LOADING MARKET DATA...' :
    pct < 0.9 ? 'PREPARING ANALYSIS...' :
                'SYSTEM READY ✓';
  const corners = [
    { top: '20px',    left: '20px',  borderTop: '1px solid #1e3a5f', borderLeft: '1px solid #1e3a5f' },
    { top: '20px',    right: '20px', borderTop: '1px solid #1e3a5f', borderRight: '1px solid #1e3a5f' },
    { bottom: '20px', left: '20px',  borderBottom: '1px solid #1e3a5f', borderLeft: '1px solid #1e3a5f' },
    { bottom: '20px', right: '20px', borderBottom: '1px solid #1e3a5f', borderRight: '1px solid #1e3a5f' },
  ];
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: state === 'flash' ? '#0d2a52' : '#000',
      opacity: state === 'fading' ? 0 : 1,
      transition: state === 'fading' ? 'opacity 0.5s ease' : 'background 0.12s ease',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Kanit', sans-serif",
      pointerEvents: state === 'fading' ? 'none' : 'all',
    }}>
      {/* Corner brackets */}
      {corners.map((s, i) => (
        <div key={i} style={{ position: 'absolute', width: '18px', height: '18px', ...s }} />
      ))}

      {/* Logo */}
      <div style={{ marginBottom: '36px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '26px' }}>🎯</span>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '16px', letterSpacing: '0.05em' }}>
          PALM INVESTMENT <span style={{ color: '#4F8EF7' }}>OS</span>
        </span>
      </div>

      {/* Bar */}
      <div style={{ width: '200px', height: '2px', background: '#111', borderRadius: '99px', overflow: 'hidden', marginBottom: '14px' }}>
        <div style={{
          height: '100%', borderRadius: '99px',
          width: `${Math.round(pct * 100)}%`,
          background: 'linear-gradient(90deg, #4F8EF7, #34D399)',
          boxShadow: '0 0 10px rgba(79,142,247,0.9)',
          transition: 'width 0.04s linear',
        }} />
      </div>

      {/* Status */}
      <span style={{ fontSize: '10px', color: '#2e2e2e', letterSpacing: '0.15em' }}>{label}</span>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate  = useNavigate();
  const [content, setContent] = useState(getInitialContent);

  // Boot state: 'loading' → 'flash' → 'fading' → 'done'
  const [bootState, setBootState] = useState('loading');
  const [bootPct,   setBootPct]   = useState(0);

  // Element entrance phases (0 = all hidden, increments stagger)
  const [elem, setElem] = useState(0);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(s => {
        if (!s.homepage) return;
        let localHome = {};
        try {
          const local = JSON.parse(localStorage.getItem('palm-os:settings') || '{}');
          if (local.homepage) localHome = local.homepage;
        } catch {}
        setContent({ ...DEFAULT_CONTENT, ...s.homepage, ...localHome });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const dur = 950;
    const start = Date.now();
    let raf;
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      setBootPct(p);
      if (p < 1) { raf = requestAnimationFrame(tick); return; }

      // Boot sequence timings
      setTimeout(() => setBootState('flash'),  180);
      setTimeout(() => setBootState('fading'), 360);
      setTimeout(() => { setBootState('done'); setElem(1); }, 860);
      setTimeout(() => setElem(2),  1050);
      setTimeout(() => setElem(3),  1280);
      setTimeout(() => setElem(4),  1460);
      setTimeout(() => setElem(5),  1750);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const s9 = useScramble(9, elem >= 5, 0);
  const s7 = useScramble(7, elem >= 5, 180);
  const s3 = useScramble(3, elem >= 5, 360);

  const [pipeRef, pipeInView] = useInView();
  const [mktRef,  mktInView]  = useInView();
  const [hoveredMarket, setHoveredMarket] = useState(null);

  const font = { fontFamily: "'Kanit', sans-serif" };

  // Simple fade-slide-up: hidden before phase, animated once phase reached
  const fadeIn = (phase) => ({
    opacity: elem >= phase ? undefined : 0,
    animation: elem >= phase ? 'fadeSlideUp 0.55s ease forwards' : 'none',
  });

  return (
    <div style={{ background: '#080808', minHeight: '100vh', ...font }}>

      <BootScreen pct={bootPct} state={bootState} />

      <style>{`
        .hero-wrap { height: 100vh; height: 100svh; }
        .pipeline-scroll::-webkit-scrollbar { display: none; }

        /* Tablet portrait only: shrink text area, push image higher to fill the tall viewport */
        @media (min-width: 768px) and (orientation: portrait) {
          .hero-text-block { height: 30% !important; justify-content: flex-start !important; padding-top: 16px !important; }
          .hero-bg-layer   { height: 74% !important; }
          .hero-gradient   { background: linear-gradient(to bottom, #080808 0%, #080808 20%, rgba(8,8,8,0.55) 32%, rgba(8,8,8,0.0) 44%, rgba(8,8,8,0.0) 70%, rgba(8,8,8,0.65) 84%, #080808 95%) !important; }
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glitchIn {
          0%   { opacity: 0; transform: translateY(10px); }
          54%  { opacity: 0; transform: translateY(10px); }
          58%  { opacity: 1; transform: translateY(0) skewX(5deg) scaleX(1.03); filter: brightness(2.5) hue-rotate(40deg); }
          63%  { transform: translateX(-5px) skewX(-3deg) scaleX(0.98); filter: brightness(1.5) hue-rotate(-20deg); }
          68%  { transform: translateX(4px) skewX(1deg); filter: none; }
          75%  { transform: translateX(-2px); }
          82%  { transform: none; }
          90%  { transform: skewX(0.5deg); }
          100% { opacity: 1; transform: none; filter: none; }
        }
@keyframes bounceDown {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(8px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.4; }
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(79,142,247,0); }
          50%      { box-shadow: 0 0 14px 3px rgba(79,142,247,0.2); }
        }
        @keyframes btnRing {
          0%   { box-shadow: 0 0 0 0 rgba(79,142,247,0.5); }
          60%  { box-shadow: 0 0 0 10px rgba(79,142,247,0); }
          100% { box-shadow: 0 0 0 0 rgba(79,142,247,0); }
        }
        @keyframes slideFromRight {
          from { opacity: 0; transform: translateX(28px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9) translateY(14px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes borderShimmer {
          from { background-position: -200% center; }
          to   { background-position: 200% center; }
        }
      `}</style>

      {/* ── HERO ── */}
      <div className="hero-wrap" style={{ position: 'relative', overflow: 'hidden', background: '#080808' }}>

        {/* Layer 1 — BG Image: occupies bottom 55% only (same scale as before) */}
        <div className="hero-bg-layer" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '55%', zIndex: 1 }}>
          {content.bgImage ? (
            <img
              src={content.bgImage} alt="ทีม"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center bottom', display: 'block' }}
              draggable={false}
            />
          ) : (
            <picture>
              <source media="(orientation: portrait)" srcSet="/team-mobile.png" />
              <source media="(orientation: landscape)" srcSet="/team.png" />
              <img
                src="/team.png" alt="ทีม Palm Investment OS"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center bottom', display: 'block' }}
                draggable={false}
              />
            </picture>
          )}
        </div>

        {/* Layer 2 — Gradient: solid dark at top, fades to transparent at image, darkens at bottom */}
        <div className="hero-gradient" style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, #080808 0%, #080808 40%, rgba(8,8,8,0.5) 52%, rgba(8,8,8,0.0) 62%, rgba(8,8,8,0.0) 72%, rgba(8,8,8,0.65) 84%, #080808 95%)',
        }} />

        {/* Layer 3 — Effects: particles */}
        {bootState === 'done' && <Particles />}

        {/* Layer 4 — Content: nav + text + stats as a full-height flex column */}
        <div style={{ position: 'relative', zIndex: 4, height: '100%', display: 'flex', flexDirection: 'column', padding: '0 20px' }}>

          {/* Nav */}
          <nav style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🎯</span>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>
                PALM INVESTMENT <span style={{ color: '#4F8EF7' }}>OS</span>
              </span>
            </div>
            <button
              onClick={() => navigate('/app')}
              style={{
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px', padding: '6px 16px', fontSize: '13px', fontWeight: 600, color: '#fff',
                ...font, cursor: 'pointer',
              }}
            >
              Mission Control →
            </button>
          </nav>

          {/* Text — fills the top 45%, centered */}
          <div className="hero-text-block" style={{
            height: '45%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          }}>

            {/* Badge */}
            <div style={{
              marginBottom: '14px',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              borderRadius: '99px', border: '1px solid rgba(79,142,247,0.4)',
              background: 'rgba(79,142,247,0.1)', padding: '5px 14px',
              ...fadeIn(1),
              animation: elem >= 1 ? 'fadeSlideUp 0.55s ease forwards, badgePulse 3s ease 1s infinite' : 'none',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4F8EF7', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#4F8EF7', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {content.badge}
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              margin: '0 0 10px', lineHeight: 1.15, color: '#fff',
              fontSize: 'clamp(2.4rem, 9vw, 3.6rem)', fontWeight: 800,
              opacity: elem >= 2 ? undefined : 0,
              animation: elem >= 2 ? 'glitchIn 0.8s ease forwards' : 'none',
            }}>
              {content.headline.split('\n').map((line, i) => (
                <span key={i} style={{ display: 'block' }}>{line}</span>
              ))}
            </h1>

            {/* Subheadline */}
            <p style={{
              margin: '0 0 22px', maxWidth: '480px', color: '#888', lineHeight: 1.6, fontSize: '13px',
              whiteSpace: 'pre-line',
              ...fadeIn(3),
            }}>
              {content.subheadline}
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', ...fadeIn(4) }}>
              <button
                onClick={() => navigate('/app')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  background: '#4F8EF7', color: '#fff',
                  border: 'none', borderRadius: '12px', padding: '12px 24px', fontSize: '14px', fontWeight: 700,
                  cursor: 'pointer', whiteSpace: 'nowrap', ...font,
                  animation: elem >= 4 ? 'btnRing 2.8s ease 0.6s infinite' : 'none',
                }}
              >
                ▶ เข้าสู่ระบบ
              </button>
              <button
                onClick={() => navigate('/team')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  background: 'transparent', border: '1px solid rgba(79,142,247,0.35)',
                  borderRadius: '12px', padding: '12px 20px', fontSize: '14px', fontWeight: 600, color: '#4F8EF7',
                  cursor: 'pointer', whiteSpace: 'nowrap', ...font,
                }}
              >
                👥 พบทีม AI
              </button>
            </div>
          </div>

          {/* Stats + scroll — pinned to bottom */}
          <div style={{
            marginTop: 'auto', flexShrink: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
            paddingBottom: '16px',
            opacity: elem >= 5 ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}>
            <div style={{ display: 'flex', gap: '28px', justifyContent: 'center' }}>
              {[
                { val: s9, label: 'AI Agents' },
                { val: s7, label: 'Stages' },
                { val: s3, label: 'ตลาด' },
              ].map(({ val, label }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '32px', fontWeight: 900, color: '#4F8EF7', lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums', minWidth: '2ch', display: 'inline-block',
                  }}>
                    {val}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{label}</div>
                </div>
              ))}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)',
                  borderRadius: '99px', padding: '3px 10px',
                  fontSize: '11px', fontWeight: 700, color: '#34D399',
                }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#34D399', display: 'inline-block', animation: 'pulse 1.8s ease-in-out infinite' }} />
                  Real-time
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', letterSpacing: '0.07em', textTransform: 'uppercase' }}>การวิเคราะห์</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', animation: 'bounceDown 2s ease-in-out infinite' }}>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '9px', letterSpacing: '0.12em' }}>SCROLL</span>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '14px' }}>↓</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── SECTION: HOW IT WORKS (horizontal scroll) ── */}
      <div ref={pipeRef} style={{ padding: '40px 0 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px', padding: '0 20px',
          opacity: pipeInView ? undefined : 0,
          animation: pipeInView ? 'fadeSlideUp 0.5s ease forwards' : 'none',
        }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.2)',
            borderRadius: '99px', padding: '3px 14px',
            fontSize: '10px', fontWeight: 700, color: '#4F8EF7',
            letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px',
          }}>
            วิธีการทำงาน
          </div>
          <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 800, color: '#fff', margin: 0 }}>
            7 ขั้นตอน วิเคราะห์พอร์ตของคุณ
          </h2>
        </div>

        <div className="pipeline-scroll" style={{
          display: 'flex', alignItems: 'center',
          overflowX: 'auto', overflowY: 'visible',
          scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
          padding: '8px 20px 16px',
        }}>
          {PIPELINE_STEPS.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                width: '120px',
                background: '#111', border: `1px solid ${step.color}30`,
                borderRadius: '14px', padding: '14px 10px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                boxShadow: `0 0 0 1px ${step.color}10`,
                opacity: pipeInView ? undefined : 0,
                animation: pipeInView ? `slideFromRight 0.45s ease ${i * 70 + 150}ms forwards` : 'none',
              }}>
                <div style={{ display: 'flex', position: 'relative', height: '44px', justifyContent: 'center' }}>
                  {step.avatars.map((av, j) => (
                    <img
                      key={j} src={`/avatars/${av}`} alt="" width={40} height={40}
                      style={{
                        width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover',
                        border: '2px solid #111', marginLeft: j > 0 ? '-14px' : '0',
                        position: 'relative', zIndex: step.avatars.length - j,
                        outline: `1.5px solid ${step.color}50`,
                      }}
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                  ))}
                </div>
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <div style={{ fontSize: '9px', color: '#555', marginBottom: '3px', letterSpacing: '0.05em' }}>{step.stage}</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: '5px' }}>{step.agents}</div>
                  <div style={{
                    display: 'inline-block',
                    background: `${step.color}18`, borderRadius: '99px',
                    padding: '2px 8px', fontSize: '9px', fontWeight: 700, color: step.color,
                  }}>{step.role}</div>
                </div>
              </div>
              {i < PIPELINE_STEPS.length - 1 && (
                <div style={{ width: '24px', flexShrink: 0, textAlign: 'center', color: '#2a2a2a', fontSize: '16px' }}>→</div>
              )}
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '10px', color: '#2e2e2e', letterSpacing: '0.05em' }}>← เลื่อนดูทั้งหมด →</span>
        </div>
      </div>

      {/* ── SECTION: MARKETS ── */}
      <div ref={mktRef} style={{ background: '#0c0c0c', padding: '36px 16px', borderTop: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px',
            opacity: mktInView ? undefined : 0,
            animation: mktInView ? 'fadeSlideUp 0.5s ease forwards' : 'none',
          }}>
            <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>
              ครอบคลุมทุกตลาด
            </h2>
            <p style={{ color: '#555', fontSize: '12px', margin: 0 }}>วิเคราะห์ได้ทุกตลาดในคำสั่งเดียว</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {MARKETS.map((m, i) => (
              <div
                key={m.name}
                onMouseEnter={() => setHoveredMarket(m.name)}
                onMouseLeave={() => setHoveredMarket(null)}
                style={{
                  background: '#111', borderRadius: '12px', padding: '14px 10px',
                  border: `1px solid ${hoveredMarket === m.name ? m.color + '50' : m.color + '20'}`,
                  borderTop: `3px solid ${m.color}`,
                  boxShadow: hoveredMarket === m.name ? `0 0 22px ${m.color}22` : 'none',
                  transform: hoveredMarket === m.name ? 'translateY(-3px)' : 'none',
                  transition: 'box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease',
                  opacity: mktInView ? undefined : 0,
                  animation: mktInView ? `scaleIn 0.5s ease ${i * 100 + 150}ms forwards` : 'none',
                  cursor: 'default',
              }}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>{m.flag}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', marginBottom: '10px', lineHeight: 1.3 }}>{m.name}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {m.bullets.map((b, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', fontSize: '10px', color: '#666', lineHeight: 1.4 }}>
                      <span style={{ color: m.color, fontSize: '7px', marginTop: '3px', flexShrink: 0 }}>●</span>{b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
