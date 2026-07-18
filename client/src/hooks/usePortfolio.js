import { useCallback, useEffect, useRef, useState } from 'react';

const KEY = 'palm-os:portfolio';

// Server = source of truth across devices.
// localStorage = fast initial paint while server fetch is in flight.
export function usePortfolio() {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  });

  // Prevents the write-back effect from re-POSTing data that came from the server.
  const skipNextPost = useRef(true);
  // Once the user edits locally, don't overwrite with a late-arriving server response.
  const userEdited = useRef(false);

  // On mount: always pull from server so every device sees the latest portfolio.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/portfolio', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((serverItems) => {
        if (cancelled || !Array.isArray(serverItems)) return;
        // If the user already made changes before the response arrived, keep their edits.
        // Their POST will have already won on the server side.
        if (userEdited.current) return;
        skipNextPost.current = true;
        localStorage.setItem(KEY, JSON.stringify(serverItems));
        setItems(serverItems);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Write-back: sync every user change to localStorage + server.
  useEffect(() => {
    if (skipNextPost.current) {
      skipNextPost.current = false;
      return;
    }
    localStorage.setItem(KEY, JSON.stringify(items));
    fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(items),
    }).catch(() => {});
  }, [items]);

  const add = useCallback((item) => {
    userEdited.current = true;
    setItems((xs) => [...xs, { ...item, id: `pos_${Date.now().toString(36)}` }]);
  }, []);

  const update = useCallback((id, patch) => {
    userEdited.current = true;
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);

  const remove = useCallback((id) => {
    userEdited.current = true;
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
