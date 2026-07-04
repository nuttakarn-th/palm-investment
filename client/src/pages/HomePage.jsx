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
  { stage: 'Stage 1', agents: 'ปิยะ + มิน', role: 'Research', color: '#4F8EF7', avatars: ['piya.jpg', 'min.jpg'] },
  { stage: 'Stage 2', agents: 'เนม + โก้', role: 'Analysis', color: '#A78BFA', avatars: ['nem.jpg', 'ko.jpg'] },
  { stage: 'Stage 3', agents: 'รัฐ', role: 'Position Risk', color: '#FB923C', avatars: ['rat.jpg'] },
  { stage: 'Stage 4', agents: 'ลุงชาย', role: 'Portfolio Risk', color: '#FB923C', avatars: ['lungchai.jpg'] },
  { stage: 'Stage 5', agents: 'แก้ว', role: 'Strategy', color: '#34D399', avatars: ['kaew.jpg'] },
  { stage: 'Stage 6', agents: 'ป้อม CIO', role: 'Committee', color: '#F9A8D4', avatars: ['pom.jpg'] },
  { stage: 'Stage 7', agents: 'นัท', role: 'Report', color: '#FCD34D', avatars: ['nat.jpg'] },
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: '20px' }}>
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
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center bottom', display: 'block' }}
              draggable={false}
            />
          ) : (
            <picture>
              <source media="(max-width: 767px)" srcSet="/team-mobile.png" />
              <source media="(min-width: 768px)" srcSet="/team.png" />
              <img
                src="/team.png"
                alt="ทีม Palm Investment OS"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center bottom', display: 'block' }}
                draggable={false}
              />
            </picture>
          )}
          {/* Fade edges */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(to bottom, #080808 0%, transparent 14%, transparent 58%, #080808 100%)',
          }} />
          {/* Stats + scroll — overlaid on bottom gradient */}
          <div style={{
            position: 'absolute', bottom: '16px', left: 0, right: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
            zIndex: 10,
          }}>
            <div style={{ display: 'flex', gap: '28px', justifyContent: 'center' }}>
              {[
                { value: '9', label: 'AI Agents' },
                { value: '7', label: 'Stages' },
                { value: '3', label: 'ตลาด' },
              ].map(({ value, label }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#4F8EF7', lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', marginTop: '3px', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{label}</div>
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
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', marginTop: '3px', letterSpacing: '0.07em', textTransform: 'uppercase' }}>การวิเคราะห์</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', animation: 'bounceDown 2s ease-in-out infinite' }}>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '9px', letterSpacing: '0.12em' }}>SCROLL</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>↓</span>
            </div>
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
      <div style={{ background: '#0c0c0c', borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a', padding: '20px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          {[
            { value: '9', label: 'AI Agents' },
            { value: '7', label: 'Stages' },
            { value: '3', label: 'ตลาด' },
          ].map(({ value, label }) => (
            <div key={label} style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 900, color: '#4F8EF7', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '10px', color: '#555', marginTop: '5px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)',
              borderRadius: '99px', padding: '4px 10px',
              fontSize: '11px', fontWeight: 700, color: '#34D399',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34D399', display: 'inline-block', animation: 'pulse 1.8s ease-in-out infinite' }} />
              Real-time
            </div>
            <div style={{ fontSize: '10px', color: '#555', marginTop: '5px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>การวิเคราะห์</div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: HOW IT WORKS (horizontal scroll) ── */}
      <div style={{ padding: '40px 0 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px', padding: '0 20px' }}>
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

        {/* Horizontal scroll track */}
        <style>{`.pipeline-scroll::-webkit-scrollbar{display:none}`}</style>
        <div className="pipeline-scroll" style={{
          display: 'flex', alignItems: 'center',
          overflowX: 'auto', overflowY: 'visible',
          scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
          padding: '8px 20px 16px',
        }}>
          {PIPELINE_STEPS.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              {/* Card */}
              <div style={{
                width: '120px',
                background: '#111', border: `1px solid ${step.color}30`,
                borderRadius: '14px', padding: '14px 10px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                boxShadow: `0 0 0 1px ${step.color}10`,
              }}>
                {/* Avatars */}
                <div style={{ display: 'flex', position: 'relative', height: '44px', justifyContent: 'center' }}>
                  {step.avatars.map((av, j) => (
                    <img
                      key={j}
                      src={`/avatars/${av}`}
                      alt=""
                      width={40} height={40}
                      style={{
                        width: '40px', height: '40px',
                        borderRadius: '10px', objectFit: 'cover',
                        border: '2px solid #111',
                        marginLeft: j > 0 ? '-14px' : '0',
                        position: 'relative', zIndex: step.avatars.length - j,
                        outline: `1.5px solid ${step.color}50`,
                      }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ))}
                </div>
                {/* Text */}
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
              {/* Arrow */}
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

      {/* ── SECTION 4: MARKETS (3-column compact) ── */}
      <div style={{ background: '#0c0c0c', padding: '36px 16px', borderTop: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>
              ครอบคลุมทุกตลาด
            </h2>
            <p style={{ color: '#555', fontSize: '12px', margin: 0 }}>วิเคราะห์ได้ทุกตลาดในคำสั่งเดียว</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {MARKETS.map((m) => (
              <div key={m.name} style={{
                background: '#111',
                border: `1px solid ${m.color}20`,
                borderTop: `3px solid ${m.color}`,
                borderRadius: '12px', padding: '14px 10px',
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

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}
