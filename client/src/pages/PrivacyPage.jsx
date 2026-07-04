import { useNavigate } from 'react-router-dom';
import '@fontsource/kanit/700.css';

const SECTIONS = [
  {
    title: '1. ข้อมูลที่เก็บรวบรวม',
    content: `เราเก็บเฉพาะข้อมูลที่คุณกรอกเอง ได้แก่:
• พอร์ตการลงทุนที่คุณระบุ (ชื่อหุ้น, มูลค่า)
• Settings ที่คุณตั้งค่าเอง (ธีม, การแจ้งเตือน)
• รายงานที่ระบบสร้างจากคำสั่งของคุณ

ข้อมูลเหล่านี้ถูกจัดเก็บใน browser localStorage ของคุณ และ Vercel KV (สำหรับ settings sync) ไม่มีการเก็บข้อมูลส่วนตัวอื่นๆ`,
  },
  {
    title: '2. การใช้งาน API',
    content: `คำสั่งที่คุณพิมพ์ในระบบจะถูกส่งไปยัง Anthropic API เพื่อประมวลผลการวิเคราะห์ โดย:
• ไม่มีการเก็บประวัติการสนทนาบน server ของเรา
• Anthropic อาจมีนโยบายการเก็บข้อมูลของตัวเอง (ดู anthropic.com/privacy)
• คำสั่งที่ส่งจะถูก process แล้วลบ ไม่มีการบันทึกระยะยาว`,
  },
  {
    title: '3. ไม่มีการแชร์ข้อมูล',
    content: `เราไม่ขาย ไม่แชร์ และไม่โอนข้อมูลของคุณให้กับบุคคลที่สาม ยกเว้น:
• Anthropic API (เฉพาะเนื้อหาคำสั่งที่คุณพิมพ์)
• Vercel (hosting infrastructure ที่ encrypt ข้อมูลทั้งหมด)

ไม่มีการใช้ข้อมูลเพื่อโฆษณา analytics tracking หรือวัตถุประสงค์เชิงพาณิชย์อื่นๆ`,
  },
  {
    title: '4. Cookies และ Local Storage',
    content: `ระบบใช้ localStorage ของ browser เท่านั้น โดย:
• ไม่มี tracking cookies
• ไม่มี third-party analytics (Google Analytics, Facebook Pixel ฯลฯ)
• ข้อมูลใน localStorage สามารถลบได้ตลอดเวลาจาก browser settings ของคุณ`,
  },
  {
    title: '5. ติดต่อเรา',
    content: `หากมีคำถามเกี่ยวกับ privacy policy กรุณาติดต่อ:
Email: privacy@palm-investment-os.app

เราจะตอบกลับภายใน 7 วันทำการ`,
  },
];

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#080808',
        fontFamily: "'Kanit', sans-serif",
        color: '#fff',
      }}
    >
      {/* Nav */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 32px',
          borderBottom: '1px solid #1a1a1a',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: '1px solid #242424',
            borderRadius: '8px',
            padding: '6px 16px',
            color: '#aaa',
            fontSize: '14px',
            cursor: 'pointer',
            fontFamily: "'Kanit', sans-serif",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#aaa')}
        >
          ← กลับ
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🎯</span>
          <span style={{ fontWeight: 700, fontSize: '14px' }}>
            PALM INVESTMENT <span style={{ color: '#4F8EF7' }}>OS</span>
          </span>
        </div>
        <div style={{ width: '80px' }} />
      </nav>

      {/* Content */}
      <div
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '56px 32px 80px',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <h1
            style={{
              fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
              fontWeight: 800,
              marginBottom: '8px',
            }}
          >
            นโยบายความเป็นส่วนตัว
          </h1>
          <p style={{ color: '#555', fontSize: '13px' }}>
            อัปเดตล่าสุด: 4 กรกฎาคม 2026
          </p>
        </div>

        {/* Intro */}
        <div
          style={{
            background: 'rgba(79,142,247,0.08)',
            border: '1px solid rgba(79,142,247,0.2)',
            borderRadius: '12px',
            padding: '20px 24px',
            marginBottom: '40px',
            fontSize: '14px',
            color: '#9ab8f5',
            lineHeight: 1.7,
          }}
        >
          Palm Investment OS ให้ความสำคัญกับความเป็นส่วนตัวของคุณ
          เอกสารนี้อธิบายว่าเราเก็บข้อมูลอะไร ใช้อย่างไร และปกป้องอย่างไร
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {SECTIONS.map((s, i) => (
            <div key={i}>
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: '12px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #1a1a1a',
                }}
              >
                {s.title}
              </h2>
              <p
                style={{
                  color: '#888',
                  fontSize: '14px',
                  lineHeight: 1.8,
                  whiteSpace: 'pre-line',
                }}
              >
                {s.content}
              </p>
            </div>
          ))}
        </div>

        {/* Footer disclaimer */}
        <div
          style={{
            marginTop: '56px',
            paddingTop: '24px',
            borderTop: '1px solid #1a1a1a',
            color: '#444',
            fontSize: '12px',
            lineHeight: 1.7,
          }}
        >
          * Palm Investment OS ไม่ใช่ที่ปรึกษาการลงทุนที่ได้รับใบอนุญาต
          เนื้อหาทั้งหมดในระบบเป็นเพียงการวิเคราะห์เบื้องต้น ไม่ถือเป็นคำแนะนำการลงทุน
        </div>
      </div>
    </div>
  );
}
