# 🎯 Palm Investment OS

Investment Operations Center ของปาล์ม — สั่งงานทีม AI 9 ตำแหน่ง (US Stocks + SET + Crypto) พร้อม pipeline animation แบบ real-time, Email + Telegram notification และ weekly auto-report

สร้างตาม PRD v2.0 · Stack: React (Vite) + Tailwind + Express + `@anthropic-ai/sdk` + Resend + node-telegram-bot-api + node-cron

## ทีม

| Stage | Agent | ตำแหน่ง | Model |
|---|---|---|---|
| 1 (parallel) | ปิยะ / มิน | Macro / Data Researcher | Haiku 4.5 |
| 2 (parallel) | เนม / โก้ | Fundamental / Technical Analyst | Haiku 4.5 |
| 3 | รัฐ → ลุงชาย | Position / Portfolio Risk | Sonnet 4.6 |
| 4 | แก้ว | Portfolio Strategist | Sonnet 4.6 |
| 5 | ป้อม | CIO — Final Synthesis | Sonnet 4.6 |
| 6 | นัท | Report Presenter | Haiku 4.5 |

## เริ่มใช้งาน

```bash
git clone https://github.com/nuttakarn-th/palm-investment.git
cd palm-investment
npm run setup            # ติดตั้ง dependencies ทั้ง server + client
cp .env.example .env     # แล้วกรอก ANTHROPIC_API_KEY (+ RESEND_API_KEY ถ้าใช้ email)
npm run dev              # เปิด http://localhost:3000
```

- Frontend dev server: `http://localhost:3000` (proxy `/api` → 3001)
- Backend API: `http://localhost:3001`
- Production: `npm run build && npm start` → เสิร์ฟทุกอย่างที่ `http://localhost:3001`

## Avatars

วางไฟล์ 9 รูปใน `client/public/avatars/` (`pom.jpg`, `piya.jpg`, `min.jpg`, `nem.jpg`, `ko.jpg`, `rat.jpg`, `lungchai.jpg`, `kaew.jpg`, `nat.jpg`) — ถ้ายังไม่มี UI จะ fallback เป็นตัวอักษรย่อ

## Notification

- **Email**: ตั้ง `RESEND_API_KEY` ใน `.env` แล้วกรอกอีเมลใน Settings (⚙️ มุมขวาบน) — มีปุ่มทดสอบส่ง
- **Telegram**: สร้าง bot กับ @BotFather, เอา Chat ID จาก @userinfobot, กรอกใน Settings (มี guide ใน Settings)

## Weekly Report

รันอัตโนมัติทุก**อาทิตย์ 08:00 น. เวลาไทย** (node-cron, `Asia/Bangkok`) — ต้องเปิด server ทิ้งไว้
ทดสอบได้จากปุ่ม "รัน Weekly Report เดี๋ยวนี้" ใน Settings หรือ `POST /api/weekly/run`

## หมายเหตุ

- API key อยู่ฝั่ง server เท่านั้น ไม่ถูกส่งไป browser
- Portfolio / Settings / Report history เก็บใน localStorage (MVP) และ sync สำเนาไปที่ `server/data/` เพื่อให้ cron ใช้ได้
- Agents ไม่มีข้อมูลตลาด real-time (Phase 4) — วิเคราะห์จากความรู้ของโมเดล + ข้อมูลพอร์ตที่กรอก และถูกสั่งให้ระบุความไม่แน่นอนชัดเจน
