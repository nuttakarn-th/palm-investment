import { useCallback, useEffect, useState } from 'react';

const KEY = 'palm-os:portfolio';

// localStorage is the source of truth (PRD MVP); we mirror to the server so
// the weekly cron can see the portfolio without a browser open.
export function usePortfolio() {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
    fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(items),
    }).catch(() => {});
  }, [items]);

  const add = useCallback((item) => {
    setItems((xs) => [...xs, { ...item, id: `pos_${Date.now().toString(36)}` }]);
  }, []);

  const update = useCallback((id, patch) => {
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);

  const remove = useCallback((id) => {
    setItems((xs) => xs.filter((x) => x.id !== id));
  }, []);

  return { items, add, update, remove };
}

export function pnl(item) {
  const buy = parseFloat(item.buyPrice);
  const cur = parseFloat(item.currentPrice);
  if (!buy || !cur) return null;
  return ((cur - buy) / buy) * 100;
}
