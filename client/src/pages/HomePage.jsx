import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  { stage: 'Stage 1', agents: 'ปิยะ + มิน', role: 'Research', color: '#4F8EF7' },
  { stage: 'Stage 2', agents: 'เนม + โก้', role: 'Analysis', color: '#A78BFA' },
  { stage: 'Stage 3', agents: 'รัฐ', role: 'Position Risk', color: '#F97316' },
  { stage: 'Stage 4', agents: 'ลุงชาย', role: 'Portfolio Risk', color: '#F97316' },
  { stage: 'Stage 5', agents: 'แก้ว', role: 'Strategy', color: '#34D399' },
  { stage: 'Stage 6', agents: 'ป้อม CIO', role: 'Committee', color: '#FCD34D' },
  { stage: 'Stage 7', agents: 'นัท', role: 'Report', color: '#22D3EE' },
];

const MARKETS = [
  {
    flag: '🇺🇸',
    name: 'US Stocks',
    color: '#4F8EF7',
    bullets: [
      'S&P 500 / NASDAQ / Dow',
      'Sector rotation analysis',
      'Individual stock deep-dive',
    ],
  },
  {
    flag: '🇹🇭',
    name: 'SET หุ้นไทย',
    color: '#34D399',
    bullets: [
      'SET Index & MAI',
      'หุ้นไทยรายตัว',
      'ปัจจัยเศรษฐกิจไทย',
    ],
  },
  {
    flag: '₿',
    name: 'Crypto',
    color: '#FCD34D',
    bullets: [
      'BTC / ETH / Altcoins',
      'On-chain metrics',
      'Market sentiment & fear/greed',
    ],
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [content, setContent] = useState(getInitialContent);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((s) => {
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

  const font = { fontFamily: "'Kanit', sans-serif" };

  return (
    <div style={{ background: '#080808', minHeight: '100vh', ...font }}>

      {/* ── SECTION 1: HERO ── */}
      <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#080808' }}>

        {/* ── TEXT ZONE (solid dark — no image underneath) ── */}
        <div style={{ flexShrink: 0, padding: '0 20px 20px' }}>

          {/* Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🎯</span>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>
                PALM INVESTMENT <span style={{ color: '#4F8EF7' }}>OS</span>
              </span>
            </div>
            <button
              onClick={() => navigate('/app')}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px', padding: '6px 16px',
                fontSize: '13px', fontWeight: 600, color: '#fff',
                ...font, cursor: 'pointer',
              }}
            >
              Mission Control →
            </button>
          </nav>

          {/* Content */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: '4px' }}>
            {/* Badge */}
            <div style={{
              marginBottom: '14px',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              borderRadius: '99px',
              border: '1px solid rgba(79,142,247,0.4)',
              background: 'rgba(79,142,247,0.1)',
              padding: '5px 14px',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4F8EF7', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#4F8EF7', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {content.badge}
              </span>
            </div>

            {/* Headline */}
            <h1 style={{ margin: '0 0 10px', lineHeight: 1.2, color: '#fff', fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', fontWeight: 800 }}>
              {content.headline.split('\n').map((line, i) => (
                <span key={i} style={{ display: 'block' }}>{line}</span>
              ))}
            </h1>

            {/* Sub */}
            <p style={{ margin: '0 0 22px', maxWidth: '480px', color: '#666', lineHeight: 1.6, fontSize: '13px' }}>
              {content.subheadline}
            </p>

            {/* CTAs — side by side */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', width: '100%', maxWidth: '400px' }}>
              <button
                onClick={() => navigate('/app')}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  background: '#4F8EF7', color: '#fff',
                  border: 'none', borderRadius: '12px',
                  padding: '12px 16px', fontSize: '14px', fontWeight: 700,
                  cursor: 'pointer', ...font,
                  boxShadow: '0 8px 24px rgba(79,142,247,0.35)',
                }}
              >
                ▶ เข้าสู่ระบบ
              </button>
              <button
                onClick={() => navigate('/team')}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  background: 'transparent',
                  border: '1px solid rgba(79,142,247,0.35)',
                  borderRadius: '12px', padding: '12px 16px',
                  fontSize: '14px', fontWeight: 600, color: '#4F8EF7',
                  cursor: 'pointer', ...font,
                }}
              >
                👥 พบทีม AI
              </button>
            </div>
          </div>
        </div>

        {/* ── IMAGE ZONE (no text overlay) ── */}
        <div style={{ flex: 1, minHeight: '320px', position: 'relative', overflow: 'hidden' }}>
          {content.bgImage ? (
            <img
              src={content.bgImage}
              alt="ทีม"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
              draggable={false}
            />
          ) : (
            <picture>
              <source media="(max-width: 767px)" srcSet="/team-mobile.png" />
              <source media="(min-width: 768px)" srcSet="/team.png" />
              <img
                src="/team.png"
                alt="ทีม Palm Investment OS"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
                draggable={false}
              />
            </picture>
          )}
          {/* Fade edges — top blends into dark text zone, bottom into next section */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(to bottom, #080808 0%, transparent 18%, transparent 72%, #080808 100%)',
          }} />
          {/* Scroll hint */}
          <div style={{
            position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            animation: 'bounceDown 2s ease-in-out infinite', zIndex: 10,
          }}>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '0.12em' }}>SCROLL</span>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '18px' }}>↓</span>
          </div>
        </div>

        <style>{`
          @keyframes bounceDown {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50% { transform: translateX(-50%) translateY(8px); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </div>

      {/* ── SECTION 2: STATS BAR ── */}
      <div style={{ background: '#0c0c0c', borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a', padding: '40px 32px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '32px', justifyContent: 'space-around', alignItems: 'center' }}>
          {[
            { value: '9', label: 'AI Agents' },
            { value: '7', label: 'Pipeline Stages' },
            { value: '3', label: 'ตลาด' },
          ].map(({ value, label }) => (
            <div key={label} style={{ textAlign: 'center', flex: '1 1 120px' }}>
              <div style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', fontWeight: 900, color: '#4F8EF7', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '12px', color: '#555', marginTop: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
          <div style={{ textAlign: 'center', flex: '1 1 120px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)',
              borderRadius: '99px', padding: '6px 14px',
              fontSize: '13px', fontWeight: 700, color: '#34D399',
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#34D399', display: 'inline-block', animation: 'pulse 1.8s ease-in-out infinite' }} />
              Real-time
            </div>
            <div style={{ fontSize: '12px', color: '#555', marginTop: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>การวิเคราะห์</div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: HOW IT WORKS ── */}
      <div style={{ padding: '80px 32px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(79,142,247,0.1)',
            border: '1px solid rgba(79,142,247,0.2)',
            borderRadius: '99px', padding: '4px 16px',
            fontSize: '11px', fontWeight: 700,
            color: '#4F8EF7', letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '16px',
          }}>
            วิธีการทำงาน
          </div>
          <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: '#fff' }}>
            7 ขั้นตอน วิเคราะห์พอร์ตของคุณ
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>
          {PIPELINE_STEPS.map((step, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '480px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '20px',
                background: '#111', border: '1px solid #1e1e1e',
                borderRadius: '14px', padding: '16px 24px',
                width: '100%', boxSizing: 'border-box',
              }}>
                {/* Dot */}
                <div style={{
                  width: '14px', height: '14px', borderRadius: '50%',
                  background: step.color, flexShrink: 0,
                  boxShadow: `0 0 12px ${step.color}60`,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: '#555', marginBottom: '2px' }}>{step.stage}</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{step.agents}</div>
                  <div style={{ fontSize: '12px', color: step.color, fontWeight: 600 }}>{step.role}</div>
                </div>
              </div>
              {/* Connector */}
              {i < PIPELINE_STEPS.length - 1 && (
                <div style={{
                  width: '2px', height: '24px',
                  background: `linear-gradient(to bottom, ${step.color}60, ${PIPELINE_STEPS[i + 1].color}60)`,
                }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 4: MARKETS ── */}
      <div style={{ background: '#0c0c0c', padding: '80px 32px', borderTop: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: '#fff' }}>
              ครอบคลุมทุกตลาด
            </h2>
            <p style={{ color: '#555', fontSize: '14px', marginTop: '8px' }}>
              วิเคราะห์ได้ทุกตลาดในคำสั่งเดียว
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
            {MARKETS.map((m) => (
              <div
                key={m.name}
                style={{
                  flex: '1 1 260px', maxWidth: '320px',
                  background: '#111', border: `1px solid #1e1e1e`,
                  borderRadius: '16px', padding: '28px 24px',
                }}
              >
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>{m.flag}</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>{m.name}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {m.bullets.map((b, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#888' }}>
                      <span style={{ color: m.color, fontSize: '10px' }}>●</span> {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}
