'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { loadStoredState, saveState, AppState } from '@/lib/store';
import { getRegistrationNumber, setRegistrationNumber } from '@/lib/user';

export default function Navigation() {
  const pathname = usePathname();
  const [regNo, setRegNo] = useState('12200001');
  const [hasActiveSeat, setHasActiveSeat] = useState(false);
  const [activeSeatLabel, setActiveSeatLabel] = useState<string | null>(null);

  const checkActiveBooking = () => {
    const current = getRegistrationNumber();
    setRegNo(current);
    try {
      const state = loadStoredState();
      const mySeat = state.seats.find(
        (s) => s.active_booking && (s.active_booking.user_reg_no === current || s.active_booking.user_id === `u-${current}`)
      );
      if (mySeat) {
        setHasActiveSeat(true);
        setActiveSeatLabel(mySeat.label);
      } else {
        setHasActiveSeat(false);
        setActiveSeatLabel(null);
      }
    } catch {}
  };

  useEffect(() => {
    checkActiveBooking();
    window.addEventListener('seatsync_change', checkActiveBooking);
    return () => window.removeEventListener('seatsync_change', checkActiveBooking);
  }, [pathname]);

  const handleSwitchUser = (newReg: string) => {
    setRegistrationNumber(newReg);
    try {
      const state = loadStoredState();
      state.currentUser = {
        id: `u-${newReg}`,
        reg_no: newReg,
        name: newReg === '12200000' ? 'Chief Librarian (Admin)' : `Student ${newReg}`,
        role: newReg === '12200000' ? 'admin' : 'student',
      };
      saveState(state);
    } catch {}
    setRegNo(newReg);
    checkActiveBooking();
  };

  const tabs = [
    {
      label: 'Home',
      href: '/',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
    },
    {
      label: 'Map',
      href: '/map',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
          <line x1="8" y1="2" x2="8" y2="18"></line>
          <line x1="16" y1="6" x2="16" y2="22"></line>
        </svg>
      ),
    },
    {
      label: 'My seat',
      href: '/my-seat',
      badge: hasActiveSeat ? activeSeatLabel : null,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"></path>
          <path d="M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2Z"></path>
          <path d="M5 18v2"></path>
          <path d="M19 18v2"></path>
        </svg>
      ),
    },
    {
      label: 'Scan QR',
      href: '/scan',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
    },
    {
      label: 'Admin',
      href: '/admin',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      ),
    },
    {
      label: 'Demo',
      href: '/demo',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      ),
    },
    {
      label: 'Gate',
      href: '/gate',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h18"></path>
          <path d="M3 6l9-3 9 3"></path>
          <path d="M3 18l9 3 9-3"></path>
        </svg>
      ),
    },
    {
      label: 'Security',
      href: '/security',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      ),
    },
    {
      label: 'Login',
      href: '/login',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
          <polyline points="10 17 15 12 10 7"></polyline>
          <line x1="15" y1="12" x2="3" y2="12"></line>
        </svg>
      ),
    },
  ];

  return (
    <div className="glass-header">
      {/* 1. Header Bar */}
      <header style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.6)', width: '100%' }}>
        <div
          className="header-content"
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          {/* Logo & Subtitle */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }} title="Go to Home / Landing Page">
            <div>
              <div style={{ fontWeight: 600, fontSize: '18px', color: '#0f172a', lineHeight: 1.2 }}>
                Library Seat Finder
              </div>
              <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                Code Fuzion 2026 | Problem M4
              </div>
            </div>
          </Link>

          {/* User Switcher Pill & Login Link */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(8px)',
                padding: '4px 12px',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                fontSize: '13px',
                color: '#0f172a',
              }}
            >
              <span style={{ color: '#475569', fontSize: '12px' }}>Student ID:</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{regNo}</span>
              <span style={{ color: '#cbd5e1' }}>|</span>
              <select
                value={regNo}
                onChange={(e) => handleSwitchUser(e.target.value)}
                style={{
                  background: 'transparent',
                  color: '#2563eb',
                  border: 'none',
                  height: '24px',
                  padding: '0 4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <option value="12200001">12200001 (Student)</option>
                <option value="12200002">12200002 (Student)</option>
                <option value="12200003">12200003 (Student)</option>
                <option value="12200000">12200000 (Admin)</option>
              </select>
            </div>

            <Link
              href="/login"
              className="btn secondary-glass"
              style={{
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: 'none',
                borderRadius: '16px',
              }}
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Tab Bar */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '0 20px',
            display: 'flex',
            gap: '8px',
          }}
        >
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`glass-nav-tab ${isActive ? 'active' : ''}`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    style={{
                      background: '#2563eb',
                      color: '#ffffff',
                      fontSize: '11px',
                      padding: '1px 7px',
                      borderRadius: '10px',
                      fontWeight: 600,
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
