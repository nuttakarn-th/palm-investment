import { useCallback, useEffect, useRef, useState } from 'react';

const REFRESH_MS = 5 * 60 * 1000; // 5 minutes

function toYahooSymbol(ticker, market) {
  const t = ticker.toUpperCase();
  if (market === 'set') return `${t}.BK`;
  if (market === 'crypto') return `${t}-USD`;
  return t;
}

export function useMarketData(items) {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const timerRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!items.length) return;
    const symbols = [...new Set(items.map((i) => toYahooSymbol(i.ticker, i.market)))].join(',');
    setLoading(true);
    try {
      const res = await fetch(`/api/market?symbols=${encodeURIComponent(symbols)}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPrices(data);
        setLastUpdate(new Date());
      }
    } catch { /* network error */ }
    setLoading(false);
  }, [items]);

  useEffect(() => {
    refresh();
    timerRef.current = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(timerRef.current);
  }, [refresh]);

  const getPrice = useCallback(
    (ticker, market) => prices[toYahooSymbol(ticker, market)] ?? null,
    [prices]
  );

  return { getPrice, loading, lastUpdate, refresh };
}
