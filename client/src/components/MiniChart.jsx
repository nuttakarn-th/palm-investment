import { useState, useEffect } from 'react';

const PERIODS = ['1mo', '3mo', '6mo'];
const PERIOD_LABELS = { '1mo': '1M', '3mo': '3M', '6mo': '6M' };

function toYahooSymbol(ticker, market) {
  const t = ticker.toUpperCase();
  if (market === 'set') return `${t}.BK`;
  if (market === 'crypto') return `${t}-USD`;
  return t;
}

function usePriceHistory(ticker, market, period) {
  const [state, setState] = useState({ points: [], currency: 'USD', currentPrice: null, loading: true, error: null });

  useEffect(() => {
    if (!ticker) { setState(s => ({ ...s, loading: false })); return; }
    setState(s => ({ ...s, loading: true, error: null }));
    const sym = toYahooSymbol(ticker, market);
    fetch(`/api/chart/${encodeURIComponent(sym)}?period=${period}`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        const closes = data.closes || [];
        const timestamps = data.timestamps || [];
        const points = [];
        closes.forEach((c, i) => {
          if (c != null && timestamps[i] != null) points.push({ t: timestamps[i] * 1000, price: c });
        });
        setState({ points, currency: data.currency || 'USD', currentPrice: data.currentPrice, loading: false, error: null });
      })
      .catch(() => setState({ points: [], currency: 'USD', currentPrice: null, loading: false, error: 'ไม่พบข้อมูล' }));
  }, [ticker, market, period]);

  return state;
}

const VW = 400;
const VH = 100;
const PAD = { top: 10, bottom: 14, left: 36, right: 8 };
const IW = VW - PAD.left - PAD.right;
const IH = VH - PAD.top - PAD.bottom;

function fmt(n) {
  if (n == null) return '';
  return n >= 1000 ? n.toLocaleString('en', { maximumFractionDigits: 0 }) : n.toFixed(2);
}

export default function MiniChart({ item }) {
  const [period, setPeriod] = useState('3mo');
  const { points, currency, currentPrice, loading, error } = usePriceHistory(item.ticker, item.market, period);

  const entry = parseFloat(item.buyPrice) || null;
  const live = currentPrice ?? (points.length ? points[points.length - 1].price : null);

  const gradId = `gc-${item.ticker.replace(/[^a-zA-Z0-9]/g, '_')}`;

  if (loading) {
    return (
      <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-3">
        <div className="text-[11px] font-bold text-neutral-500 mb-2">{item.ticker}</div>
        <div className="h-[80px] flex items-center justify-center">
          <span className="text-[10px] text-neutral-700 animate-pulse">กำลังโหลด…</span>
        </div>
      </div>
    );
  }

  if (error || points.length < 2) {
    return (
      <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-neutral-400">{item.ticker}</span>
          <span className="text-[10px] text-neutral-700">{error || 'ไม่มีข้อมูล'}</span>
        </div>
      </div>
    );
  }

  // Compute chart bounds — include entry price so the line always appears
  const prices = points.map(p => p.price);
  const rawMin = Math.min(...prices);
  const rawMax = Math.max(...prices);
  const pad = (rawMax - rawMin) * 0.12 || rawMin * 0.05 || 1;
  const allValues = entry ? [...prices, entry] : prices;
  const minV = Math.min(...allValues) - pad;
  const maxV = Math.max(...allValues) + pad;
  const range = maxV - minV || 1;

  const toX = (i) => PAD.left + (i / Math.max(points.length - 1, 1)) * IW;
  const toY = (price) => PAD.top + IH - ((price - minV) / range) * IH;

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(p.price).toFixed(1)}`).join(' ');
  const lastX = toX(points.length - 1);
  const lastY = toY(points[points.length - 1].price);
  const fillPath = `${linePath} L ${lastX.toFixed(1)} ${(PAD.top + IH).toFixed(1)} L ${PAD.left.toFixed(1)} ${(PAD.top + IH).toFixed(1)} Z`;

  const isUp = live != null && entry != null ? live >= entry : live != null ? live >= points[0].price : true;
  const lineColor = isUp ? '#34D399' : '#f87171';

  const pct = entry && live ? ((live - entry) / entry) * 100 : null;
  const entryY = entry ? toY(entry) : null;
  const showEntryLine = entryY != null && entryY >= PAD.top && entryY <= PAD.top + IH;

  const currStr = currency && currency !== 'USD' ? `${currency} ` : '$';

  return (
    <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[12px] font-bold text-neutral-300 shrink-0">{item.ticker}</span>
          {live != null && (
            <span className="text-[11px] text-neutral-500 truncate">{currStr}{fmt(live)}</span>
          )}
          {pct != null && (
            <span className={`text-[11px] font-bold shrink-0 ${pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
            </span>
          )}
        </div>
        <div className="flex gap-0.5 shrink-0">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`text-[9px] px-1.5 py-0.5 rounded transition-colors ${
                period === p
                  ? 'bg-[#1e1e1e] text-white'
                  : 'text-neutral-700 hover:text-neutral-400'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* SVG */}
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ display: 'block' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.18" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Fill */}
        <path d={fillPath} fill={`url(#${gradId})`} />

        {/* Price line */}
        <path d={linePath} fill="none" stroke={lineColor} strokeWidth="1.5" />

        {/* Entry price dashed line */}
        {showEntryLine && (
          <>
            <line
              x1={PAD.left} y1={entryY} x2={VW - PAD.right} y2={entryY}
              stroke="#4F8EF7" strokeWidth="1" strokeDasharray="3,3" opacity="0.7"
            />
            <text x={PAD.left - 2} y={entryY - 2} fill="#4F8EF7" fontSize="7" textAnchor="end" opacity="0.8">
              เข้า
            </text>
          </>
        )}

        {/* Current price dot */}
        <circle cx={lastX} cy={lastY} r="3" fill={lineColor} stroke="#0a0a0a" strokeWidth="1.5" />

        {/* Y-axis price labels */}
        {[0, 0.5, 1].map(frac => (
          <text key={frac} x={PAD.left - 3} y={PAD.top + IH * frac + 3} fill="#333" fontSize="7" textAnchor="end">
            {fmt(maxV - (maxV - minV) * frac)}
          </text>
        ))}
      </svg>

      {/* Footer legend */}
      {entry && (
        <div className="flex items-center gap-3 mt-1 text-[9px] text-neutral-700">
          <span className="flex items-center gap-1">
            <svg width="12" height="4" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
              <line x1="0" y1="2" x2="12" y2="2" stroke="#4F8EF7" strokeWidth="1" strokeDasharray="2,2" />
            </svg>
            เข้า {currStr}{fmt(entry)}
          </span>
        </div>
      )}
    </div>
  );
}
