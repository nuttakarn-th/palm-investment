import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fontsource/kanit/700.css';
import '@fontsource/kanit/800.css';

const AGENTS = [
  {
    key: 'pom', nickname: 'ป้อม', title: 'CIO — Committee Lead',
    team: 'committee', teamLabel: 'COMMITTEE', teamIcon: '👑',
    model: 'Sonnet', color: '#FCD34D', lv: 'LV.6', pipeline: 'Stage 6',
    bio: 'หัวหน้า Investment Committee ผู้ตัดสินใจขั้นสุดท้าย รับรายงานจากทุก agent แล้วออก Final Call ที่ชัดเจน ผ่านวิกฤตตลาดมาหลายรอบ มองทั้ง macro และ micro พร้อมกัน',
    abilities: [
      { icon: '⚔️', name: 'Final Verdict', desc: 'ออก Final Call โดยรวมข้อมูลจากทุก agent' },
      { icon: '🛡️', name: 'Risk Override', desc: 'ยับยั้งการลงทุนเมื่อความเสี่ยงเกินเกณฑ์' },
      { icon: '📋', name: 'Committee Vote', desc: 'ประเมิน consensus จากทีมก่อนตัดสิน' },
    ],
    samples: ['สรุปภาพรวมพอร์ตตอนนี้เป็นยังไงบ้าง', 'ควรปรับ allocation อย่างไรในสัปดาห์นี้', 'Final call สำหรับ position ที่กำลังพิจารณา'],
    synergies: ['แก้ว', 'ลุงชาย'],
    stat: { SPD: 72, DEP: 98, STR: 95, ACC: 92, EXP: 98, COM: 90 },
  },
  {
    key: 'kaew', nickname: 'แก้ว', title: 'Portfolio Strategist',
    team: 'strategy', teamLabel: 'STRATEGY', teamIcon: '🎯',
    model: 'Sonnet', color: '#34D399', lv: 'LV.5', pipeline: 'Stage 5',
    bio: 'นักยุทธศาสตร์พอร์ตโฟลิโอ วางแผน asset allocation ระยะยาว ชำนาญเรื่อง sector rotation และ rebalancing ให้พอร์ตสอดคล้องกับ risk profile',
    abilities: [
      { icon: '🗺️', name: 'Asset Allocation', desc: 'จัดสรร asset class ให้เหมาะกับเป้าหมาย' },
      { icon: '🔄', name: 'Rebalancing', desc: 'แนะนำการ rebalance เมื่อพอร์ต drift จาก target' },
      { icon: '📈', name: 'Sector Rotation', desc: 'วิเคราะห์ว่า sector ไหนน่าเพิ่มน้ำหนัก' },
    ],
    samples: ['วางแผนพอร์ตระยะ 6 เดือนหน้าอย่างไรดี', 'ควร rotate ออกจาก tech ไป sector ไหน', 'พอร์ตปัจจุบัน concentrated เกินไปมั้ย'],
    synergies: ['ป้อม', 'รัฐ'],
    stat: { SPD: 70, DEP: 90, STR: 92, ACC: 88, EXP: 82, COM: 86 },
  },
  {
    key: 'lungchai', nickname: 'ลุงชาย', title: 'Portfolio Risk Manager',
    team: 'risk', teamLabel: 'RISK', teamIcon: '🛡️',
    model: 'Sonnet', color: '#F97316', lv: 'LV.4', pipeline: 'Stage 4',
    bio: 'ผู้เฝ้าระวังความเสี่ยงระดับพอร์ต ผ่านวิกฤต 2008, COVID crash มาแล้ว รู้ว่าเมื่อไหรต้องถือ เมื่อไหรต้อง cut loss ไม่ตื่นตระหนกแต่ไม่ประมาท',
    abilities: [
      { icon: '📉', name: 'VaR Monitor', desc: 'คำนวณ Value at Risk ของพอร์ตทั้งหมด' },
      { icon: '🚨', name: 'Drawdown Alert', desc: 'แจ้งเตือนเมื่อ drawdown เข้าสู่ระดับอันตราย' },
      { icon: '💰', name: 'Cash Buffer', desc: 'แนะนำสัดส่วน cash ที่เหมาะสมตามสภาวะตลาด' },
    ],
    samples: ['ความเสี่ยงพอร์ตตอนนี้อยู่ระดับไหน', 'ถ้าตลาดลง 20% พอร์ตเสียหายเท่าไหร่', 'ควรถือ cash สัดส่วนเท่าไหร่ตอนนี้'],
    synergies: ['รัฐ', 'แก้ว'],
    stat: { SPD: 68, DEP: 88, STR: 85, ACC: 90, EXP: 90, COM: 80 },
  },
  {
    key: 'rat', nickname: 'รัฐ', title: 'Position Risk Analyst',
    team: 'risk', teamLabel: 'RISK', teamIcon: '🛡️',
    model: 'Sonnet', color: '#F97316', lv: 'LV.3', pipeline: 'Stage 3',
    bio: 'วิเคราะห์ความเสี่ยงระดับ position ดู correlation ระหว่าง asset ตรวจสอบ concentration risk และกำหนด position sizing ที่เหมาะสม',
    abilities: [
      { icon: '🎯', name: 'Position Sizing', desc: 'คำนวณขนาด position ที่เหมาะสมตาม risk' },
      { icon: '🔗', name: 'Correlation Map', desc: 'วิเคราะห์ความสัมพันธ์ระหว่าง asset' },
      { icon: '✂️', name: 'Stop Loss', desc: 'กำหนดจุด stop loss ที่เหมาะสมต่อ position' },
    ],
    samples: ['NVDA กับ AMD ใน portfolio correlate กันเกินไปมั้ย', 'position SIZE ใหญ่เกินไปมั้ย', 'ควรตั้ง stop loss ที่จุดไหน'],
    synergies: ['ลุงชาย', 'โก้'],
    stat: { SPD: 70, DEP: 85, STR: 82, ACC: 88, EXP: 75, COM: 78 },
  },
  {
    key: 'nem', nickname: 'เนม', title: 'Fundamental Analyst',
    team: 'analysis', teamLabel: 'ANALYSIS', teamIcon: '📊',
    model: 'Haiku', color: '#A78BFA', lv: 'LV.2', pipeline: 'Stage 2',
    bio: 'ผู้เชี่ยวชาญวิเคราะห์ปัจจัยพื้นฐาน ขุดงบการเงิน หา fair value ด้วย DCF และ multiple analysis ตรวจสอบ moat และ management quality',
    abilities: [
      { icon: '💵', name: 'DCF Valuation', desc: 'คำนวณ intrinsic value ด้วย discounted cash flow' },
      { icon: '📑', name: 'Financial Ratio', desc: 'วิเคราะห์ P/E, P/B, ROE, debt ratio' },
      { icon: '🏰', name: 'Moat Analysis', desc: 'ประเมินความได้เปรียบเชิงแข่งขันระยะยาว' },
    ],
    samples: ['AAPL ราคาตอนนี้ overvalued หรือ undervalued', 'เปรียบเทียบ fundamental MSFT vs GOOGL', 'SET50 ตัวไหน valuation ถูกที่สุด'],
    synergies: ['ปิยะ', 'โก้'],
    stat: { SPD: 92, DEP: 80, STR: 75, ACC: 85, EXP: 72, COM: 75 },
  },
  {
    key: 'ko', nickname: 'โก้', title: 'Technical Analyst',
    team: 'analysis', teamLabel: 'ANALYSIS', teamIcon: '📊',
    model: 'Haiku', color: '#A78BFA', lv: 'LV.2', pipeline: 'Stage 2',
    bio: 'อ่านกราฟเป็นภาษาแม่ จำ chart pattern ได้หลายร้อยรูปแบบ ใช้ EMA, RSI, MACD, Fibonacci ในการหาจุด entry/exit ที่แม่นยำ',
    abilities: [
      { icon: '📐', name: 'Pattern Recognition', desc: 'จำ chart pattern เช่น H&S, Double Top/Bottom' },
      { icon: '🎯', name: 'Entry/Exit Signal', desc: 'หาจุดซื้อขายที่มี risk/reward ดี' },
      { icon: '📏', name: 'Support & Resistance', desc: 'กำหนดแนวรับแนวต้านสำคัญ' },
    ],
    samples: ['BTC ผ่านแนวต้านได้มั้ย', 'DELTA มีสัญญาณ breakout มั้ย', 'จุด entry ที่ดีสำหรับ PTT คืออะไร'],
    synergies: ['เนม', 'รัฐ'],
    stat: { SPD: 90, DEP: 78, STR: 74, ACC: 82, EXP: 70, COM: 72 },
  },
  {
    key: 'piya', nickname: 'ปิยะ', title: 'Market Macro Researcher',
    team: 'research', teamLabel: 'RESEARCH', teamIcon: '🔍',
    model: 'Haiku', color: '#4F8EF7', lv: 'LV.1', pipeline: 'Stage 1',
    bio: 'ติดตาม macro economy อย่างใกล้ชิด Fed meeting, inflation data, GDP, yield curve เชื่อมโยงปัจจัยโลกสู่ผลกระทบต่อพอร์ต',
    abilities: [
      { icon: '🏦', name: 'Fed Watch', desc: 'ติดตาม Fed policy และผลกระทบต่อตลาด' },
      { icon: '🌍', name: 'Global Macro', desc: 'วิเคราะห์ภาพ macro ทั่วโลก US/EU/Asia' },
      { icon: '🔄', name: 'Sector Cycle', desc: 'วิเคราะห์ว่า sector ไหนได้/เสียจาก macro' },
    ],
    samples: ['Fed ขึ้นดอกเบี้ยอีกกระทบตลาดยังไง', 'ภาพ macro ตอนนี้เอื้อต่อ growth หรือ value', 'เศรษฐกิจจีนกระทบหุ้นไทยอย่างไร'],
    synergies: ['มิน', 'เนม'],
    stat: { SPD: 95, DEP: 75, STR: 70, ACC: 80, EXP: 68, COM: 70 },
  },
  {
    key: 'min', nickname: 'มิน', title: 'Company Data Researcher',
    team: 'research', teamLabel: 'RESEARCH', teamIcon: '🔍',
    model: 'Haiku', color: '#4F8EF7', lv: 'LV.1', pipeline: 'Stage 1',
    bio: 'ขุดข้อมูล company-specific ทั้ง news, earnings report, SEC filing, analyst rating อัปเดตตลอดเวลา ไม่พลาดทุก catalyst สำคัญ',
    abilities: [
      { icon: '📰', name: 'News Scanner', desc: 'สแกนข่าวล่าสุดที่กระทบราคาหุ้น' },
      { icon: '📅', name: 'Earnings Tracker', desc: 'ติดตาม earnings calendar และ estimate' },
      { icon: '📂', name: 'Filing Analyst', desc: 'อ่าน 10-K, 56-1 หา red flag' },
    ],
    samples: ['มีข่าวอะไรน่ากังวลสำหรับ AAPL มั้ย', 'earnings ADVANC งวดหน้าคาดว่าจะเป็นยังไง', 'insider trading ของ PTT มีความเคลื่อนไหวมั้ย'],
    synergies: ['ปิยะ', 'เนม'],
    stat: { SPD: 94, DEP: 74, STR: 70, ACC: 78, EXP: 65, COM: 72 },
  },
  {
    key: 'nat', nickname: 'นัท', title: 'Report Presenter',
    team: 'presenter', teamLabel: 'PRESENTER', teamIcon: '📢',
    model: 'Haiku', color: '#22D3EE', lv: 'LV.7', pipeline: 'Stage 7',
    bio: 'ผู้สรุปและนำเสนอรายงานขั้นสุดท้าย แปลงข้อมูลซับซ้อนให้อ่านง่าย กระชับ และ actionable คือหน้าตาที่คุณเห็นในทุกรายงาน',
    abilities: [
      { icon: '✍️', name: 'Report Synthesis', desc: 'รวม output จากทุก agent เป็นรายงานเดียว' },
      { icon: '⚡', name: 'Executive Summary', desc: 'สรุป 3 ประเด็นสำคัญที่ต้องรู้ทันที' },
      { icon: '🎨', name: 'Visual Narrative', desc: 'จัดรูปแบบให้อ่านง่ายด้วย markdown' },
    ],
    samples: ['สรุปสถานะพอร์ตให้กระชับ 5 บรรทัด', 'เขียน investment thesis ของ position นี้', 'สรุป action items สำหรับสัปดาห์หน้า'],
    synergies: ['ป้อม', 'แก้ว'],
    stat: { SPD: 96, DEP: 70, STR: 88, ACC: 75, EXP: 65, COM: 98 },
  },
];

// ── Radar Chart ───────────────────────────────────────────────────────────────

function RadarChart({ stat, color, size = 160 }) {
  const keys = Object.keys(stat);
  const vals = Object.values(stat);
  const n = keys.length;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.36;
  const labelR = maxR + 14;

  const angle = (i) => (i * 2 * Math.PI) / n - Math.PI / 2;
  const pt = (i, r) => ({ x: cx + r * Math.cos(angle(i)), y: cy + r * Math.sin(angle(i)) });

  const gridPts = (level) => keys.map((_, i) => { const p = pt(i, maxR * level); return `${p.x},${p.y}`; }).join(' ');
  const valuePts = vals.map((v, i) => { const p = pt(i, (v / 100) * maxR); return `${p.x},${p.y}`; }).join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0.25, 0.5, 0.75, 1].map((l) => (
        <polygon key={l} points={gridPts(l)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
      ))}
      {keys.map((_, i) => {
        const p = pt(i, maxR);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />;
      })}
      <polygon points={valuePts} fill={`${color}25`} stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      {vals.map((v, i) => {
        const p = pt(i, (v / 100) * maxR);
        return <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />;
      })}
      {keys.map((k, i) => {
        const p = pt(i, labelR);
        return (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
            fontSize="8" fill="rgba(255,255,255,0.45)" fontFamily="monospace">
            {k}
          </text>
        );
      })}
    </svg>
  );
}

// ── Character Modal ───────────────────────────────────────────────────────────

function CharacterModal({ agent, onClose }) {
  if (!agent) return null;
  const isSonnet = agent.model === 'Sonnet';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{
          background: 'linear-gradient(160deg, #111 0%, #0c0c0c 100%)',
          border: `1px solid ${agent.color}44`,
          boxShadow: `0 0 60px ${agent.color}30`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent */}
        <div className="h-1 w-full rounded-t-2xl" style={{ background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)` }} />

        {/* Header */}
        <div className="flex items-start gap-5 p-6 pb-4">
          <div className="shrink-0 w-24 h-24 rounded-xl overflow-hidden border" style={{ borderColor: `${agent.color}44` }}>
            <img src={`/avatars/${agent.key}.jpg`} alt={agent.nickname} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ color: agent.color, background: `${agent.color}18`, border: `1px solid ${agent.color}33` }}>{agent.lv}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ color: agent.color, background: `${agent.color}18`, border: `1px solid ${agent.color}33` }}>{agent.pipeline}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded ml-auto" style={{ color: isSonnet ? '#FCD34D' : '#94a3b8', background: isSonnet ? '#FCD34D18' : '#ffffff0d', border: `1px solid ${isSonnet ? '#FCD34D33' : '#ffffff15'}` }}>
                {isSonnet ? '⚡ SONNET' : '◆ HAIKU'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Kanit', sans-serif" }}>{agent.nickname}</h2>
            <p className="text-sm text-neutral-400">{agent.title}</p>
            <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest" style={{ color: agent.color, background: `${agent.color}15`, border: `1px solid ${agent.color}30` }}>
              {agent.teamIcon} {agent.teamLabel}
            </div>
          </div>
          <button onClick={onClose} className="shrink-0 text-neutral-500 hover:text-white text-lg leading-none">✕</button>
        </div>

        {/* Bio */}
        <div className="px-6 pb-4">
          <p className="text-sm text-neutral-400 leading-relaxed">{agent.bio}</p>
        </div>

        {/* Stats + Radar */}
        <div className="flex gap-4 px-6 pb-5">
          <RadarChart stat={agent.stat} color={agent.color} size={160} />
          <div className="flex-1 space-y-2.5 pt-2">
            {Object.entries(agent.stat).map(([k, v]) => (
              <div key={k} className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-500 w-8 font-mono">{k}</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${v}%`, background: agent.color }} />
                </div>
                <span className="text-[10px] text-neutral-400 w-6 text-right font-mono">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Abilities */}
        <div className="px-6 pb-5">
          <div className="text-[10px] font-bold tracking-widest text-neutral-600 mb-3 uppercase">Special Abilities</div>
          <div className="space-y-2">
            {agent.abilities.map((ab, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl p-3" style={{ background: `${agent.color}08`, border: `1px solid ${agent.color}20` }}>
                <span className="text-lg leading-none">{ab.icon}</span>
                <div>
                  <div className="text-sm font-bold text-white">{ab.name}</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">{ab.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sample queries */}
        <div className="px-6 pb-5">
          <div className="text-[10px] font-bold tracking-widest text-neutral-600 mb-3 uppercase">ถามอะไรได้บ้าง</div>
          <div className="space-y-1.5">
            {agent.samples.map((s, i) => (
              <div key={i} className="text-[12px] text-neutral-400 rounded-lg px-3 py-2 bg-white/3 border border-white/5">
                💬 {s}
              </div>
            ))}
          </div>
        </div>

        {/* Synergies */}
        <div className="px-6 pb-6">
          <div className="text-[10px] font-bold tracking-widest text-neutral-600 mb-2 uppercase">Synergy กับ</div>
          <div className="flex gap-2">
            {agent.synergies.map((s) => (
              <span key={s} className="text-xs px-3 py-1 rounded-full" style={{ color: agent.color, background: `${agent.color}15`, border: `1px solid ${agent.color}30` }}>
                ✦ {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Agent Card (Flip) ─────────────────────────────────────────────────────────

function AgentCard({ agent, onOpenModal }) {
  const [flipped, setFlipped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isSonnet = agent.model === 'Sonnet';

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);
  const cardStyle = {
    background: 'linear-gradient(160deg, #111 0%, #0a0a0a 100%)',
    border: `1px solid ${agent.color}33`,
  };

  return (
    <div
      style={{
        perspective: '900px',
        borderRadius: '16px',
        transform: hovered ? 'translateY(-10px)' : 'translateY(0)',
        boxShadow: hovered ? `0 24px 48px ${agent.color}45, 0 0 0 1px ${agent.color}55` : 'none',
        transition: 'transform 0.28s ease, box-shadow 0.28s ease',
        cursor: 'pointer',
      }}
      onClick={() => setFlipped((f) => !f)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          position: 'relative',
          minHeight: '380px',
        }}
      >
        {/* ── FRONT ── */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col"
          style={{ ...cardStyle, backfaceVisibility: 'hidden' }}
        >
          <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)` }} />
          <div className="flex items-center justify-between px-3 pt-2 pb-1">
            <span className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded" style={{ color: agent.color, background: `${agent.color}18`, border: `1px solid ${agent.color}33` }}>{agent.lv}</span>
            <span className="text-[9px] font-semibold tracking-widest px-2 py-0.5 rounded" style={{ color: isSonnet ? '#FCD34D' : '#94a3b8', background: isSonnet ? '#FCD34D18' : '#ffffff0d', border: `1px solid ${isSonnet ? '#FCD34D33' : '#ffffff15'}` }}>
              {isSonnet ? '⚡ SONNET' : '◆ HAIKU'}
            </span>
          </div>
          <div className="flex-1 px-3 pb-1">
            <div className="w-full rounded-xl overflow-hidden" style={{ aspectRatio: '1/1', background: '#161616' }}>
              <img src={`/avatars/${agent.key}.jpg`} alt={agent.nickname} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.opacity = '0.3'; }} />
            </div>
          </div>
          <div className="px-3 pb-3 text-center">
            <div className="text-xl font-bold text-white" style={{ fontFamily: "'Kanit', sans-serif" }}>{agent.nickname}</div>
            <div className="text-[10px] text-neutral-500 mb-2">{agent.title}</div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest mb-2.5" style={{ color: agent.color, background: `${agent.color}15`, border: `1px solid ${agent.color}30` }}>
              {agent.teamIcon} {agent.teamLabel}
            </div>
            <div className="space-y-1.5">
              {Object.entries(agent.stat).slice(0, 3).map(([k, v], idx) => (
                <div key={k} className="flex items-center gap-2">
                  <span className="text-[9px] text-neutral-500 w-7 shrink-0">{k}</span>
                  <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: mounted ? `${v}%` : '0%',
                        background: agent.color,
                        transition: 'width 0.6s ease-out',
                        transitionDelay: `${idx * 0.1}s`,
                      }}
                    />
                  </div>
                  <span className="text-[9px] text-neutral-400 w-5 text-right">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${agent.color}33, transparent)` }} />
          <div className="text-center py-1.5 text-[9px] text-neutral-700">กดเพื่อดูด้านหลัง ↩</div>
        </div>

        {/* ── BACK ── */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col"
          style={{ ...cardStyle, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)` }} />
          <div className="flex items-center gap-2 px-3 pt-3 pb-2">
            <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border" style={{ borderColor: `${agent.color}44` }}>
              <img src={`/avatars/${agent.key}.jpg`} alt={agent.nickname} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-sm font-bold text-white" style={{ fontFamily: "'Kanit', sans-serif" }}>{agent.nickname}</div>
              <div className="text-[9px] text-neutral-500">{agent.pipeline}</div>
            </div>
          </div>

          <div className="px-3 pb-2">
            <p className="text-[10px] text-neutral-400 leading-relaxed line-clamp-3">{agent.bio}</p>
          </div>

          <div className="px-3 pb-2 space-y-1.5 flex-1">
            <div className="text-[9px] font-bold tracking-widest text-neutral-600 uppercase mb-1">Abilities</div>
            {agent.abilities.map((ab, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg px-2 py-1.5" style={{ background: `${agent.color}08`, border: `1px solid ${agent.color}18` }}>
                <span className="text-sm leading-none">{ab.icon}</span>
                <div>
                  <div className="text-[10px] font-bold text-white">{ab.name}</div>
                  <div className="text-[9px] text-neutral-600 leading-tight">{ab.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-3 pb-3 pt-2">
            <button
              onClick={(e) => { e.stopPropagation(); onOpenModal(agent); }}
              className="w-full rounded-xl py-2 text-xs font-bold transition-all active:scale-95"
              style={{ background: agent.color, color: '#000' }}
            >
              📋 ดู Character Sheet
            </button>
          </div>
          <div className="text-center pb-1.5 text-[9px] text-neutral-700">กดเพื่อกลับ ↩</div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const navigate = useNavigate();
  const [modalAgent, setModalAgent] = useState(null);

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <nav className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#080808]/90 backdrop-blur">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
          ← กลับ
        </button>
        <div className="flex items-center gap-2">
          <span>🎯</span>
          <span className="font-bold tracking-tight text-sm">PALM INVESTMENT <span className="text-[#4F8EF7]">OS</span></span>
        </div>
        <button onClick={() => navigate('/app')} className="text-sm font-semibold text-[#4F8EF7] hover:text-white transition-colors">
          Mission Control →
        </button>
      </nav>

      <div className="text-center pt-12 pb-8 px-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#4F8EF7]/30 bg-[#4F8EF7]/8 px-4 py-1.5 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-[#4F8EF7] animate-pulse" />
          <span className="text-[11px] font-semibold text-[#4F8EF7] tracking-widest uppercase">AI AGENT ROSTER</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3" style={{ fontFamily: "'Kanit', sans-serif" }}>
          พบกับทีม<span className="text-[#4F8EF7]"> AI 9 คน</span>
        </h1>
        <p className="text-neutral-500 text-sm max-w-md mx-auto">กดที่การ์ดเพื่อพลิกดูข้อมูล · กด "Character Sheet" เพื่อดูรายละเอียดเต็ม</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {AGENTS.map((agent) => (
            <AgentCard key={agent.key} agent={agent} onOpenModal={setModalAgent} />
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-white/5 bg-white/2 p-5">
          <div className="text-xs font-semibold text-neutral-500 mb-3 tracking-widest uppercase">Pipeline Flow</div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: 'Stage 1', agents: 'ปิยะ + มิน', color: '#4F8EF7' },
              { label: 'Stage 2', agents: 'เนม + โก้', color: '#A78BFA' },
              { label: 'Stage 3', agents: 'รัฐ', color: '#F97316' },
              { label: 'Stage 4', agents: 'ลุงชาย', color: '#F97316' },
              { label: 'Stage 5', agents: 'แก้ว', color: '#34D399' },
              { label: 'Stage 6', agents: 'ป้อม CIO', color: '#FCD34D' },
              { label: 'Stage 7', agents: 'นัท', color: '#22D3EE' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px]" style={{ background: `${s.color}12`, border: `1px solid ${s.color}30`, color: s.color }}>
                  <span className="font-bold">{s.label}</span>
                  <span className="text-white/50">·</span>
                  <span>{s.agents}</span>
                </div>
                {i < 6 && <span className="text-neutral-700">→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <CharacterModal agent={modalAgent} onClose={() => setModalAgent(null)} />
    </div>
  );
}
