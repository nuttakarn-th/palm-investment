import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot,
} from 'recharts';

const PERIODS = ['1mo', '3mo', '6mo'];
const PERIOD_LABELS = { '1mo': '1M', '3mo': '3M', '6mo': '6M' };

function toYahooSymbol(ticker, market) {
  const t = ticker.toUpperCase();
  if (market === 'set') return `${t}.BK`;
  if (market === 'crypto') return `${t}-USD`;
  return t;
}

function fmtDate(ts) {
  const d = new Date(ts);
  return `${d.getDate()} ${['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'][d.getMonth()]}`;
}

function usePriceHistory(ticker, market, period) {
  const [state, setState] = useState({ data: [], currency: 'USD', currentPrice: null, loading: true, error: null });

  useEffect(() => {
    if (!ticker) { setState(s => ({ ...s, loading: false })); return; }
    setState(s => ({ ...s, loading: true, error: null }));
    const sym = toYahooSymbol(ticker, market);
    fetch(`/api/chart/${encodeURIComponent(sym)}?period=${period}`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(raw => {
        const closes = raw.closes || [];
        const timestamps = raw.timestamps || [];
        // Thin to ~30 points max so X-axis labels don't crowd
        const all = [];
        closes.forEach((c, i) => {
          if (c != null && timestamps[i] != null) all.push({ date: fmtDate(timestamps[i] * 1000), price: c, ts: timestamps[i] });
        });
        const step = Math.max(1, Math.floor(all.length / 30));
        const data = all.filter((_, i) => i % step === 0 || i === all.length - 1);
        setState({ data, currency: raw.currency || 'USD', currentPrice: raw.currentPrice, loading: false, error: null });
      })
      .catch(() => setState({ data: [], currency: 'USD', currentPrice: null, loading: false, error: 'ไม่พบข้อมูล' }));
  }, [ticker, market, period]);

  return state;
}

function fmt(n, currency) {
  if (n == null) return '';
  const prefix = currency === 'THB' ? '฿' : '$';
  return prefix + (n >= 100 ? n.toLocaleString('en', { maximumFractionDigits: 2 }) : n.toFixed(2));
}

export default function MiniChart({ item }) {
  const [period, setPeriod] = useState('3mo');
  const { data, currency, currentPrice, loading, error } = usePriceHistory(item.ticker, item.market, period);

  const entry = parseFloat(item.buyPrice) || null;
  const targetPrice = parseFloat(item.targetPrice) || null;
  const stopLoss = parseFloat(item.stopLoss) || null;
  const live = currentPrice ?? (data.length ? data[data.length - 1].price : null);
  const lastPoint = data.length ? data[data.length - 1] : null;

  const isUp = live != null && entry != null ? live >= entry : true;
  const lineColor = isUp ? '#5fb87a' : '#d9695f';
  const pct = entry && live ? ((live - entry) / entry) * 100 : null;

  const currPrefix = currency === 'THB' ? '฿' : '$';

  // Y-axis domain — include all levels with padding
  const allPrices = data.map(d => d.price).filter(Boolean);
  if (entry) allPrices.push(entry);
  if (targetPrice) allPrices.push(targetPrice);
  if (stopLoss) allPrices.push(stopLoss);
  if (live) allPrices.push(live);
  const rawMin = allPrices.length ? Math.min(...allPrices) : 0;
  const rawMax = allPrices.length ? Math.max(...allPrices) : 1;
  const pad = (rawMax - rawMin) * 0.15 || rawMin * 0.05 || 1;
  const domain = [rawMin - pad, rawMax + pad];

  if (loading) return (
    <div style={{ background: '#17171a', borderRadius: 16, padding: '20px 16px', border: '1px solid #2a2a2e' }}>
      <div style={{ fontSize: 12, color: '#6b6862', marginBottom: 8 }}>{item.ticker}</div>
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 11, color: '#444', animation: 'pulse 1.5s infinite' }}>กำลังโหลด…</span>
      </div>
    </div>
  );

  if (error || data.length < 2) return (
    <div style={{ background: '#17171a', borderRadius: 16, padding: '20px 16px', border: '1px solid #2a2a2e' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#8a8780' }}>{item.ticker}</span>
        <span style={{ fontSize: 11, color: '#444' }}>{error || 'ไม่มีข้อมูล'}</span>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#17171a', borderRadius: 16, padding: '20px 16px 16px', border: '1px solid #2a2a2e' }}>

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 12, color: '#8a8780', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
              {item.ticker}{item.market === 'set' ? '.SET' : item.market === 'crypto' ? '' : ''}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              {live != null && (
                <span style={{ fontSize: 28, fontWeight: 600, color: '#f5f3ee' }}>{fmt(live, currency)}</span>
              )}
              {pct != null && (
                <span style={{ fontSize: 13, color: pct >= 0 ? '#5fb87a' : '#d9695f', fontWeight: 500 }}>
                  {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
                </span>
              )}
            </div>
          </div>

          {/* Period picker */}
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: '3px 8px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: 11,
                  cursor: 'pointer',
                  background: period === p ? '#2e2e34' : 'transparent',
                  color: period === p ? '#e8e6e1' : '#555',
                  fontWeight: period === p ? 600 : 400,
                }}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 16, left: -4, bottom: 0 }}>
          <defs>
            <linearGradient id={`fill-${item.ticker.replace(/[^a-z0-9]/gi, '_')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity={0.3} />
              <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#26262a" vertical={false} />

          <XAxis
            dataKey="date"
            tick={{ fill: '#555', fontSize: 10 }}
            axisLine={{ stroke: '#2a2a2e' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={domain}
            tick={{ fill: '#555', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={v => `${currPrefix}${v >= 100 ? Math.round(v) : v.toFixed(2)}`}
          />

          <Tooltip
            contentStyle={{ background: '#1f1f23', border: '1px solid #33333a', borderRadius: 10, fontSize: 12, color: '#e8e6e1' }}
            labelStyle={{ color: '#8a8780', marginBottom: 4 }}
            formatter={v => [`${fmt(v, currency)}`, 'ราคา']}
          />

          {/* Entry price line */}
          {entry && (
            <ReferenceLine
              y={entry}
              stroke="#4F8EF7"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{ value: `เข้า ${fmt(entry, currency)}`, position: 'insideTopLeft', fill: '#4F8EF7', fontSize: 10 }}
            />
          )}

          {/* Target / take-profit line */}
          {targetPrice && (
            <ReferenceLine
              y={targetPrice}
              stroke="#5fb87a"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{ value: `TP ${fmt(targetPrice, currency)}`, position: 'insideTopLeft', fill: '#5fb87a', fontSize: 10 }}
            />
          )}

          {/* Stop-loss line */}
          {stopLoss && (
            <ReferenceLine
              y={stopLoss}
              stroke="#d9695f"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{ value: `SL ${fmt(stopLoss, currency)}`, position: 'insideBottomLeft', fill: '#d9695f', fontSize: 10 }}
            />
          )}

          <Area
            type="monotone"
            dataKey="price"
            stroke={lineColor}
            strokeWidth={2}
            fill={`url(#fill-${item.ticker.replace(/[^a-z0-9]/gi, '_')})`}
            dot={false}
            activeDot={{ r: 4, fill: lineColor, stroke: '#17171a', strokeWidth: 2 }}
          />

          {/* Current price dot */}
          {lastPoint && live != null && (
            <ReferenceDot
              x={lastPoint.date}
              y={live}
              r={5}
              fill="#f5f3ee"
              stroke={lineColor}
              strokeWidth={2}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, marginTop: 10, paddingLeft: 4, flexWrap: 'wrap' }}>
        {entry && <LegendItem color="#4F8EF7" label={`เข้า ${fmt(entry, currency)}`} />}
        {live != null && <LegendItem color={lineColor} label={`ปัจจุบัน ${fmt(live, currency)}`} />}
        {targetPrice && <LegendItem color="#5fb87a" label={`TP ${fmt(targetPrice, currency)}`} />}
        {stopLoss && <LegendItem color="#d9695f" label={`SL ${fmt(stopLoss, currency)}`} />}
      </div>

      {/* Stat cards */}
      {(entry || targetPrice || stopLoss) && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {entry && <StatCard label="ราคาเข้า" value={fmt(entry, currency)} color="#4F8EF7" />}
          {live != null && <StatCard label="ปัจจุบัน" value={fmt(live, currency)} color={pct != null ? (pct >= 0 ? '#5fb87a' : '#d9695f') : '#f5f3ee'} />}
          {targetPrice && <StatCard label="ราคาออก / TP" value={fmt(targetPrice, currency)} color="#5fb87a" />}
          {stopLoss && <StatCard label="Stop-Loss" value={fmt(stopLoss, currency)} color="#d9695f" />}
        </div>
      )}
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 12, height: 2, background: color, borderRadius: 2 }} />
      <span style={{ fontSize: 10, color: '#6b6862' }}>{label}</span>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ flex: 1, background: '#111113', border: '1px solid #2a2a2e', borderRadius: 10, padding: '10px 12px' }}>
      <div style={{ fontSize: 10, color: '#555', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color }}>{value}</div>
    </div>
  );
}
