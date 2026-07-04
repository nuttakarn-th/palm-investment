import { Link } from 'react-router-dom';
import '@fontsource/kanit/700.css';

const NAV = [
  { to: '/', label: 'หน้าแรก' },
  { to: '/team', label: 'ทีม AI' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
];

export default function Footer() {
  return (
    <footer
      style={{
        background: '#080808',
        borderTop: '1px solid #161616',
        fontFamily: "'Kanit', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '18px 24px 16px',
        }}
      >
        {/* Top row: brand + nav */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '12px',
          }}
        >
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '16px', lineHeight: 1 }}>🎯</span>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>
              PALM INVESTMENT <span style={{ color: '#4F8EF7' }}>OS</span>
            </span>
            <span style={{ color: '#222', fontSize: '12px', margin: '0 2px' }}>·</span>
            <span style={{ color: '#3a3a3a', fontSize: '12px' }}>ทีม AI 9 คน วิเคราะห์พอร์ตของคุณ</span>
          </div>

          {/* Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                style={{ color: '#484848', fontSize: '12px', textDecoration: 'none' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#bbb')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#484848')}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom row: disclaimer + copyright */}
        <div
          style={{
            borderTop: '1px solid #111',
            paddingTop: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '6px',
          }}
        >
          <span style={{ color: '#333', fontSize: '11px', lineHeight: 1.5 }}>
            <span style={{ color: '#7a3a12', marginRight: '4px' }}>⚠</span>
            เนื้อหานี้ไม่ใช่คำแนะนำการลงทุน — การตัดสินใจลงทุนเป็นความรับผิดชอบของผู้ใช้เอง
          </span>
          <span style={{ color: '#2a2a2a', fontSize: '11px' }}>© 2026 Palm Investment OS</span>
        </div>
      </div>
    </footer>
  );
}
