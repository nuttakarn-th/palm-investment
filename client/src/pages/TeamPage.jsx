import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
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

const PAGE_STYLE = `
@keyframes cardIn {
  from { opacity: 0; transform: translateY(28px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes rosterDot {
  0%,100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.65); }
}
@keyframes glowTitle {
  0%,100% { text-shadow: 0 0 20px rgba(79,142,247,0.35); }
  50%     { text-shadow: 0 0 40px rgba(79,142,247,0.7), 0 0 80px rgba(79,142,247,0.25); }
}
`;

// ── Radar Chart ───────────────────────────────────────────────────────────────

function RadarChart({ stat, color, size = 160, fill = false }) {
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
    <svg
      viewBox={`0 0 ${size} ${size}`}
      preserveAspectRatio="xMidYMid meet"
      style={fill ? { width: '100%', height: '100%' } : { width: size, height: size }}
    >
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

// ── Stats Tab ─────────────────────────────────────────────────────────────────

function StatsTabContent({ agent }) {
  const areaRef = useRef(null);
  const [radarSize, setRadarSize] = useState(150);

  useLayoutEffect(() => {
    if (!areaRef.current) return;
    const measure = () => {
      const h = areaRef.current.getBoundingClientRect().height;
      if (h > 0) setRadarSize(Math.min(Math.floor(h * 0.92), 300));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(areaRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0 }}>
        {agent.bio}
      </p>
      <div ref={areaRef} style={{ height: '240px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <RadarChart stat={agent.stat} color={agent.color} size={radarSize} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px' }}>
          {Object.entries(agent.stat).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '9px', color: '#555', width: '28px', fontFamily: 'monospace' }}>{k}</span>
              <div style={{ flex: 1, height: '5px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: '99px', width: `${v}%`, background: agent.color }} />
              </div>
              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', width: '20px', textAlign: 'right', fontFamily: 'monospace' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Character Modal ───────────────────────────────────────────────────────────

function ModalContent({ agent, onClose }) {
  const [tab, setTab] = useState('stats');
  const canClose = useRef(false);
  const isSonnet = agent.model === 'Sonnet';
  const TABS = [
    { key: 'stats',     label: 'Stats' },
    { key: 'abilities', label: 'Abilities' },
    { key: 'ask',       label: 'ถามได้' },
  ];

  useEffect(() => {
    const t = setTimeout(() => { canClose.current = true; }, 350);
    return () => clearTimeout(t);
  }, []);

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.88)' }}
      onClick={() => { if (canClose.current) onClose(); }}
    >
      <div
        style={{
          width: '100%', maxWidth: '420px',
          maxHeight: 'calc(100vh - 48px)',
          display: 'flex', flexDirection: 'column',
          background: 'linear-gradient(160deg, #111 0%, #0c0c0c 100%)',
          border: `1px solid ${agent.color}44`,
          boxShadow: `0 0 60px ${agent.color}25`,
          borderRadius: '20px', overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ height: '3px', flexShrink: 0, background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)` }} />

        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: '58px', height: '58px', borderRadius: '12px', overflow: 'hidden', border: `1.5px solid ${agent.color}44`, flexShrink: 0 }}>
            <img src={`/avatars/${agent.key}.jpg`} alt={agent.nickname} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: '5px', marginBottom: '4px', flexWrap: 'wrap' }}>
              {[agent.lv, agent.pipeline].map(lbl => (
                <span key={lbl} style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '5px', color: agent.color, background: `${agent.color}18`, border: `1px solid ${agent.color}33` }}>{lbl}</span>
              ))}
              <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '5px', color: isSonnet ? '#FCD34D' : '#94a3b8', background: isSonnet ? '#FCD34D18' : '#ffffff0d', border: `1px solid ${isSonnet ? '#FCD34D33' : '#ffffff15'}` }}>
                {isSonnet ? '⚡ SONNET' : '◆ HAIKU'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#fff', fontFamily: "'Kanit', sans-serif", lineHeight: 1.2 }}>{agent.nickname}</span>
              <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em', padding: '2px 8px', borderRadius: '99px', color: agent.color, background: `${agent.color}15`, border: `1px solid ${agent.color}30` }}>
                {agent.teamIcon} {agent.teamLabel}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{agent.title}</div>
          </div>
          <button onClick={onClose} style={{ flexShrink: 0, background: 'none', border: 'none', color: '#555', fontSize: '18px', lineHeight: 1, cursor: 'pointer', padding: '4px', alignSelf: 'flex-start' }}>✕</button>
        </div>

        <div style={{ flexShrink: 0, display: 'flex', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: '9px 4px', fontSize: '11px', fontWeight: 700,
                color: tab === t.key ? agent.color : 'rgba(255,255,255,0.28)',
                borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                borderBottom: `2px solid ${tab === t.key ? agent.color : 'transparent'}`,
                background: 'none', cursor: 'pointer', fontFamily: "'Kanit', sans-serif",
                transition: 'color 0.15s', letterSpacing: '0.04em',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '14px', display: 'flex', flexDirection: 'column' }}>
          {tab === 'stats' && <StatsTabContent agent={agent} />}

          {tab === 'abilities' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {agent.abilities.map((ab, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 18px', borderRadius: '14px', background: `${agent.color}08`, border: `1px solid ${agent.color}20` }}>
                  <span style={{ fontSize: '26px', lineHeight: 1, flexShrink: 0, marginTop: '2px' }}>{ab.icon}</span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '5px', fontFamily: "'Kanit', sans-serif" }}>{ab.name}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{ab.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'ask' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', color: '#444', textTransform: 'uppercase', marginBottom: '8px' }}>ตัวอย่างคำถาม</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {agent.samples.map((s, i) => (
                    <div key={i} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', padding: '13px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', lineHeight: 1.5 }}>
                      💬 {s}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', color: '#444', textTransform: 'uppercase', marginBottom: '8px' }}>Synergy กับ</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {agent.synergies.map((s) => (
                    <span key={s} style={{ fontSize: '12px', padding: '7px 16px', borderRadius: '99px', color: agent.color, background: `${agent.color}15`, border: `1px solid ${agent.color}30`, fontWeight: 600 }}>
                      ✦ {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function CharacterModal({ agent, onClose }) {
  if (!agent) return null;
  return <ModalContent agent={agent} onClose={onClose} />;
}

// ── Agent Card (Flip) ─────────────────────────────────────────────────────────

function AgentCard({ agent, onOpenModal, index = 0 }) {
  const [flipped, setFlipped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const touchTimer = useRef(null);
  const isSonnet = agent.model === 'Sonnet';

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80 + index * 60);
    return () => clearTimeout(t);
  }, [index]);

  const handleTouchStart = () => {
    clearTimeout(touchTimer.current);
    setHovered(true);
  };
  const handleTouchEnd = () => {
    touchTimer.current = setTimeout(() => setHovered(false), 700);
  };

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
        boxShadow: hovered ? `0 24px 48px ${agent.color}45, 0 0 0 1.5px ${agent.color}60` : 'none',
        transition: 'transform 0.28s ease, box-shadow 0.28s ease',
        cursor: 'pointer',
      }}
      onClick={() => setFlipped((f) => !f)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          position: 'relative',
          minHeight: '460px',
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
          <div className="flex-1 px-3 pb-1" style={{ minHeight: '160px' }}>
            <div className="w-full h-full rounded-xl overflow-hidden" style={{ background: '#161616' }}>
              <img src={`/avatars/${agent.key}.jpg`} alt={agent.nickname} className="w-full h-full object-cover object-top" onError={(e) => { e.currentTarget.style.opacity = '0.3'; }} />
            </div>
          </div>
          <div className="px-3 pb-3 text-center">
            <div className="text-xl font-bold text-white mb-0.5" style={{ fontFamily: "'Kanit', sans-serif" }}>{agent.nickname}</div>
            <div className="text-[11px] text-neutral-500 mb-2">{agent.title}</div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest mb-3" style={{ color: agent.color, background: `${agent.color}15`, border: `1px solid ${agent.color}30` }}>
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
                        transition: 'width 0.7s ease-out',
                        transitionDelay: `${idx * 0.12}s`,
                      }}
                    />
                  </div>
                  <span className="text-[9px] text-neutral-400 w-5 text-right">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${agent.color}33, transparent)` }} />
          <div className="text-center py-1.5 text-[9px] text-neutral-500">กดเพื่อดูด้านหลัง ↩</div>
        </div>

        {/* ── BACK ── */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col"
          style={{ ...cardStyle, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)` }} />
          <div className="flex items-center gap-2 px-3 pt-3 pb-2">
            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border" style={{ borderColor: `${agent.color}44` }}>
              <img src={`/avatars/${agent.key}.jpg`} alt={agent.nickname} className="w-full h-full object-cover object-top" />
            </div>
            <div>
              <div className="text-sm font-bold text-white" style={{ fontFamily: "'Kanit', sans-serif" }}>{agent.nickname}</div>
              <div className="text-[9px] text-neutral-500">{agent.pipeline}</div>
            </div>
          </div>

          <div className="px-3 pb-2">
            <p className="text-[11px] text-neutral-400 leading-relaxed line-clamp-3">{agent.bio}</p>
          </div>

          <div className="px-3 pb-2 space-y-2">
            <div className="text-[9px] font-bold tracking-widest text-neutral-600 uppercase mb-1">Abilities</div>
            {agent.abilities.map((ab, i) => (
              <div key={i} className="flex items-start gap-2.5 rounded-xl px-3 py-2.5" style={{ background: `${agent.color}08`, border: `1px solid ${agent.color}18` }}>
                <span className="text-base leading-none mt-0.5">{ab.icon}</span>
                <div>
                  <div className="text-[11px] font-bold text-white">{ab.name}</div>
                  <div className="text-[10px] text-neutral-600 leading-snug mt-0.5">{ab.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex-1" />

          <div className="px-3 pb-3 pt-2">
            <button
              onClick={(e) => { e.stopPropagation(); onOpenModal(agent); }}
              className="w-full rounded-xl py-2.5 text-xs font-bold transition-all active:scale-95"
              style={{ background: agent.color, color: '#000' }}
            >
              📋 ดู Character Sheet
            </button>
          </div>
          <div className="text-center pb-1.5 text-[9px] text-neutral-500">กดเพื่อกลับ ↩</div>
        </div>
      </div>
    </div>
  );
}

// ── Pipeline Flow ─────────────────────────────────────────────────────────────

function PipelineFlow() {
  const S = [
    { label: 'Stage 1', agents: 'ปิยะ + มิน', color: '#4F8EF7' },
    { label: 'Stage 2', agents: 'เนม + โก้',  color: '#A78BFA' },
    { label: 'Stage 3', agents: 'รัฐ',         color: '#F97316' },
    { label: 'Stage 4', agents: 'ลุงชาย',      color: '#F97316' },
    { label: 'Stage 5', agents: 'แก้ว',        color: '#34D399' },
    { label: 'Stage 6', agents: 'ป้อม CIO',   color: '#FCD34D' },
    { label: 'Stage 7', agents: 'นัท',         color: '#22D3EE' },
  ];
  const pill = (s) => (
    <div style={{ padding: '10px 14px', borderRadius: '12px', background: `${s.color}12`, border: `1px solid ${s.color}30` }}>
      <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', color: `${s.color}80`, textTransform: 'uppercase', marginBottom: '2px' }}>{s.label}</div>
      <div style={{ fontSize: '13px', fontWeight: 700, color: s.color, fontFamily: "'Kanit', sans-serif" }}>{s.agents}</div>
    </div>
  );
  const hArr = (ch) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#363636', fontSize: '15px' }}>{ch}</div>
  );
  const vArr = (side) => {
    const base = { padding: '2px 0', display: 'flex', justifyContent: 'center' };
    if (side === 'right') return <><div /><div /><div style={base}><span style={{ color: '#363636', fontSize: '15px' }}>↓</span></div></>;
    if (side === 'left')  return <><div style={base}><span style={{ color: '#363636', fontSize: '15px' }}>↓</span></div><div /><div /></>;
    return <><div /><div /><div style={base}><span style={{ color: '#363636', fontSize: '15px' }}>↓</span></div></>;
  };
  return (
    <div className="mt-12 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <div className="text-xs font-semibold text-neutral-500 mb-5 tracking-widest uppercase">Pipeline Flow</div>
      <div style={{ maxWidth: '460px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 32px 1fr', alignItems: 'center' }}>
        {pill(S[0])}{hArr('→')}{pill(S[1])}
        {vArr('right')}
        {pill(S[3])}{hArr('←')}{pill(S[2])}
        {vArr('left')}
        {pill(S[4])}{hArr('→')}{pill(S[5])}
        {vArr('right')}
        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 'calc((100% - 32px) / 2)' }}>{pill(S[6])}</div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const navigate = useNavigate();
  const [modalAgent, setModalAgent] = useState(null);

  useEffect(() => {
    document.body.style.overflow = modalAgent ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [modalAgent]);

  return (
    <div className="min-h-screen bg-[#080808] text-white" style={{
      backgroundImage: 'radial-gradient(circle, #141414 1px, transparent 1px)',
      backgroundSize: '28px 28px',
    }}>
      <style>{PAGE_STYLE}</style>

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

      {/* Header */}
      <div className="text-center pt-12 pb-8 px-4 relative">
        {/* Glow behind title */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '500px', height: '260px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(79,142,247,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="inline-flex items-center gap-2 rounded-full border border-[#4F8EF7]/30 bg-[#4F8EF7]/[0.07] px-4 py-1.5 mb-5">
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4F8EF7', display: 'inline-block', animation: 'rosterDot 1.6s ease-in-out infinite' }} />
          <span className="text-[11px] font-semibold text-[#4F8EF7] tracking-widest uppercase">AI Agent Roster</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold mb-3 relative" style={{ fontFamily: "'Kanit', sans-serif" }}>
          พบกับทีม<span style={{ color: '#4F8EF7', animation: 'glowTitle 3s ease-in-out infinite' }}> AI 9 คน</span>
        </h1>

        {/* HUD stats */}
        <div className="flex gap-8 justify-center mb-4">
          {[{ v: '9', l: 'AGENTS' }, { v: '4', l: 'TEAMS' }, { v: '7', l: 'STAGES' }].map(({ v, l }) => (
            <div key={l} className="text-center">
              <div className="text-2xl font-bold text-white" style={{ fontFamily: "'Kanit', sans-serif" }}>{v}</div>
              <div className="text-[9px] text-neutral-600 tracking-widest uppercase">{l}</div>
            </div>
          ))}
        </div>

        <p className="text-neutral-500 text-sm max-w-md mx-auto">กดที่การ์ดเพื่อพลิกดูข้อมูล · กด "Character Sheet" เพื่อดูรายละเอียดเต็ม</p>
      </div>

      <style>{`
        @media (max-width: 639px) {
          .agent-grid > .agent-card:last-child:nth-child(odd) {
            grid-column: 1 / -1;
            max-width: 50%;
            margin: 0 auto;
            width: 100%;
          }
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="agent-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {AGENTS.map((agent, index) => (
            <div
              key={agent.key}
              className="agent-card"
              style={{
                animation: `cardIn 0.45s ease-out ${index * 0.07}s both`,
              }}
            >
              <AgentCard agent={agent} onOpenModal={setModalAgent} index={index} />
            </div>
          ))}
        </div>

        <PipelineFlow />
      </div>

      <CharacterModal key={modalAgent?.key} agent={modalAgent} onClose={() => setModalAgent(null)} />
    </div>
  );
}
