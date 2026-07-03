import { useEffect, useState } from 'react';
import '@fontsource/kanit/700.css';
import '@fontsource/kanit/800.css';
import '@fontsource/kanit/900.css';

const DEFAULT_CONTENT = {
  badge: 'AI-Powered Investment Team',
  headline: 'วิเคราะห์ลึก\nตัดสินใจเร็ว\nลงทุนมั่นใจ',
  subheadline: 'ทีม AI 9 คน วิเคราะห์พอร์ตของคุณแบบ real-time\nครอบคลุม US Stocks · SET · Crypto',
  cta: 'เข้าสู่ Mission Control',
};

const STATS = [
  { value: '9', label: 'AI Agents' },
  { value: '3', label: 'ตลาดลงทุน' },
  { value: '7', label: 'Pipeline Stages' },
  { value: '24/7', label: 'พร้อมวิเคราะห์' },
];

export default function HomePage({ onEnter }) {
  const [content, setContent] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((s) => { if (s.homepage) setContent({ ...DEFAULT_CONTENT, ...s.homepage }); })
      .catch(() => {});
  }, []);

  return (
    <div
      className="relative h-screen w-full overflow-hidden bg-black"
      style={{ fontFamily: 'system-ui, sans-serif' }}
    >
      {/* ─── TEAM IMAGE — right side, full height ─── */}
      <div className="absolute inset-y-0 right-0 w-[58%] pointer-events-none select-none">
        <img
          src="/team.png"
          alt="ทีม Palm Investment OS"
          className="h-full w-full object-cover object-left-bottom"
          draggable={false}
        />
        {/* gradient: black on left blending into image */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        {/* subtle bottom vignette */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* ─── NAV ─── */}
      <nav className="relative z-20 flex items-center justify-between px-10 py-6">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl leading-none">🎯</span>
          <span className="text-white font-bold tracking-tight text-[15px]">
            PALM INVESTMENT <span className="text-[#4F8EF7]">OS</span>
          </span>
        </div>
        <button
          onClick={onEnter}
          className="rounded-lg bg-white/10 border border-white/20 backdrop-blur px-5 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
        >
          Mission Control →
        </button>
      </nav>

      {/* ─── HERO CONTENT ─── */}
      <div className="relative z-10 flex h-[calc(100vh-80px)] flex-col justify-center px-10 lg:px-16 max-w-[640px]">

        {/* Badge */}
        <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-[#4F8EF7]/40 bg-[#4F8EF7]/10 px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#4F8EF7] animate-pulse" />
          <span className="text-xs font-semibold text-[#4F8EF7] tracking-widest uppercase">
            {content.badge}
          </span>
        </div>

        {/* Headline — Kanit font */}
        <h1
          className="mb-6 whitespace-pre-line leading-[1.0] tracking-tight text-white"
          style={{
            fontFamily: "'Kanit', sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(3rem, 7vw, 5.5rem)',
          }}
        >
          {content.headline}
        </h1>

        {/* Subheadline */}
        <p
          className="mb-8 whitespace-pre-line text-[#888] leading-relaxed"
          style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)' }}
        >
          {content.subheadline}
        </p>

        {/* CTA */}
        <button
          onClick={onEnter}
          className="mb-10 w-fit flex items-center gap-3 rounded-xl bg-[#4F8EF7] px-8 py-4 text-white font-bold hover:bg-[#3a7de8] active:scale-95 transition-all shadow-2xl shadow-[#4F8EF7]/30"
          style={{ fontFamily: "'Kanit', sans-serif", fontWeight: 700, fontSize: '1rem' }}
        >
          <span>▶</span>
          <span>{content.cta}</span>
        </button>

        {/* Stats row */}
        <div className="flex gap-8 border-t border-white/10 pt-6">
          {STATS.map((s) => (
            <div key={s.label}>
              <div
                className="text-white leading-none mb-1"
                style={{ fontFamily: "'Kanit', sans-serif", fontWeight: 800, fontSize: '1.6rem' }}
              >
                {s.value}
              </div>
              <div className="text-[#555] text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── AGENT PILLS — bottom left ─── */}
      <div className="absolute bottom-6 left-10 z-20 flex flex-wrap gap-1.5 max-w-[560px]">
        {[
          { name: 'ปิยะ', role: 'Macro', color: '#4F8EF7' },
          { name: 'มิน', role: 'Data', color: '#4F8EF7' },
          { name: 'เนม', role: 'Fundamental', color: '#A78BFA' },
          { name: 'โก้', role: 'Technical', color: '#A78BFA' },
          { name: 'รัฐ', role: 'Risk', color: '#FB923C' },
          { name: 'ลุงชาย', role: 'Portfolio', color: '#FB923C' },
          { name: 'แก้ว', role: 'Strategy', color: '#34D399' },
          { name: 'ป้อม', role: 'CIO', color: '#F9A8D4' },
          { name: 'นัท', role: 'Presenter', color: '#FCD34D' },
        ].map((a) => (
          <span
            key={a.name}
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold"
            style={{
              background: `${a.color}18`,
              color: a.color,
              border: `1px solid ${a.color}35`,
              fontFamily: "'Kanit', sans-serif",
            }}
          >
            <span className="h-1 w-1 rounded-full" style={{ background: a.color }} />
            {a.name} · {a.role}
          </span>
        ))}
      </div>
    </div>
  );
}
