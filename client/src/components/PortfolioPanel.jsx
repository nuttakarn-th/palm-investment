import { useState } from 'react';
import { pnl } from '../hooks/usePortfolio.js';

const EMPTY = { ticker: '', market: 'us', amount: '', buyPrice: '', targetPrice: '', stopLoss: '', currentPrice: '', buyDate: '', note: '' };
const MARKET_LABEL = { us: 'US', set: 'SET', crypto: 'CRYPTO' };

function LiveBadge({ loading, lastUpdate }) {
  if (loading) return <span className="text-[11px] text-neutral-600 animate-pulse">LIVE…</span>;
  if (lastUpdate) {
    const mins = Math.floor((Date.now() - lastUpdate) / 60000);
    return (
      <span className="text-[11px] text-emerald-700">
        ● {mins < 1 ? 'LIVE' : `${mins}m ago`}
      </span>
    );
  }
  return null;
}

export default function PortfolioPanel({ portfolio, marketData }) {
  const { items, add, update, remove } = portfolio;
  const [draft, setDraft] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const submit = () => {
    if (!draft?.ticker.trim()) return;
    if (editingId) update(editingId, draft);
    else add(draft);
    setDraft(null);
    setEditingId(null);
  };

  const groups = ['us', 'set', 'crypto'].map((m) => ({
    market: m,
    rows: items.filter((x) => x.market === m),
  }));

  const totals = items.reduce(
    (acc, item) => {
      const invested = parseFloat(item.amount) || 0;
      const buy = parseFloat(item.buyPrice) || 0;
      const live = marketData?.getPrice(item.ticker, item.market);
      acc.invested += invested;
      if (live?.price && buy) {
        acc.current += invested * (live.price / buy);
      } else {
        acc.current += invested;
        acc.unpriced += invested;
      }
      return acc;
    },
    { invested: 0, current: 0, unpriced: 0 },
  );
  const totalPnlPct =
    totals.invested > 0 ? ((totals.current - totals.invested) / totals.invested) * 100 : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Portfolio</div>
          {marketData && (
            <LiveBadge loading={marketData.loading} lastUpdate={marketData.lastUpdate} />
          )}
        </div>
        <div className="flex items-center gap-2">
          {marketData && !marketData.loading && (
            <button
              onClick={marketData.refresh}
              className="text-[11px] text-neutral-600 hover:text-neutral-400 transition"
              title="รีเฟรชราคา"
            >
              ↻
            </button>
          )}
          <button
            onClick={() => { setDraft({ ...EMPTY }); setEditingId(null); }}
            className="text-[11px] text-[#4F8EF7] hover:underline"
          >
            + เพิ่ม
          </button>
        </div>
      </div>

      {items.length === 0 && !draft && (
        <div className="text-[11px] text-neutral-700 py-2">ยังไม่มีข้อมูลพอร์ต — กด "+ เพิ่ม"</div>
      )}

      {/* Total portfolio value */}
      {items.length > 0 && totals.invested > 0 && (
        <div className="mb-3 rounded-lg border border-[#1e1e1e] bg-[#0d0d0d] px-3 py-2.5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-neutral-700 mb-0.5">มูลค่ารวม</div>
              <div
                className="font-mono text-sm font-bold text-neutral-200 tabular-nums"
                title="ประมาณการณ์ — ลงทุน × (ราคาปัจจุบัน / ราคาซื้อ)"
              >
                ฿{Math.round(totals.current).toLocaleString()}
              </div>
            </div>
            {totalPnlPct !== null && (
              <div className="text-right">
                <div className="text-[11px] uppercase tracking-widest text-neutral-700 mb-0.5">P&L รวม</div>
                <div
                  className={`font-mono text-sm font-bold tabular-nums ${totalPnlPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                >
                  {totalPnlPct >= 0 ? '+' : ''}{totalPnlPct.toFixed(1)}%
                </div>
              </div>
            )}
          </div>
          <div className="mt-1.5 text-[11px] text-neutral-700">
            ลงทุน ฿{Math.round(totals.invested).toLocaleString()}
            {totals.unpriced > 0 && (
              <span className="ml-1 text-neutral-800">(บางตัวยังไม่มีราคา)</span>
            )}
          </div>
        </div>
      )}

      {groups.map((g) =>
        g.rows.length > 0 ? (
          <div key={g.market} className="mb-2">
            <div className="text-[11px] text-neutral-600 mb-1">— {MARKET_LABEL[g.market]}</div>
            {g.rows.map((item) => {
              const live = marketData?.getPrice(item.ticker, item.market);
              const livePrice = live?.price ?? null;
              const p = livePrice
                ? ((livePrice - parseFloat(item.buyPrice)) / parseFloat(item.buyPrice)) * 100
                : pnl(item);

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-[#141414] text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">{item.ticker}</span>
                      {item.market === 'set' && (
                        <span className="text-[11px] text-neutral-700">.BK</span>
                      )}
                    </div>
                    {livePrice != null && (
                      <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                        <span>{live.currency === 'THB' ? '฿' : '$'}{livePrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                        <span className={live.changePct >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                          {live.changePct >= 0 ? '▲' : '▼'}{Math.abs(live.changePct).toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-2">
                    {p !== null && (
                      <span className={`font-medium tabular-nums ${p >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {p >= 0 ? '+' : ''}{p.toFixed(1)}%
                      </span>
                    )}
                    <button
                      onClick={() => { setDraft({ ...EMPTY, ...item }); setEditingId(item.id); }}
                      className="text-neutral-600 hover:text-white active:text-white transition-colors text-sm leading-none"
                      title="แก้ไข"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => remove(item.id)}
                      className="text-neutral-600 hover:text-red-400 active:text-red-400 transition-colors text-sm leading-none"
                      title="ลบ"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null
      )}

      {draft && (
        <div className="mt-2 space-y-1.5 rounded-lg border border-[#242424] bg-[#101010] p-2 text-xs">
          <div className="flex gap-1.5">
            <input
              autoFocus
              placeholder="Ticker (NVDA, PTT, BTC)"
              value={draft.ticker}
              onChange={(e) => setDraft({ ...draft, ticker: e.target.value.toUpperCase() })}
              className="flex-1 min-w-0 rounded bg-[#181818] border border-[#2a2a2a] px-2 py-1 focus:outline-none focus:border-[#4F8EF7]"
            />
            <select
              value={draft.market}
              onChange={(e) => setDraft({ ...draft, market: e.target.value })}
              className="rounded bg-[#181818] border border-[#2a2a2a] px-1 py-1"
            >
              <option value="us">US</option>
              <option value="set">SET</option>
              <option value="crypto">Crypto</option>
            </select>
          </div>
          <input
            placeholder="จำนวนเงินลงทุน (บาท)"
            type="number"
            value={draft.amount}
            onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
            className="w-full rounded bg-[#181818] border border-[#2a2a2a] px-2 py-1 focus:outline-none focus:border-[#4F8EF7]"
          />
          <input
            placeholder="ราคาซื้อ (เข้า)"
            type="number"
            value={draft.buyPrice}
            onChange={(e) => setDraft({ ...draft, buyPrice: e.target.value })}
            className="w-full rounded bg-[#181818] border border-[#2a2a2a] px-2 py-1 focus:outline-none focus:border-[#4F8EF7]"
          />
          <div className="flex gap-1.5">
            <input
              placeholder="ราคาออก / TP"
              type="number"
              value={draft.targetPrice}
              onChange={(e) => setDraft({ ...draft, targetPrice: e.target.value })}
              className="flex-1 min-w-0 rounded bg-[#181818] border border-[#5fb87a]/40 px-2 py-1 focus:outline-none focus:border-[#5fb87a]"
            />
            <input
              placeholder="Stop-Loss"
              type="number"
              value={draft.stopLoss}
              onChange={(e) => setDraft({ ...draft, stopLoss: e.target.value })}
              className="flex-1 min-w-0 rounded bg-[#181818] border border-[#d9695f]/40 px-2 py-1 focus:outline-none focus:border-[#d9695f]"
            />
          </div>
          <div className="text-[11px] text-neutral-600 px-1">
            💡 ราคาปัจจุบันดึงอัตโนมัติ · TP / SL แสดงเป็นเส้นในกราฟ
          </div>
          <input
            type="date"
            value={draft.buyDate}
            onChange={(e) => setDraft({ ...draft, buyDate: e.target.value })}
            className="w-full rounded bg-[#181818] border border-[#2a2a2a] px-2 py-1 text-neutral-400"
          />
          <input
            placeholder="หมายเหตุ (optional)"
            value={draft.note}
            onChange={(e) => setDraft({ ...draft, note: e.target.value })}
            className="w-full rounded bg-[#181818] border border-[#2a2a2a] px-2 py-1 focus:outline-none focus:border-[#4F8EF7]"
          />
          <div className="flex gap-1.5 pt-1">
            <button onClick={submit} className="flex-1 rounded bg-[#34D399] text-black font-semibold py-1">
              {editingId ? 'บันทึก' : 'เพิ่ม'}
            </button>
            <button
              onClick={() => { setDraft(null); setEditingId(null); }}
              className="flex-1 rounded border border-[#2a2a2a] py-1 text-neutral-400"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
