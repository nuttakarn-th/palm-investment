import { useState, useEffect, useCallback } from 'react';
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
    <div style={{
      background: '#0a0a0c',
      border: '1px solid #1a1a22',
      borderRadius: 16,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: collapsed ? 'none' : '1px solid #141418',
          cursor: 'pointer',
        }}
        onClick={() => setCollapsed(v => !v)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#6b6862', textTransform: 'uppercase' }}>
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
            <span style={{ fontSize: 10, color: '#333' }}>{fmtTime(data.lastScan)}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={e => { e.stopPropagation(); scan(); }}
            disabled={scanning}
            style={{
              fontSize: 11, color: scanning ? '#444' : '#555',
              background: 'transparent', border: '1px solid #222',
              borderRadius: 6, padding: '3px 9px', cursor: scanning ? 'default' : 'pointer',
            }}
          >
            {scanning ? '⟳ กำลังสแกน…' : '↻ Scan'}
          </button>
          <span style={{ fontSize: 12, color: '#333' }}>{collapsed ? '▼' : '▲'}</span>
        </div>
      </div>

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
            <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 12, color: '#444' }}>
              กด Scan เพื่อเริ่มตรวจหา pattern
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
