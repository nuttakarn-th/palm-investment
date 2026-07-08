import { useCallback, useEffect, useRef, useState } from 'react';

const KEY = 'palm-os:portfolio';

// localStorage = fast initial load; server = cross-device source of truth.
export function usePortfolio() {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  });

  // Prevent the write-back effect from POSTing data that originally came from the server.
  const skipNextPost = useRef(true);

  // On mount: pull from server so portfolio is visible on every device.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/portfolio', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((serverItems) => {
        if (cancelled || !Array.isArray(serverItems) || serverItems.length === 0) return;
        setItems((local) => {
          // Only override if local is empty (avoids race with in-flight user edits).
          if (local.length > 0) return local;
          skipNextPost.current = true;
          localStorage.setItem(KEY, JSON.stringify(serverItems));
          return serverItems;
        });
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
