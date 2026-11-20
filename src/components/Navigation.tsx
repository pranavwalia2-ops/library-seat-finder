'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadStoredState } from '@/lib/store';

export default function Navigation() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<{ reg_no: string; role: string } | null>(null);

  useEffect(() => {
    const state = loadStoredState();
    setCurrentUser(state.currentUser);
  }, [pathname]);

  const tabs = [
    { label: 'Map', href: '/map' },
    { label: 'My seat', href: '/my-seat' },
    { label: 'Scan QR', href: '/scan' },
    { label: 'Admin', href: '/admin' },
  ];

  return (
    <div>
      {/* 1. Header bar (full width, 1px bottom border #d1d5db) */}
      <header style={{ borderBottom: '1px solid #d1d5db', background: '#ffffff', width: '100%' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#000000', lineHeight: 1.2 }}>
              Library Seat Finder
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
              Code Fuzion 2026 | LPU
            </div>
          </div>

          <div style={{ fontSize: '14px', color: '#000000' }}>
            <span>Reg: {currentUser ? currentUser.reg_no : '12200001'}</span>
            <span style={{ margin: '0 6px', color: '#9ca3af' }}>|</span>
            <Link href="/login" style={{ color: '#1d4ed8', textDecoration: 'none' }}>
              Change
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Tab bar under header: Map | My seat | Scan QR | Admin */}
      <div style={{ borderBottom: '1px solid #d1d5db', background: '#ffffff', width: '100%' }}>
        <div className="tab-bar-scroll" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px', display: 'flex', gap: '24px' }}>
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || (pathname === '/' && tab.href === '/map');
            return (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  padding: '12px 4px',
                  display: 'inline-block',
                  fontSize: '14px',
                  fontWeight: isActive ? 'bold' : 'normal',
                  color: isActive ? '#1d4ed8' : '#000000',
                  textDecoration: 'none',
                  borderBottom: isActive ? '3px solid #1d4ed8' : '3px solid transparent',
                  marginBottom: '-1px',
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
