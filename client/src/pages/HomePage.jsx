import { useEffect, useState } from 'react';

const DEFAULT_CONTENT = {
  badge: 'AI-Powered Investment Team',
  headline: 'วิเคราะห์ลึก\nตัดสินใจเร็ว\nลงทุนมั่นใจ',
  subheadline: 'ทีม AI 9 คน วิเคราะห์พอร์ตโฟลิโอของคุณแบบ real-time ครอบคลุมทุกตลาด US Stocks, SET และ Crypto',
  cta: 'เข้าสู่ Mission Control',
  ctaSub: 'ดูพอร์ตและวิเคราะห์ตลาด',
};

const STATS = [
  { value: '9', label: 'AI Agents' },
  { value: '3', label: 'ตลาดลงทุน' },
  { value: 'Real-time', label: 'วิเคราะห์' },
  { value: '7 Stage', label: 'Pipeline' },
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
    <div className="min-h-screen bg-black flex flex-col overflow-x-hidden">
      {/* NAV */}
      <nav className="flex items-center justify-between px-8 py-5 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <span className="font-bold text-white tracking-tight">
            PALM INVESTMENT <span className="text-[#4F8EF7]">OS</span>
          </span>
        </div>
        <button
          onClick={onEnter}
          className="rounded-lg bg-[#4F8EF7] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#3a7de8] transition-colors"
        >
          Mission Control →
        </button>
      </nav>

      {/* HERO */}
      <div className="flex flex-1 flex-col lg:flex-row items-center max-w-[1400px] mx-auto w-full px-8 pb-12 gap-8">

        {/* LEFT: TEXT */}
        <div className="flex-1 flex flex-col justify-center gap-6 pt-8 lg:pt-0">
          {/* Badge */}
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#4F8EF7]/30 bg-[#4F8EF7]/10 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4F8EF7] animate-pulse" />
            <span className="text-xs font-semibold text-[#4F8EF7] tracking-wide uppercase">
              {content.badge}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-[1.05] tracking-tight whitespace-pre-line">
            {content.headline}
          </h1>

          {/* Subheadline */}
          <p className="text-[#888] text-base lg:text-lg leading-relaxed max-w-lg">
            {content.subheadline}
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={onEnter}
              className="flex items-center gap-2 rounded-xl bg-[#4F8EF7] px-7 py-4 text-base font-bold text-white hover:bg-[#3a7de8] active:scale-95 transition-all shadow-lg shadow-[#4F8EF7]/20"
            >
              ▶ {content.cta}
            </button>
            <span className="text-sm text-[#555]">{content.ctaSub}</span>
          </div>

          {/* Stats */}
          <div className="flex gap-6 pt-2 border-t border-[#1a1a1a] mt-2">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-xl font-black text-white">{s.value}</div>
                <div className="text-xs text-[#555] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Team pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'ปิยะ', role: 'Macro', color: '#4F8EF7' },
              { name: 'มิน', role: 'Data', color: '#4F8EF7' },
              { name: 'เนม', role: 'Fundamental', color: '#A78BFA' },
              { name: 'โก้', role: 'Technical', color: '#A78BFA' },
              { name: 'รัฐ', role: 'Risk', color: '#FB923C' },
              { name: 'ลุงชาย', role: 'Port Risk', color: '#FB923C' },
              { name: 'แก้ว', role: 'Strategy', color: '#34D399' },
              { name: 'ป้อม', role: 'CIO', color: '#F9A8D4' },
              { name: 'นัท', role: 'Presenter', color: '#FCD34D' },
            ].map((a) => (
              <span
                key={a.name}
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold"
                style={{ background: `${a.color}14`, color: a.color, border: `1px solid ${a.color}30` }}
              >
                <span className="h-1 w-1 rounded-full" style={{ background: a.color }} />
                {a.name} · {a.role}
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT: TEAM IMAGE */}
        <div className="flex-1 flex items-end justify-center lg:justify-end relative min-h-[320px] lg:min-h-[560px] w-full">
          {/* Glow behind image */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full blur-[80px] bg-[#4F8EF7]/10 pointer-events-none" />
          <img
            src="/team.png"
            alt="ทีม Palm Investment OS"
            className="relative w-full max-w-[680px] object-contain select-none"
            draggable={false}
          />
        </div>
      </div>

      {/* FOOTER */}
      <div className="border-t border-[#111] py-5 px-8 text-center text-[11px] text-[#444]">
        Palm Investment OS · Powered by Claude AI · ทีม 9 agents พร้อมวิเคราะห์ตลอด 24/7
      </div>
    </div>
  );
}
