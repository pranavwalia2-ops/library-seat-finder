'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* 1. Hero Section */}
      <div
        className="panel"
        style={{
          padding: '40px 32px',
          textAlign: 'center',
          marginBottom: '28px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* University Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.7)',
            padding: '6px 16px',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.85)',
            fontSize: '13px',
            fontWeight: 600,
            color: '#2563eb',
            marginBottom: '18px',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#22c55e',
              display: 'inline-block',
            }}
          />
          Lovely Professional University • Code Fuzion 2026 (Problem M4)
        </div>

        {/* Hero Title */}
        <h1
          style={{
            fontSize: '34px',
            lineHeight: 1.25,
            fontWeight: 700,
            color: '#0f172a',
            maxWidth: '780px',
            margin: '0 auto 14px',
            letterSpacing: '-0.025em',
          }}
        >
          Smart Library Seat Finder & Anti-Hogging Automation
        </h1>

        {/* Hero Subtitle */}
        <p
          style={{
            fontSize: '16px',
            lineHeight: 1.6,
            color: '#475569',
            maxWidth: '720px',
            margin: '0 auto 28px',
          }}
        >
          Find and reserve available desks across 5 library floors in real time. Confirm presence via instant QR scan, enjoy 20-minute protected study breaks, and eliminate ghost desk hogging with autonomous auto-release.
        </p>

        {/* Primary Call-to-Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <Link
            href="/map"
            className="btn primary"
            style={{
              padding: '12px 28px',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'none',
              borderRadius: '12px',
            }}
          >
            Launch Floor Dashboard →
          </Link>

          <Link
            href="/login"
            className="btn secondary-glass"
            style={{
              padding: '12px 24px',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'none',
              borderRadius: '12px',
            }}
          >
            Student Login
          </Link>

          <Link
            href="/scan"
            className="btn"
            style={{
              padding: '12px 20px',
              fontSize: '15px',
              fontWeight: 500,
              textDecoration: 'none',
              borderRadius: '12px',
            }}
          >
            Scan Desk QR
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Strip */}
      <div className="summary-strip">
        <div className="summary-box">
          <div className="summary-label">Library Capacity</div>
          <div className="summary-number">500</div>
          <div className="summary-caption">Desks across 5 zones</div>
        </div>

        <div className="summary-box">
          <div className="summary-label">Check-in Hold</div>
          <div className="summary-number" style={{ color: '#2563eb' }}>15m</div>
          <div className="summary-caption">QR verification window</div>
        </div>

        <div className="summary-box">
          <div className="summary-label">Break Protection</div>
          <div className="summary-number" style={{ color: '#d97706' }}>20m</div>
          <div className="summary-caption">Live monitored timeout</div>
        </div>

        <div className="summary-box">
          <div className="summary-label">Hardware Cost</div>
          <div className="summary-number" style={{ color: '#16a34a' }}>$0</div>
          <div className="summary-caption">Zero IoT sensors needed</div>
        </div>
      </div>

      {/* 3. Core Capabilities Grid */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#0f172a' }}>
          System Capabilities
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Card 1 */}
          <div className="panel" style={{ margin: 0, padding: '20px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(37, 99, 235, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
                marginBottom: '14px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                <line x1="8" y1="2" x2="8" y2="18"></line>
                <line x1="16" y1="6" x2="16" y2="22"></line>
              </svg>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 6px 0', color: '#0f172a' }}>
              Interactive 5-Floor Map
            </h3>
            <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#475569', margin: 0 }}>
              Live 500-seat directory showing free, booked, checked-in, and on-break statuses. Filter by floor or search by desk code in seconds.
            </p>
            <div style={{ marginTop: '12px' }}>
              <Link href="/map" style={{ fontSize: '13px', fontWeight: 600 }}>
                Explore Floor Map →
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="panel" style={{ margin: 0, padding: '20px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(34, 197, 94, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16a34a',
                marginBottom: '14px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 6px 0', color: '#0f172a' }}>
              Autonomous QR Verification
            </h3>
            <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#475569', margin: 0 }}>
              Device camera scanner with audio tone feedback and manual seat code fallback. Unconfirmed bookings auto-release after 15 minutes.
            </p>
            <div style={{ marginTop: '12px' }}>
              <Link href="/scan" style={{ fontSize: '13px', fontWeight: 600 }}>
                Open QR Scanner →
              </Link>
            </div>
          </div>

          {/* Card 3 */}
          <div className="panel" style={{ margin: 0, padding: '20px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d97706',
                marginBottom: '14px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 6px 0', color: '#0f172a' }}>
              20-Min Anti-Hogging Breaks
            </h3>
            <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#475569', margin: 0 }}>
              Students can step out for water or lunch without bag-blocking. If the 20-minute countdown expires, the seat automatically returns to free.
            </p>
            <div style={{ marginTop: '12px' }}>
              <Link href="/my-seat" style={{ fontSize: '13px', fontWeight: 600 }}>
                View Active Session →
              </Link>
            </div>
          </div>

          {/* Card 4 */}
          <div className="panel" style={{ margin: 0, padding: '20px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(124, 58, 237, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7c3aed',
                marginBottom: '14px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 6px 0', color: '#0f172a' }}>
              Turnstile & Security Sync
            </h3>
            <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#475569', margin: 0 }}>
              Integrated gate exit tracking releases desks if a student leaves the facility without taking a break. Security desk coordinates belongings collection.
            </p>
            <div style={{ marginTop: '12px' }}>
              <Link href="/gate" style={{ fontSize: '13px', fontWeight: 600 }}>
                Test Gate Turnstile →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Launchpad Banner */}
      <div
        className="panel"
        style={{
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: '16px', color: '#0f172a' }}>
            Ready to reserve your study spot?
          </div>
          <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
            Log in with your registration number or browse the live floor map right now.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link href="/login" className="btn secondary-glass" style={{ textDecoration: 'none' }}>
            Log In
          </Link>
          <Link href="/map" className="btn primary" style={{ textDecoration: 'none' }}>
            Open Floor Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
