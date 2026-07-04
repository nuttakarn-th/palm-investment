import { useCallback, useEffect, useState } from 'react';

const KEY = 'palm-os:settings';

export const DEFAULT_SETTINGS = {
  email: '',
  telegramBotToken: '',
  telegramChatId: '',
  weeklyEnabled: true,
  defaultMarket: 'all',
};

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(KEY)) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // pull the server copy once (in case it was edited elsewhere)
  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((s) => setSettings((cur) => ({ ...s, ...cur })))
      .catch(() => {});
  }, []);

  const save = useCallback((next) => {
    setSettings(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    return fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    }).catch(() => {});
  }, []);

  return { settings, save };
}
