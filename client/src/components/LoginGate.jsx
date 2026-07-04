import { useState } from 'react';

export default function LoginGate({ onLogin }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!pw) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) {
        onLogin();
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || 'รหัสผ่านไม่ถูกต้อง');
        setPw('');
      }
    } catch {
      setError('ไม่สามารถเชื่อมต่อ server ได้');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center">
      <div className="w-80 rounded-2xl border border-[#1a1a1a] bg-[#0e0e0e] p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎯</div>
          <div className="font-bold text-lg tracking-wide">
            PALM INVESTMENT <span className="text-[#4F8EF7]">OS</span>
          </div>
          <div className="text-neutral-600 text-xs mt-2">Mission Control · Private Access</div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="รหัสผ่าน"
            autoFocus
            autoComplete="current-password"
            className="w-full rounded-lg border border-[#242424] bg-[#141414] px-4 py-3 text-sm focus:outline-none focus:border-[#4F8EF7] transition-colors"
          />
          {error && (
            <div className="text-red-400 text-xs px-1">⚠ {error}</div>
          )}
          <button
            type="submit"
            disabled={loading || !pw}
            className="w-full rounded-lg bg-[#4F8EF7] text-white font-semibold py-3 text-sm hover:bg-[#3b7de8] disabled:opacity-40 transition"
          >
            {loading ? '● กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  );
}
