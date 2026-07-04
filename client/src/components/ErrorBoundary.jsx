import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#080808',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Kanit', sans-serif",
          }}
        >
          <div
            style={{
              background: '#111',
              border: '1px solid #1a1a1a',
              borderRadius: '16px',
              padding: '40px',
              maxWidth: '480px',
              width: '90%',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠</div>
            <h2
              style={{
                color: '#fff',
                fontSize: '20px',
                fontWeight: 700,
                marginBottom: '12px',
              }}
            >
              เกิดข้อผิดพลาดที่ไม่คาดเดา
            </h2>
            <p
              style={{
                color: '#737373',
                fontSize: '13px',
                marginBottom: '24px',
                lineHeight: 1.6,
              }}
            >
              {this.state.error?.message || 'Unknown error'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#4F8EF7',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 28px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'Kanit', sans-serif",
              }}
            >
              รีเฟรชหน้า
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
