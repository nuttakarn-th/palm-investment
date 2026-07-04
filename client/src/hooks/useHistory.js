import { useCallback, useEffect, useState } from 'react';

const KEY = 'palm-os:reports';

// Report history — localStorage cache (PRD MVP) merged with the server copy
// (which also holds cron-generated weekly reports).
export function useHistory() {
  const [reports, setReports] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/reports', { credentials: 'include' });
      if (!res.ok) return;
      const server = await res.json();
      if (!Array.isArray(server)) return;
      setReports((local) => {
        const seen = new Set(server.map((r) => r.id));
        const merged = [...server, ...local.filter((r) => !seen.has(r.id))].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        localStorage.setItem(KEY, JSON.stringify(merged.slice(0, 100)));
        return merged;
      });
    } catch {
      /* offline — keep local cache */
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addLocal = useCallback((report) => {
    setReports((xs) => {
      if (xs.some((r) => r.id === report.id)) return xs;
      const next = [report, ...xs].slice(0, 100);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { reports, refresh, addLocal };
}
