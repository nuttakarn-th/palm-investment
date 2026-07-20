import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import MiniChart from './MiniChart.jsx';

const MARKET_LABEL = { us: 'US', set: 'SET', crypto: 'CRYPTO' };

const PATTERN_META = {
  double_bottom:      { icon: '𝗪', color: '#5fb87a', desc: 'Double Bottom' },
  cup_handle:         { icon: '∪', color: '#4F8EF7', desc: 'Cup & Handle' },
  bull_flag:          { icon: '⚑', color: '#34D399', desc: 'Bull Flag' },
  head_shoulders:     { icon: 'Ш', color: '#d9695f', desc: 'Head & Shoulders' },
  ascending_triangle: { icon: '△', color: '#FB923C', desc: 'Ascending Triangle' },
};

const GRADE_COLOR = { A: '#FCD34D', B: '#4F8EF7', C: '#6b6862' };
const GRADE_BG    = { A: 'rgba(252,211,77,0.1)', B: 'rgba(79,142,247,0.1)', C: 'rgba(107,104,98,0.08)' };

function fmtTime(ts) {
  if (!ts) return '—';
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'เมื่อกี้';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function HelpModal({ onClose }) {
  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '0',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480, maxHeight: '90dvh',
          background: '#0f0f1a', borderRadius: '16px 16px 0 0',
          border: '1px solid #1e1e30', borderBottom: 'none',
          overflowY: 'auto', padding: '0 0 32px',
        }}
      >
        {/* Modal header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', background: '#0f0f1a',
          borderBottom: '1px solid #1e1e2a',
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e2f0' }}>📡 Pattern Radar — คู่มือมือใหม่</span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#555', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}
          >✕</button>
        </div>

        <div style={{ padding: '20px 18px 0', fontSize: 13, color: '#9ca3af', lineHeight: 1.65 }}>

          {/* What is */}
          <p style={{ color: '#e2e2f0', fontWeight: 600, marginBottom: 6 }}>Pattern Radar คืออะไร?</p>
          <p style={{ marginBottom: 16 }}>
            ระบบ<strong style={{ color: '#e2e2f0' }}> สแกน chart pattern อัตโนมัติ</strong> — AI วิเคราะห์กราฟหุ้นหลายร้อยตัวใน US, SET, Crypto แล้วเรียงตาม<strong style={{ color: '#e2e2f0' }}> โอกาสทำกำไร</strong> ให้เห็นแค่ตัวที่น่าสนใจ
          </p>

          <hr style={{ border: 'none', borderTop: '1px solid #1e1e30', margin: '16px 0' }} />

          {/* Example card */}
          <p style={{ color: '#e2e2f0', fontWeight: 600, marginBottom: 10 }}>อ่านการ์ดแต่ละใบ</p>
          <div style={{ background: '#13131f', border: '1px solid #1e1e30', borderRadius: 10, padding: 14, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#e2e2f0' }}>CPN</span>
              <span style={{ fontSize: 10, background: '#1a1a1a', borderRadius: 4, padding: '1px 6px', color: '#666' }}>SET</span>
              <span style={{ fontSize: 12, color: '#34D399' }}>▲</span>
              <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 800, color: '#FCD34D', background: 'rgba(252,211,77,0.12)', border: '1px solid rgba(252,211,77,0.3)', borderRadius: 5, padding: '1px 7px' }}>A</span>
              <span style={{ fontSize: 11, color: '#FB923C', fontWeight: 600 }}>△ Ascending Triangle</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, marginBottom: 8 }}>
              <div><div style={{ fontSize: 9, color: '#555' }}>Entry</div><div style={{ fontSize: 13, fontWeight: 700, color: '#4F8EF7' }}>69.35</div></div>
              <div><div style={{ fontSize: 9, color: '#555' }}>TP</div><div style={{ fontSize: 13, fontWeight: 700, color: '#34D399' }}>77.5</div></div>
              <div><div style={{ fontSize: 9, color: '#555' }}>SL</div><div style={{ fontSize: 13, fontWeight: 700, color: '#F87171' }}>63.54</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontSize: 9, color: '#555' }}>Duration</div><div style={{ fontSize: 11, color: '#666' }}>~17w</div></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ flex: 1, height: 4, background: '#1e1e1e', borderRadius: 2 }}>
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg,#4F8EF7,#FCD34D)', borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 9, color: '#FCD34D' }}>Score 100</span>
            </div>
          </div>

          {/* Annotations */}
          {[
            ['▲ / ▼', 'ทิศทาง — สีเขียว = bullish (คาดราคาขึ้น) · สีแดง = bearish (คาดราคาลง)'],
            ['A / B', 'เกรด — A = pattern ชัดมาก น่าเชื่อถือสูง · B = เห็นได้แต่ไม่สมบูรณ์'],
            ['Pattern', 'รูปแบบกราฟที่ AI ตรวจพบ เช่น Ascending Triangle, Bull Flag'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 10, padding: '7px 10px', background: 'rgba(79,142,247,0.08)', borderLeft: '2px solid rgba(79,142,247,0.5)', borderRadius: '0 6px 6px 0', marginBottom: 6, fontSize: 12 }}>
              <span style={{ fontWeight: 800, color: '#4F8EF7', minWidth: 42, flexShrink: 0 }}>{k}</span>
              <span>{v}</span>
            </div>
          ))}

          <hr style={{ border: 'none', borderTop: '1px solid #1e1e30', margin: '16px 0' }} />

          {/* Entry TP SL */}
          <p style={{ color: '#e2e2f0', fontWeight: 600, marginBottom: 10 }}>Entry · TP · SL คืออะไร?</p>
          {[
            ['#4F8EF7', 'Entry', 'ราคาเข้าซื้อที่ AI แนะนำ ถ้าราคาตลาดใกล้เคียงนี้ แปลว่า timing ดี'],
            ['#34D399', 'TP — Take Profit', 'เป้าขายทำกำไร ถ้าราคาแตะ TP ให้ขายออก'],
            ['#F87171', 'SL — Stop Loss', 'จุดตัดขาดทุน ถ้าราคาหลุดต่ำกว่า SL ให้ขายออกทันที — pattern ล้มเหลวแล้ว'],
          ].map(([color, title, desc]) => (
            <div key={title} style={{ border: `1px solid ${color}40`, borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 12 }}>{desc}</div>
            </div>
          ))}

          <div style={{ background: '#13131f', border: '1px solid #1e1e30', borderRadius: 8, padding: '10px 12px', marginBottom: 4, fontSize: 12 }}>
            <div style={{ fontWeight: 700, color: '#6b7280', marginBottom: 6 }}>ตัวอย่าง CPN</div>
            ซื้อที่ <span style={{ color: '#4F8EF7', fontWeight: 700 }}>69.35</span> → ถ้าขึ้น <span style={{ color: '#34D399', fontWeight: 700 }}>77.5</span> กำไร <strong style={{ color: '#34D399' }}>+11.7%</strong>
            {' · '}ถ้าหล่น <span style={{ color: '#F87171', fontWeight: 700 }}>63.54</span> ขาดทุน <strong style={{ color: '#F87171' }}>−8.4%</strong>
            <div style={{ fontSize: 10, color: '#555', marginTop: 4 }}>→ Risk:Reward ≈ 1:1.4 — เสีย 1 บาท มีโอกาสได้ 1.40 บาท</div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #1e1e30', margin: '16px 0' }} />

          {/* Score + Grade */}
          <p style={{ color: '#e2e2f0', fontWeight: 600, marginBottom: 10 }}>Score กับ Grade</p>
          <div style={{ background: '#13131f', border: '1px solid #1e1e30', borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
            {[['95+', '#FCD34D', 97, 'ดีมาก'], ['75–94', '#34D399', 80, 'ดี'], ['50–74', '#4F8EF7', 60, 'พอใช้'], ['<50', '#4b5563', 30, 'อ่อน']].map(([label, color, pct, desc]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color, width: 36, textAlign: 'right', flexShrink: 0 }}>{label}</span>
                <div style={{ flex: 1, height: 6, background: '#1e1e1e', borderRadius: 3 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 10, color, width: 36, flexShrink: 0 }}>{desc}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
            {[['A', '#FCD34D', 'rgba(252,211,77,0.1)', 'rgba(252,211,77,0.3)', 'Pattern ชัดเจน สมบูรณ์แบบ — น่าสนใจที่สุด'], ['B', '#9ca3af', 'rgba(156,163,175,0.06)', 'rgba(156,163,175,0.2)', 'เห็นได้แต่ไม่สมบูรณ์ ความน่าเชื่อถือต่ำกว่า']].map(([g, color, bg, border, desc]) => (
              <div key={g} style={{ flex: 1, background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 16, fontWeight: 900, color, marginBottom: 6 }}>{g}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{desc}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: '#555', marginBottom: 4 }}>💡 มือใหม่แนะนำให้กด <strong style={{ color: '#e2e2f0' }}>"A เท่านั้น"</strong> ก่อน</div>

          <hr style={{ border: 'none', borderTop: '1px solid #1e1e30', margin: '16px 0' }} />

          {/* Duration */}
          <p style={{ color: '#e2e2f0', fontWeight: 600, marginBottom: 6 }}>Duration คืออะไร?</p>
          <p style={{ marginBottom: 16 }}><strong style={{ color: '#e2e2f0' }}>~17w</strong> = 17 สัปดาห์ คือเวลาที่ AI คาดว่า pattern จะเดินทางถึง TP — ไม่ใช่การรับประกัน ใช้แค่คาดเดาว่าต้องอดทนนานแค่ไหน</p>

          <hr style={{ border: 'none', borderTop: '1px solid #1e1e30', margin: '16px 0' }} />

          {/* How to use */}
          <p style={{ color: '#e2e2f0', fontWeight: 600, marginBottom: 10 }}>วิธีใช้งาน</p>
          {[
            ['1', 'กด Scan', 'ให้ AI สแกน pattern ล่าสุด ใช้เวลา ~20 วินาที'],
            ['2', 'เลือกตลาด', 'กด US / SET / CRYPTO กรองเฉพาะที่สนใจ'],
            ['3', 'กรอง Grade A', 'กด "A เท่านั้น" ดูแค่ pattern ที่ชัดที่สุด'],
            ['4', 'ดูกราฟประกอบ', 'กด "ดูกราฟ" ในการ์ด ยืนยันด้วยตาก่อนตัดสินใจ'],
            ['5', 'ถาม AI ต่อ', 'ชอบหุ้นตัวไหน ไปพิมพ์ "วิเคราะห์ CPN แบบเต็ม" ใน Command Box'],
          ].map(([num, title, desc]) => (
            <div key={num} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.3)', color: '#4F8EF7', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{num}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e2f0' }}>{title}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{desc}</div>
              </div>
            </div>
          ))}

          <div style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.3)', borderRadius: 8, padding: '10px 12px', marginTop: 8, fontSize: 11, color: '#9ca3af', lineHeight: 1.6 }}>
            <strong style={{ color: '#FB923C' }}>⚠️ ข้อควรระวัง</strong> — Pattern Radar เป็นเครื่องมือช่วยตัดสินใจ ไม่ใช่คำแนะนำการลงทุน chart pattern มีโอกาสล้มเหลวเสมอ ห้ามลงทุนเกินกว่าที่รับความเสี่ยงได้
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ScoreBar({ score }) {
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 75 ? '#FCD34D' : pct >= 55 ? '#4F8EF7' : '#6b6862';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: 3, background: '#1e1e1e', borderRadius: 2 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontSize: 10, color: '#555', minWidth: 26, textAlign: 'right' }}>{pct}</span>
    </div>
  );
}

function PatternCard({ item, pattern }) {
  const [expanded, setExpanded] = useState(false);
  const meta = PATTERN_META[pattern.pattern] || { icon: '◈', color: '#8a8780', desc: pattern.label };
  const gc   = GRADE_COLOR[pattern.grade] || '#555';
  const gb   = GRADE_BG[pattern.grade]    || 'transparent';
  const isBearish = pattern.bias === 'bearish';

  return (
    <div style={{
      background: '#0f0f11',
      border: `1px solid ${isBearish ? 'rgba(217,105,95,0.2)' : 'rgba(95,184,122,0.18)'}`,
      borderRadius: 12,
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      <div style={{ padding: '12px 14px' }}>
        {/* Row 1: ticker + grade + pattern name */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#e8e6e1', letterSpacing: 0.5 }}>
              {item.ticker}
            </span>
            <span style={{ fontSize: 10, color: '#555', background: '#1a1a1a', borderRadius: 4, padding: '1px 5px' }}>
              {MARKET_LABEL[item.market] || item.market}
            </span>
            <span style={{ fontSize: 11, color: isBearish ? '#d9695f' : '#5fb87a' }}>
              {isBearish ? '▼' : '▲'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, color: gc,
              background: gb, borderRadius: 5, padding: '2px 7px',
              border: `1px solid ${gc}40`,
            }}>
              {pattern.grade}
            </span>
            <span style={{ fontSize: 11, color: meta.color, fontWeight: 600 }}>
              {meta.icon} {pattern.label}
            </span>
          </div>
        </div>

        {/* Row 2: entry / tp / sl */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
          {pattern.entry != null && (
            <div>
              <div style={{ fontSize: 9, color: '#555', marginBottom: 1 }}>Entry</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#4F8EF7', fontVariantNumeric: 'tabular-nums' }}>
                {pattern.entry.toLocaleString()}
              </div>
            </div>
          )}
          {pattern.tp != null && (
            <div>
              <div style={{ fontSize: 9, color: '#555', marginBottom: 1 }}>TP</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#5fb87a', fontVariantNumeric: 'tabular-nums' }}>
                {pattern.tp.toLocaleString()}
              </div>
            </div>
          )}
          {pattern.sl != null && (
            <div>
              <div style={{ fontSize: 9, color: '#555', marginBottom: 1 }}>SL</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#d9695f', fontVariantNumeric: 'tabular-nums' }}>
                {pattern.sl.toLocaleString()}
              </div>
            </div>
          )}
          <div style={{ marginLeft: 'auto' }}>
            <div style={{ fontSize: 9, color: '#555', marginBottom: 1 }}>Duration</div>
            <div style={{ fontSize: 11, color: '#6b6862' }}>~{Math.round(pattern.duration / 5)}w</div>
          </div>
        </div>

        {/* Score bar */}
        <ScoreBar score={pattern.score} />

        {/* Expand button */}
        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            marginTop: 10, width: '100%', padding: '5px 0',
            background: expanded ? '#1a1a20' : 'transparent',
            border: '1px solid #1e1e22', borderRadius: 7,
            fontSize: 11, color: '#555', cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {expanded ? '▲ ซ่อนกราฟ' : '📈 ดูกราฟ'}
        </button>
      </div>

      {/* Inline chart */}
      {expanded && (
        <div style={{ borderTop: '1px solid #1a1a1a', padding: '0 14px 14px' }}>
          <MiniChart
            ticker={item.ticker}
            market={item.market}
            entry={pattern.entry}
            tp={pattern.tp}
            sl={pattern.sl}
          />
        </div>
      )}
    </div>
  );
}

export default function PatternRadar({ portfolio = [] }) {
  const [data, setData]         = useState(null);
  const [scanning, setScanning] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mktFilter, setMktFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('AB');
  const [showHelp, setShowHelp]   = useState(false);

  const load = useCallback(() => {
    fetch('/api/patterns', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const scan = async () => {
    setScanning(true);
    try {
      const r = await fetch('/api/patterns/scan', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolio }),
      });
      const d = await r.json();
      if (d.results) setData({ results: d.results, lastScan: d.lastScan, alertsSent: {} });
    } catch {}
    setScanning(false);
  };

  // Flatten results into [{ ticker, market, pattern }] and apply filters
  const all = (data?.results || []).flatMap(row =>
    row.patterns.map(p => ({ ticker: row.ticker, market: row.market, pattern: p }))
  );

  const filtered = all.filter(({ market, pattern }) => {
    if (mktFilter !== 'all' && market !== mktFilter) return false;
    if (gradeFilter === 'A'  && pattern.grade !== 'A') return false;
    if (gradeFilter === 'AB' && pattern.grade !== 'A' && pattern.grade !== 'B') return false;
    return true;
  }).sort((a, b) => b.pattern.score - a.pattern.score);

  // Counts for badges
  const countA  = all.filter(x => x.pattern.grade === 'A').length;
  const countAB = all.filter(x => x.pattern.grade === 'A' || x.pattern.grade === 'B').length;

  return (
    <div id="pattern-radar" style={{
      background: '#0c0c10',
      border: '1px solid rgba(79,142,247,0.3)',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 0 0 1px rgba(79,142,247,0.06), 0 2px 16px rgba(0,0,0,0.4)',
    }}>
      {/* Header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
          background: '#0f0f16',
          borderBottom: collapsed ? 'none' : '1px solid #1e1e2a',
          cursor: 'pointer',
        }}
        onClick={() => setCollapsed(v => !v)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#8b8b9a', textTransform: 'uppercase' }}>
            📡 Pattern Radar
          </span>
          {countAB > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 700,
              background: 'rgba(252,211,77,0.12)', color: '#FCD34D',
              border: '1px solid rgba(252,211,77,0.25)',
              borderRadius: 99, padding: '1px 7px',
            }}>
              {countA > 0 ? `${countA}A · ` : ''}{countAB} setups
            </span>
          )}
          {data?.lastScan && (
            <span style={{ fontSize: 10, color: '#444' }}>{fmtTime(data.lastScan)}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={e => { e.stopPropagation(); setShowHelp(true); }}
            style={{
              fontSize: 11, fontWeight: 700,
              color: '#555',
              background: 'transparent',
              border: '1px solid #252525',
              borderRadius: 6, padding: '3px 8px', cursor: 'pointer',
            }}
            title="คู่มือ Pattern Radar"
          >
            ?
          </button>
          <button
            onClick={e => { e.stopPropagation(); scan(); }}
            disabled={scanning}
            style={{
              fontSize: 11,
              color: scanning ? '#555' : '#7a9fd4',
              background: scanning ? 'transparent' : 'rgba(79,142,247,0.08)',
              border: `1px solid ${scanning ? '#252525' : 'rgba(79,142,247,0.3)'}`,
              borderRadius: 6, padding: '3px 10px', cursor: scanning ? 'default' : 'pointer',
              fontWeight: 600,
            }}
          >
            {scanning ? '⟳ กำลังสแกน…' : '↻ Scan'}
          </button>
          <span style={{ fontSize: 12, color: '#555' }}>{collapsed ? '▼' : '▲'}</span>
        </div>
      </div>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {!collapsed && (
        <div style={{ padding: '12px 16px' }}>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            {/* Market filter */}
            <div style={{ display: 'flex', gap: 4 }}>
              {['all', 'us', 'set', 'crypto'].map(m => (
                <button
                  key={m}
                  onClick={() => setMktFilter(m)}
                  style={{
                    fontSize: 10, padding: '3px 8px', borderRadius: 6, cursor: 'pointer',
                    border: 'none',
                    background: mktFilter === m ? '#2a2a32' : 'transparent',
                    color: mktFilter === m ? '#e8e6e1' : '#444',
                    fontWeight: mktFilter === m ? 700 : 400,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}
                >
                  {m === 'all' ? 'ALL' : m.toUpperCase()}
                </button>
              ))}
            </div>
            <div style={{ width: 1, background: '#1a1a1a', margin: '0 2px' }} />
            {/* Grade filter */}
            {[['A', 'A เท่านั้น', '#FCD34D'], ['AB', 'A + B', '#4F8EF7'], ['ABC', 'ทั้งหมด', '#555']].map(([g, label, color]) => (
              <button
                key={g}
                onClick={() => setGradeFilter(g)}
                style={{
                  fontSize: 10, padding: '3px 8px', borderRadius: 6, cursor: 'pointer',
                  border: `1px solid ${gradeFilter === g ? color + '50' : 'transparent'}`,
                  background: gradeFilter === g ? color + '15' : 'transparent',
                  color: gradeFilter === g ? color : '#444',
                  fontWeight: gradeFilter === g ? 700 : 400,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Results */}
          {!data && (
            <div style={{ textAlign: 'center', padding: '28px 0' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📡</div>
              <div style={{ fontSize: 13, color: '#8b8b9a', marginBottom: 4 }}>กด <strong style={{ color: '#7a9fd4' }}>↻ Scan</strong> เพื่อเริ่มตรวจหา Pattern</div>
              <div style={{ fontSize: 11, color: '#444' }}>สแกน US · SET · Crypto — ใช้เวลา ~20 วินาที</div>
            </div>
          )}
          {data && !scanning && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 12, color: '#444' }}>
              {all.length === 0
                ? `ไม่พบ pattern ที่มีนัยสำคัญ · สแกนล่าสุด ${fmtTime(data.lastScan)}`
                : `ไม่มี pattern ตรงกับ filter ที่เลือก (ทั้งหมด ${all.length} setups)`}
            </div>
          )}
          {scanning && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>⟳ กำลังสแกน {Object.values({ us: 25, set: 18, crypto: 12 }).reduce((a, b) => a + b, 0)} หุ้น…</div>
              <div style={{ fontSize: 10, color: '#333' }}>ใช้เวลาประมาณ 15–25 วินาที</div>
            </div>
          )}
          {!scanning && filtered.length > 0 && (
            <>
              <div style={{ fontSize: 10, color: '#333', marginBottom: 10 }}>
                พบ {filtered.length} setups · เรียงตาม score
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filtered.map(({ ticker, market, pattern }, i) => (
                  <PatternCard
                    key={`${ticker}-${pattern.pattern}-${i}`}
                    item={{ ticker, market }}
                    pattern={pattern}
                  />
                ))}
              </div>
            </>
          )}

          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14, paddingTop: 10, borderTop: '1px solid #111' }}>
            {Object.entries(PATTERN_META).map(([key, m]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 10, color: m.color }}>{m.icon}</span>
                <span style={{ fontSize: 10, color: '#444' }}>{m.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
