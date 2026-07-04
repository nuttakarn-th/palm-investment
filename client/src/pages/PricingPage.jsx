import { useNavigate } from 'react-router-dom';
import '@fontsource/kanit/700.css';
import '@fontsource/kanit/800.css';

const CHECK = '✓';
const CROSS = '✗';

function PlanCard({ plan }) {
  const isRecommended = plan.recommended;
  return (
    <div
      style={{
        flex: '1 1 300px',
        maxWidth: '420px',
        background: '#111',
        border: `1.5px solid ${isRecommended ? '#4F8EF7' : '#1e1e1e'}`,
        borderRadius: '20px',
        padding: '32px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
      }}
    >
      {isRecommended && (
        <div
          style={{
            position: 'absolute',
            top: '-13px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#4F8EF7',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            padding: '3px 16px',
            borderRadius: '99px',
            whiteSpace: 'nowrap',
          }}
        >
          ⭐ แนะนำ
        </div>
      )}

      {/* Plan name */}
      <div style={{ marginBottom: '8px' }}>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: isRecommended ? '#4F8EF7' : '#888',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          {plan.name}
        </span>
      </div>

      {/* Price */}
      <div style={{ marginBottom: '24px' }}>
        <span
          style={{
            fontSize: '40px',
            fontWeight: 800,
            color: '#fff',
          }}
        >
          {plan.price}
        </span>
        <span style={{ color: '#555', fontSize: '14px', marginLeft: '6px' }}>
          {plan.period}
        </span>
        {plan.priceSub && (
          <div style={{ color: '#555', fontSize: '12px', marginTop: '4px' }}>
            {plan.priceSub}
          </div>
        )}
      </div>

      {/* Features */}
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: '0 0 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          flex: 1,
        }}
      >
        {plan.features.map((f, i) => (
          <li
            key={i}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '14px',
              color: f.included ? '#d4d4d4' : '#444',
            }}
          >
            <span
              style={{
                color: f.included ? '#34D399' : '#333',
                fontWeight: 700,
                flexShrink: 0,
                lineHeight: 1.4,
              }}
            >
              {f.included ? CHECK : CROSS}
            </span>
            {f.text}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div>
        <button
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            fontFamily: "'Kanit', sans-serif",
            background: isRecommended ? '#FCD34D' : '#4F8EF7',
            color: isRecommended ? '#000' : '#fff',
            letterSpacing: '0.01em',
          }}
        >
          {plan.ctaLabel}
        </button>
        {isRecommended && (
          <div
            style={{
              textAlign: 'center',
              marginTop: '10px',
              fontSize: '11px',
              color: '#555',
            }}
          >
            🚧 Coming Soon — ระบบชำระเงินอยู่ระหว่างพัฒนา
          </div>
        )}
      </div>
    </div>
  );
}

const FREE_PLAN = {
  name: 'Free',
  price: '฿0',
  period: '/ เดือน',
  ctaLabel: 'เริ่มใช้งานฟรี',
  recommended: false,
  features: [
    { included: true, text: '5 การวิเคราะห์ / เดือน' },
    { included: true, text: '1 ตลาด (US หรือ SET หรือ Crypto)' },
    { included: true, text: 'Email notification' },
    { included: true, text: '3 agents ในทีม' },
    { included: false, text: 'Telegram notification' },
    { included: false, text: 'Weekly auto-report' },
    { included: false, text: 'Priority support' },
  ],
};

const PRO_PLAN = {
  name: 'Pro',
  price: '฿990',
  period: '/ เดือน',
  priceSub: 'หรือประมาณ $29 USD',
  ctaLabel: 'เริ่มทดลองใช้ 14 วัน',
  recommended: true,
  features: [
    { included: true, text: 'ไม่จำกัดการวิเคราะห์' },
    { included: true, text: 'ทุกตลาด (US + SET + Crypto)' },
    { included: true, text: 'Telegram + Email notification' },
    { included: true, text: 'ทีม AI ครบ 9 คน' },
    { included: true, text: 'Weekly auto-report' },
    { included: true, text: 'Priority support' },
    { included: true, text: 'Export PDF report' },
  ],
};

const FAQS = [
  {
    q: 'ทดลองใช้ Pro ต้องใส่บัตรเครดิตไหม?',
    a: 'ไม่ต้อง ทดลองได้เลย 14 วัน โดยไม่ต้องผูกบัตรใดๆ',
  },
  {
    q: 'ยกเลิกได้ตลอดเวลาไหม?',
    a: 'ยกเลิกได้ทุกเมื่อ ไม่มีสัญญาผูกมัด ไม่มีค่าปรับ',
  },
  {
    q: 'ข้อมูลพอร์ตของผมปลอดภัยไหม?',
    a: 'ข้อมูลเก็บเฉพาะใน browser ของคุณ ไม่มีการส่งข้อมูลส่วนตัวขึ้น server',
  },
];

export default function PricingPage() {
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
          onClick={() => navigate('/')}
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

      {/* Header */}
      <div style={{ textAlign: 'center', padding: '64px 32px 48px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(79,142,247,0.1)',
            border: '1px solid rgba(79,142,247,0.3)',
            borderRadius: '99px',
            padding: '4px 16px',
            marginBottom: '20px',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#4F8EF7',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#4F8EF7',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            เลือกแพลน
          </span>
        </div>
        <h1
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: '12px',
          }}
        >
          เริ่มต้นฟรี พร้อมอัปเกรดเมื่อพร้อม
        </h1>
        <p style={{ color: '#666', fontSize: '15px' }}>
          ไม่ต้องใส่บัตรเครดิต · ยกเลิกได้ทุกเมื่อ
        </p>
      </div>

      {/* Plans */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          justifyContent: 'center',
          padding: '0 32px 64px',
        }}
      >
        <PlanCard plan={FREE_PLAN} />
        <PlanCard plan={PRO_PLAN} />
      </div>

      {/* FAQ */}
      <div
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          padding: '0 32px 80px',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            fontSize: '20px',
            fontWeight: 700,
            marginBottom: '32px',
            color: '#fff',
          }}
        >
          คำถามที่พบบ่อย
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {FAQS.map((faq, i) => (
            <div
              key={i}
              style={{
                background: '#111',
                border: '1px solid #1e1e1e',
                borderRadius: '12px',
                padding: '20px 24px',
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '14px',
                  marginBottom: '8px',
                  color: '#fff',
                }}
              >
                {faq.q}
              </div>
              <div style={{ color: '#777', fontSize: '13px', lineHeight: 1.6 }}>
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div
        style={{
          textAlign: 'center',
          padding: '0 32px 48px',
          color: '#444',
          fontSize: '12px',
        }}
      >
        * ราคานี้เป็นแผนในอนาคต · ระบบปัจจุบันใช้งานได้ฟรีทั้งหมด
      </div>
    </div>
  );
}
