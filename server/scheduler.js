// Weekly auto-report — every Sunday 08:00 Thai time (Asia/Bangkok).
import cron from 'node-cron';
import { runPipeline } from './pipeline.js';
import { notifyAll } from './notify.js';
import { store } from './store.js';

export async function runWeeklyReport() {
  const portfolio = await store.getPortfolio();
  const command = [
    'Weekly Report ประจำสัปดาห์:',
    '1) รีวิว P&L และสุขภาพพอร์ตจากข้อมูลที่กรอกไว้',
    '2) อัปเดตภาพ macro ที่กระทบ US / SET / Crypto',
    '3) ประเมินความเสี่ยงพอร์ตปัจจุบัน',
    '4) คำแนะนำสำหรับสัปดาห์หน้า + watch list',
  ].join('\n');

  const report = await runPipeline({ command, portfolio, pipeline: 'full', mode: 'weekly' });
  await store.addReport(report);
  const notified = await notifyAll(report);
  console.log('[scheduler] weekly report done', report.id, notified);
  return { report, notified };
}

export function startScheduler() {
  cron.schedule(
    '0 8 * * 0',
    async () => {
      const { weeklyEnabled } = await store.getSettings();
      if (!weeklyEnabled) {
        console.log('[scheduler] weekly report disabled — skipped');
        return;
      }
      try {
        await runWeeklyReport();
      } catch (e) {
        console.error('[scheduler] weekly report failed:', e.message);
      }
    },
    { timezone: 'Asia/Bangkok' }
  );
  console.log('[scheduler] weekly report scheduled — Sunday 08:00 Asia/Bangkok');
}
