import { useState } from 'react';

export default function Settings({ settings, onSave, onClose }) {
  const [form, setForm] = useState(settings);
  const [testing, setTesting] = useState({});
  const [weeklyRunning, setWeeklyRunning] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setHome = (k, v) =>
    setForm((f) => ({ ...f, homepage: { ...(f.homepage || {}), [k]: v } }));

  const test = async (kind) => {
    setTesting((t) => ({ ...t, [kind]: '…' }));
    await onSave(form); // save first so the server has the latest creds
    try {
      const r = await fetch(`/api/test/${kind}`, { method: 'POST' }).then((x) => x.json());
      setTesting((t) => ({ ...t, [kind]: r.ok ? '✅ ส่งแล้ว' : `❌ ${r.reason || r.error || 'ล้มเหลว'}` }));
    } catch (e) {
      setTesting((t) => ({ ...t, [kind]: `❌ ${e.message}` }));
    }
  };

  const runWeeklyNow = async () => {
    setWeeklyRunning(true);
    try {
      const r = await fetch('/api/weekly/run', { method: 'POST' }).then((x) => x.json());
      alert(r.ok ? `✅ Weekly report เสร็จแล้ว (${r.reportId})` : `❌ ${r.error}`);
    } catch (e) {
      alert(`❌ ${e.message}`);
    } finally {
      setWeeklyRunning(false);
    }
  };

  const input = 'w-full rounded bg-[#181818] border border-[#2a2a2a] px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#4F8EF7]';
  const label = 'text-[11px] text-neutral-500 mb-1 block';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="w-[520px] max-h-[85vh] overflow-y-auto rounded-2xl border border-[#2a2a2a] bg-[#0d0d0d] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold">⚙️ Settings</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white">✕</button>
        </div>

        <div className="space-y-5">
          <section>
            <div className="text-xs font-semibold text-[#4F8EF7] mb-2">📧 Email Notification (Resend)</div>
            <label className={label}>อีเมลรับ notification</label>
            <input className={input} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="palm@example.com" />
            <div className="mt-1.5 flex items-center gap-2">
              <button onClick={() => test('email')} className="text-[11px] rounded border border-[#333] px-2 py-1 text-neutral-400 hover:text-white">ทดสอบส่ง</button>
              <span className="text-[11px] text-neutral-500">{testing.email}</span>
            </div>
            <p className="text-[10px] text-neutral-600 mt-1">* RESEND_API_KEY ตั้งใน .env ฝั่ง server</p>
          </section>

          <section>
            <div className="text-xs font-semibold text-[#34D399] mb-2">✈️ Telegram Notification</div>
            <label className={label}>Bot Token (จาก @BotFather)</label>
            <input className={input} value={form.telegramBotToken} onChange={(e) => set('telegramBotToken', e.target.value)} placeholder="123456:ABC-DEF…" />
            <label className={`${label} mt-2`}>Chat ID (จาก @userinfobot)</label>
            <input className={input} value={form.telegramChatId} onChange={(e) => set('telegramChatId', e.target.value)} placeholder="123456789" />
            <div className="mt-1.5 flex items-center gap-2">
              <button onClick={() => test('telegram')} className="text-[11px] rounded border border-[#333] px-2 py-1 text-neutral-400 hover:text-white">ทดสอบส่ง</button>
              <span className="text-[11px] text-neutral-500">{testing.telegram}</span>
            </div>
            <details className="mt-2 text-[10px] text-neutral-600">
              <summary className="cursor-pointer">วิธีสร้าง Telegram Bot</summary>
              <ol className="list-decimal ml-4 mt-1 space-y-0.5">
                <li>เปิด Telegram คุยกับ <b>@BotFather</b> → /newbot → ตั้งชื่อ → ได้ Bot Token</li>
                <li>คุยกับ <b>@userinfobot</b> → ได้ Chat ID ของตัวเอง</li>
                <li>กด Start คุยกับ bot ของตัวเองก่อน 1 ครั้ง (ไม่งั้น bot ส่งหาเราไม่ได้)</li>
                <li>กรอกทั้งสองค่าด้านบน แล้วกดทดสอบส่ง</li>
              </ol>
            </details>
          </section>

          <section>
            <div className="text-xs font-semibold text-[#FCD34D] mb-2">📅 Weekly Auto-Report</div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.weeklyEnabled}
                onChange={(e) => set('weeklyEnabled', e.target.checked)}
              />
              เปิดรายงานอัตโนมัติ ทุกอาทิตย์ 08:00 น. (เวลาไทย)
            </label>
            <button
              onClick={runWeeklyNow}
              disabled={weeklyRunning}
              className="mt-2 text-[11px] rounded border border-[#333] px-2 py-1 text-neutral-400 hover:text-white disabled:opacity-40"
            >
              {weeklyRunning ? '⏳ กำลังรัน… (ใช้เวลา 1-2 นาที)' : '▶ รัน Weekly Report เดี๋ยวนี้ (ทดสอบ cron)'}
            </button>
          </section>

          <section>
            <div className="text-xs font-semibold text-[#FB923C] mb-2">🏠 Homepage Content</div>
            <label className={label}>Badge text (บรรทัดเล็กด้านบน)</label>
            <input className={input} value={form.homepage?.badge ?? ''} onChange={(e) => setHome('badge', e.target.value)} placeholder="AI-Powered Investment Team" />
            <label className={`${label} mt-2`}>Headline (คำพาดหัว — ขึ้นบรรทัดใหม่ด้วย \n)</label>
            <textarea
              className={`${input} resize-none`}
              rows={3}
              value={form.homepage?.headline ?? ''}
              onChange={(e) => setHome('headline', e.target.value)}
              placeholder={'วิเคราะห์ลึก\nตัดสินใจเร็ว\nลงทุนมั่นใจ'}
            />
            <label className={`${label} mt-2`}>Subheadline (คำอธิบายใต้หัว)</label>
            <textarea
              className={`${input} resize-none`}
              rows={2}
              value={form.homepage?.subheadline ?? ''}
              onChange={(e) => setHome('subheadline', e.target.value)}
            />
            <label className={`${label} mt-2`}>CTA Button Text</label>
            <input className={input} value={form.homepage?.cta ?? ''} onChange={(e) => setHome('cta', e.target.value)} placeholder="เข้าสู่ Mission Control" />
            <p className="text-[10px] text-neutral-600 mt-1.5">* บันทึกแล้วรีเฟรชหน้า Homepage เพื่อดูการเปลี่ยนแปลง</p>
          </section>

          <section>
            <div className="text-xs font-semibold text-[#A78BFA] mb-2">🎛 อื่นๆ</div>
            <label className={label}>Default Market</label>
            <select className={input} value={form.defaultMarket} onChange={(e) => set('defaultMarket', e.target.value)}>
              <option value="all">All (US + SET + Crypto)</option>
              <option value="us">US Stocks</option>
              <option value="set">SET (หุ้นไทย)</option>
              <option value="crypto">Crypto</option>
            </select>
            <p className="text-[10px] text-neutral-600 mt-2">
              Risk Profile: <b>Moderate-Low</b> (ค่าตายตัวในโค้ด) · API Key: ตั้งใน <code>.env</code> — ไม่ถูกส่งมา browser
            </p>
          </section>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={async () => {
              await onSave(form);
              onClose();
            }}
            className="flex-1 rounded-lg bg-[#4F8EF7] text-black font-semibold text-sm py-2 hover:brightness-110"
          >
            บันทึก
          </button>
          <button onClick={onClose} className="flex-1 rounded-lg border border-[#2a2a2a] text-sm py-2 text-neutral-400">
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
