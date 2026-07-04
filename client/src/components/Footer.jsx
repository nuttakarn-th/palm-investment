import { Link } from 'react-router-dom';
import '@fontsource/kanit/700.css';

export default function Footer() {
  return (
    <footer
      style={{
        background: '#080808',
        borderTop: '1px solid #1a1a1a',
        fontFamily: "'Kanit', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '48px 32px 32px',
        }}
      >
        {/* Top row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '40px',
            justifyContent: 'space-between',
            marginBottom: '40px',
          }}
        >
          {/* Left: brand */}
          <div style={{ flex: '1 1 240px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              <span style={{ fontSize: '22px' }}>🎯</span>
              <span
                style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}
              >
                PALM INVESTMENT{' '}
                <span style={{ color: '#4F8EF7' }}>OS</span>
              </span>
            </div>
            <p style={{ color: '#555', fontSize: '13px', lineHeight: 1.6 }}>
              ทีม AI 9 คน วิเคราะห์พอร์ตของคุณ
            </p>
          </div>

          {/* Middle: nav */}
          <nav
            style={{
              flex: '1 1 200px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <span
              style={{
                color: '#444',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '4px',
              }}
            >
              Navigation
            </span>
            {[
              { to: '/', label: 'หน้าแรก' },
              { to: '/team', label: 'ทีม AI' },
              { to: '/pricing', label: 'Pricing' },
              { to: '/privacy', label: 'Privacy' },
              { to: '/terms', label: 'Terms' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                style={{
                  color: '#666',
                  fontSize: '14px',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#666')}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right: disclaimer */}
          <div style={{ flex: '1 1 220px' }}>
            <p
              style={{
                color: '#F97316',
                fontSize: '12px',
                lineHeight: 1.7,
                borderLeft: '2px solid #F97316',
                paddingLeft: '12px',
              }}
            >
              ⚠ Disclaimer: เนื้อหานี้ไม่ใช่คำแนะนำการลงทุน
              การตัดสินใจลงทุนเป็นความรับผิดชอบของผู้ใช้เอง
            </p>
          </div>
        </div>

        {/* Bottom row */}
        <div
          style={{
            borderTop: '1px solid #1a1a1a',
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <span style={{ color: '#444', fontSize: '12px' }}>
            © 2026 Palm Investment OS
          </span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link
              to="/privacy"
              style={{ color: '#444', fontSize: '12px', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#888')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#444')}
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              style={{ color: '#444', fontSize: '12px', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#888')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#444')}
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
