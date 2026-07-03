import { useEffect, useState } from 'react';
import '@fontsource/kanit/700.css';
import '@fontsource/kanit/800.css';
import '@fontsource/kanit/900.css';

const DEFAULT_CONTENT = {
  badge: 'AI-Powered Investment Team',
  headline: 'ลงทุนฉลาดขึ้น มั่นใจขึ้น\nด้วยทีม AI 9 คน',
  subheadline: 'วิเคราะห์พอร์ตของคุณแบบ real-time ครอบคลุมทุกตลาด US Stocks · SET · Crypto',
  cta: 'เข้าสู่ Mission Control',
  ctaSub: 'ดูพอร์ตและวิเคราะห์ตลาด',
};

export default function HomePage({ onEnter }) {
  const [content, setContent] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((s) => { if (s.homepage) setContent({ ...DEFAULT_CONTENT, ...s.homepage }); })
      .catch(() => {});
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">

      {/* ── TEAM IMAGE — bottom, responsive: portrait on mobile, wide on desktop ── */}
      <div className="absolute bottom-0 inset-x-0 pointer-events-none select-none">
        <picture>
          <source media="(max-width: 767px)" srcSet="/team-mobile.png" />
          <source media="(min-width: 768px)" srcSet="/team.png" />
          <img
            src="/team.png"
            alt="ทีม Palm Investment OS"
            className="mx-auto block"
            style={{ maxHeight: '65vh', width: 'auto', maxWidth: '100%', objectFit: 'contain', objectPosition: 'bottom center' }}
            draggable={false}
          />
        </picture>
        {/* top fade: blends into black */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black via-black/70 to-transparent" />
      </div>

      {/* ── NAV ── */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">🎯</span>
          <span className="text-white font-bold tracking-tight text-[14px]">
            PALM INVESTMENT <span className="text-[#4F8EF7]">OS</span>
          </span>
        </div>
        <button
          onClick={onEnter}
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '6px 20px', fontSize: '14px', fontWeight: 600, color: '#fff', fontFamily: "'Kanit', sans-serif", cursor: 'pointer' }}
        >
          Mission Control →
        </button>
      </nav>

      {/* ── CENTERED HERO CONTENT ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-5 pt-6">

        {/* Badge */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#4F8EF7]/40 bg-[#4F8EF7]/10 px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#4F8EF7] animate-pulse" />
          <span className="text-[11px] font-semibold text-[#4F8EF7] tracking-widest uppercase"
            style={{ fontFamily: "'Kanit', sans-serif" }}>
            {content.badge}
          </span>
        </div>

        {/* Headline — Kanit 800, exactly 2 rows, no mid-line wrap */}
        <h1
          className="mb-3 leading-[1.2] tracking-tight text-white text-[2rem] md:text-[2.1rem]"
          style={{
            fontFamily: "'Kanit', sans-serif",
            fontWeight: 800,
          }}
        >
          {content.headline.split('\n').map((line, i) => (
            <span key={i} style={{ whiteSpace: 'nowrap', display: 'block' }}>{line}</span>
          ))}
        </h1>

        {/* Subheadline */}
        <p
          className="mb-6 max-w-lg text-[#777] leading-relaxed"
          style={{ fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)' }}
        >
          {content.subheadline}
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onEnter}
            className="flex items-center gap-2 rounded-xl bg-[#4F8EF7] px-6 py-3 font-bold text-white hover:bg-[#3a7de8] active:scale-95 transition-all shadow-xl shadow-[#4F8EF7]/25"
            style={{ fontFamily: "'Kanit', sans-serif", fontWeight: 700, fontSize: '0.875rem' }}
          >
            <span>▶</span> {content.cta}
          </button>

          <button
            onClick={onEnter}
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/6 backdrop-blur px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/12 hover:text-white transition-all"
            style={{ fontFamily: "'Kanit', sans-serif" }}
          >
            🔍 {content.ctaSub}
          </button>
        </div>
      </div>

    </div>
  );
}
