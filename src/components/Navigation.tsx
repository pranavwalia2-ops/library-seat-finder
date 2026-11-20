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

  const links = [
    { label: 'Map', href: '/map' },
    { label: 'My seat', href: '/my-seat' },
    { label: 'Scan QR', href: '/scan' },
    { label: 'Admin', href: '/admin' },
    { label: 'Demo', href: '/demo' },
  ];

  return (
    <nav style={{ borderBottom: '1px solid #000000', paddingBottom: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link 
            href="/" 
            style={{ 
              fontWeight: 'bold', 
              color: '#000000', 
              textDecoration: pathname === '/' ? 'underline' : 'none' 
            }}
          >
            SeatSync
          </Link>
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: isActive ? '#1d4ed8' : '#000000',
                  textDecoration: isActive ? 'underline' : 'none',
                  fontWeight: isActive ? 'bold' : 'normal',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div style={{ fontSize: '14px' }}>
          {currentUser ? (
            <span>
              User: <Link href="/login" style={{ color: '#1d4ed8' }}>{currentUser.reg_no}</Link> ({currentUser.role})
            </span>
          ) : (
            <Link href="/login" style={{ color: '#1d4ed8' }}>Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
