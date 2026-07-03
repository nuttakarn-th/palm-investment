import { useEffect, useState } from 'react';
import '@fontsource/kanit/700.css';
import '@fontsource/kanit/800.css';
import '@fontsource/kanit/900.css';

const DEFAULT_CONTENT = {
  badge: 'AI-Powered Investment Team',
  headline: 'วิเคราะห์ลึก ตัดสินใจเร็ว\nลงทุนมั่นใจ',
  subheadline: 'ทีม AI 9 คน วิเคราะห์พอร์ตของคุณแบบ real-time ครอบคลุม US Stocks · SET · Crypto',
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

      {/* ── TEAM IMAGE — bottom, full width ── */}
      <div className="absolute bottom-0 inset-x-0 h-[62%] pointer-events-none select-none">
        <img
          src="/team.png"
          alt="ทีม Palm Investment OS"
          className="w-full h-full object-cover object-top"
          draggable={false}
        />
        {/* top fade: image melts into black */}
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black via-black/80 to-transparent" />
        {/* subtle bottom vignette */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
        {/* side darkening */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black/60 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black/60 to-transparent" />
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
          className="rounded-lg border border-white/20 bg-white/8 backdrop-blur px-5 py-2 text-sm font-semibold text-white hover:bg-white/15 transition-colors"
          style={{ fontFamily: "'Kanit', sans-serif" }}
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

        {/* Headline — Kanit, centered, large */}
        <h1
          className="mb-4 whitespace-pre-line leading-[1.05] tracking-tight text-white"
          style={{
            fontFamily: "'Kanit', sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(2.6rem, 6.5vw, 5rem)',
          }}
        >
          {content.headline}
        </h1>

        {/* Subheadline */}
        <p
          className="mb-7 max-w-lg text-[#777] leading-relaxed"
          style={{ fontSize: 'clamp(0.85rem, 1.4vw, 1rem)' }}
        >
          {content.subheadline}
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onEnter}
            className="flex items-center gap-2 rounded-xl bg-[#4F8EF7] px-7 py-3.5 font-bold text-white hover:bg-[#3a7de8] active:scale-95 transition-all shadow-xl shadow-[#4F8EF7]/25"
            style={{ fontFamily: "'Kanit', sans-serif", fontWeight: 700, fontSize: '0.95rem' }}
          >
            <span>▶</span> {content.cta}
          </button>

          <button
            onClick={onEnter}
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/6 backdrop-blur px-6 py-3.5 text-sm font-semibold text-white/80 hover:bg-white/12 hover:text-white transition-all"
            style={{ fontFamily: "'Kanit', sans-serif" }}
          >
            🔍 {content.ctaSub}
          </button>
        </div>
      </div>

    </div>
  );
}
