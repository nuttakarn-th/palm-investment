import { useNavigate } from 'react-router-dom';
import '@fontsource/kanit/700.css';

const SECTIONS = [
  {
    title: '1. การยอมรับข้อกำหนด',
    content: `การใช้งาน Palm Investment OS ถือว่าคุณยอมรับข้อกำหนดการใช้งานเหล่านี้ทั้งหมด หากคุณไม่เห็นด้วยกับข้อกำหนดใดๆ กรุณาหยุดใช้งานระบบ

ข้อกำหนดเหล่านี้อาจมีการเปลี่ยนแปลงตามเวลา การใช้งานต่อเนื่องหลังจากการเปลี่ยนแปลงถือว่าคุณยอมรับข้อกำหนดใหม่`,
  },
  {
    title: '2. ขอบเขตการใช้งาน',
    content: `Palm Investment OS อนุญาตให้ใช้เพื่อวัตถุประสงค์ส่วนตัวเท่านั้น คุณตกลงที่จะ:
• ใช้ระบบเพื่อการศึกษาและวิเคราะห์ส่วนตัว ไม่ใช่เพื่อการค้า
• ไม่นำผลการวิเคราะห์ไปเผยแพร่โดยอ้างว่าเป็นคำแนะนำการลงทุนอย่างเป็นทางการ
• ไม่พยายาม reverse engineer หรือ scrape ระบบ
• ใช้งานอย่างเหมาะสมและไม่ทำให้ระบบเกิด load เกินปกติ`,
  },
  {
    title: '3. ข้อจำกัดความรับผิดชอบ',
    content: `IMPORTANT: Palm Investment OS ไม่ใช่ที่ปรึกษาการลงทุนที่ได้รับใบอนุญาต

ข้อมูลและการวิเคราะห์ทั้งหมดในระบบ:
• เป็นเพียงการวิเคราะห์เบื้องต้นจาก AI เท่านั้น
• ไม่ถือเป็นคำแนะนำการลงทุนตามกฎหมาย
• อาจมีความไม่ถูกต้องหรือล้าสมัย
• ไม่ได้คำนึงถึงสถานการณ์ทางการเงินส่วนตัวของคุณโดยเฉพาะ

การตัดสินใจลงทุนเป็นความรับผิดชอบของผู้ใช้เองทั้งหมด ผู้พัฒนาระบบไม่รับผิดชอบต่อผลกำไรหรือขาดทุนใดๆ ที่เกิดจากการใช้งานระบบนี้`,
  },
  {
    title: '4. ทรัพย์สินทางปัญญา',
    content: `ระบบ Palm Investment OS รวมถึงโค้ด การออกแบบ และเนื้อหาทั้งหมดเป็นทรัพย์สินของผู้พัฒนา

คุณได้รับสิทธิ์ใช้งานส่วนตัวเท่านั้น ไม่มีสิทธิ์:
• คัดลอกหรือทำซ้ำระบบเพื่อวัตถุประสงค์เชิงพาณิชย์
• นำ brand หรือ logo ไปใช้โดยไม่ได้รับอนุญาต
• สร้าง derivative works เพื่อการค้า`,
  },
  {
    title: '5. การยกเลิก',
    content: `เราขอสงวนสิทธิ์ในการระงับหรือยกเลิกการเข้าถึงระบบสำหรับผู้ใช้ที่:
• ละเมิดข้อกำหนดการใช้งาน
• ใช้งานในทางที่ผิดกฎหมาย
• ทำให้ระบบหรือผู้ใช้อื่นได้รับความเสียหาย

สำหรับแผน Pro: การยกเลิก subscription จะมีผลในรอบบิลถัดไป คุณสามารถใช้งานต่อได้จนสิ้นสุดรอบที่ชำระแล้ว`,
  },
];

export default function TermsPage() {
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
            ข้อกำหนดการใช้งาน
          </h1>
          <p style={{ color: '#555', fontSize: '13px' }}>
            อัปเดตล่าสุด: 4 กรกฎาคม 2026
          </p>
        </div>

        {/* Disclaimer banner */}
        <div
          style={{
            background: 'rgba(249,115,22,0.08)',
            border: '1px solid rgba(249,115,22,0.3)',
            borderRadius: '12px',
            padding: '20px 24px',
            marginBottom: '40px',
            fontSize: '14px',
            color: '#fb923c',
            lineHeight: 1.7,
          }}
        >
          ⚠ Palm Investment OS ไม่ใช่ที่ปรึกษาการลงทุนที่ได้รับใบอนุญาต
          ข้อมูลทั้งหมดเป็นเพียงการวิเคราะห์เบื้องต้น ไม่ถือเป็นคำแนะนำการลงทุน
          การตัดสินใจลงทุนเป็นความรับผิดชอบของผู้ใช้เอง
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

        {/* Footer */}
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
          หากมีคำถามเกี่ยวกับข้อกำหนดการใช้งาน กรุณาติดต่อ legal@palm-investment-os.app
        </div>
      </div>
    </div>
  );
}
