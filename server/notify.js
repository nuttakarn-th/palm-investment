// Email (Resend) + Telegram notification senders.
import { Resend } from 'resend';
import TelegramBot from 'node-telegram-bot-api';
import { store } from './store.js';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

function creds() {
  const s = store.getSettings();
  return {
    email: s.email,
    resendKey: process.env.RESEND_API_KEY || '',
    from: process.env.RESEND_FROM || 'Palm Investment OS <onboarding@resend.dev>',
    tgToken: s.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN || '',
    tgChatId: s.telegramChatId || process.env.TELEGRAM_CHAT_ID || '',
  };
}

// very small markdown → html for the email body
function mdToHtml(md) {
  return md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^# (.*)$/gm, '<h1 style="font-size:20px;margin:16px 0 8px">$1</h1>')
    .replace(/^## (.*)$/gm, '<h2 style="font-size:16px;margin:14px 0 6px">$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\- (.*)$/gm, '<div style="margin:2px 0">&bull; $1</div>')
    .replace(/^\d+\. (.*)$/gm, '<div style="margin:2px 0">$&</div>')
    .replace(/\n{2,}/g, '<br/>')
    .replace(/\n/g, '<br/>');
}

export async function sendEmail(report) {
  const { email, resendKey, from } = creds();
  if (!email || !resendKey) return { ok: false, skipped: true, reason: 'email หรือ RESEND_API_KEY ยังไม่ได้ตั้งค่า' };

  const resend = new Resend(resendKey);
  const subject =
    report.type === 'weekly'
      ? `📅 Weekly Report — ${new Date(report.createdAt).toLocaleDateString('th-TH')}`
      : `🎯 Palm Investment OS — ${report.finalCall || 'รายงานพร้อมแล้ว'}`;

  const html = `
  <div style="font-family:Inter,system-ui,sans-serif;background:#0b0b0b;color:#eee;padding:24px;border-radius:12px;max-width:640px">
    ${mdToHtml(report.summary)}
    <hr style="border:none;border-top:1px solid #333;margin:16px 0"/>
    <div style="color:#888;font-size:12px">
      คำสั่ง: ${report.command}<br/>
      Tokens: ${report.totals.input + report.totals.output} · ~$${report.totals.cost.toFixed(4)}<br/>
      <a href="${APP_URL}" style="color:#4F8EF7">เปิดดูรายงานเต็ม</a>
    </div>
  </div>`;

  const { error } = await resend.emails.send({ from, to: email, subject, html });
  if (error) return { ok: false, error: error.message || String(error) };
  return { ok: true };
}

export async function sendTelegram(report) {
  const { tgToken, tgChatId } = creds();
  if (!tgToken || !tgChatId) return { ok: false, skipped: true, reason: 'Telegram token/chat id ยังไม่ได้ตั้งค่า' };

  const bot = new TelegramBot(tgToken, { polling: false });
  const lines =
    report.type === 'weekly'
      ? [`📅 Weekly Report — ${new Date(report.createdAt).toLocaleDateString('th-TH')}`]
      : ['🎯 Palm Investment OS'];
  lines.push('', `คำสั่ง: ${report.command}`);
  if (report.finalCall) lines.push(`Final Call: ${report.finalCall}`);
  lines.push('', `เปิดดูรายงานเต็ม: ${APP_URL}`);

  try {
    await bot.sendMessage(tgChatId, lines.join('\n'), { disable_web_page_preview: true });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export async function notifyAll(report) {
  const [email, telegram] = await Promise.all([
    sendEmail(report).catch((e) => ({ ok: false, error: e.message })),
    sendTelegram(report).catch((e) => ({ ok: false, error: e.message })),
  ]);
  return { email, telegram };
}
