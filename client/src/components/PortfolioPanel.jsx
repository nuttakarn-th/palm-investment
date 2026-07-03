import { useState } from 'react';
import { pnl } from '../hooks/usePortfolio.js';

const EMPTY = { ticker: '', market: 'us', amount: '', buyPrice: '', currentPrice: '', buyDate: '', note: '' };

const MARKET_LABEL = { us: 'US', set: 'SET', crypto: 'CRYPTO' };

export default function PortfolioPanel({ portfolio }) {
  const { items, add, update, remove } = portfolio;
  const [draft, setDraft] = useState(null); // null = closed, object = form open
  const [editingId, setEditingId] = useState(null);

  const submit = () => {
    if (!draft?.ticker.trim()) return;
    if (editingId) {
      update(editingId, draft);
    } else {
      add(draft);
    }
    setDraft(null);
    setEditingId(null);
  };

  const groups = ['us', 'set', 'crypto'].map((m) => ({
    market: m,
    rows: items.filter((x) => x.market === m),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] uppercase tracking-wider text-neutral-500">Portfolio</div>
        <button
          onClick={() => {
            setDraft({ ...EMPTY });
            setEditingId(null);
          }}
          className="text-[11px] text-[#4F8EF7] hover:underline"
        >
          + เพิ่ม
        </button>
      </div>

      {items.length === 0 && !draft && (
        <div className="text-[11px] text-neutral-700 py-2">ยังไม่มีข้อมูลพอร์ต — กด "+ เพิ่ม"</div>
      )}

      {groups.map(
        (g) =>
          g.rows.length > 0 && (
            <div key={g.market} className="mb-2">
              <div className="text-[10px] text-neutral-600 mb-1">— {MARKET_LABEL[g.market]}</div>
              {g.rows.map((item) => {
                const p = pnl(item);
                return (
                  <div
                    key={item.id}
                    className="group flex items-center justify-between rounded px-2 py-1 hover:bg-[#141414] text-xs"
                  >
                    <div className="min-w-0">
                      <span className="font-medium">{item.ticker}</span>
                      {item.amount && <span className="text-neutral-600 ml-1.5">{Number(item.amount).toLocaleString()}฿</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      {p !== null && (
                        <span className={p >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                          {p >= 0 ? '+' : ''}
                          {p.toFixed(1)}%
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setDraft({ ...EMPTY, ...item });
                          setEditingId(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-white"
                        title="แก้ไข"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => remove(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400"
                        title="ลบ"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
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
          <div className="flex gap-1.5">
            <input
              placeholder="ราคาซื้อ"
              type="number"
              value={draft.buyPrice}
              onChange={(e) => setDraft({ ...draft, buyPrice: e.target.value })}
              className="flex-1 min-w-0 rounded bg-[#181818] border border-[#2a2a2a] px-2 py-1 focus:outline-none focus:border-[#4F8EF7]"
            />
            <input
              placeholder="ราคาปัจจุบัน"
              type="number"
              value={draft.currentPrice}
              onChange={(e) => setDraft({ ...draft, currentPrice: e.target.value })}
              className="flex-1 min-w-0 rounded bg-[#181818] border border-[#2a2a2a] px-2 py-1 focus:outline-none focus:border-[#4F8EF7]"
            />
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
              onClick={() => {
                setDraft(null);
                setEditingId(null);
              }}
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
