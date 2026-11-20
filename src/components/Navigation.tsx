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
    { label: 'My Seat', href: '/my-seat' },
    { label: 'Scan QR', href: '/scan' },
    { label: 'Admin', href: '/admin' },
    { label: 'Demo', href: '/demo' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
              S
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-base">SeatSync</span>
            <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Library Portal
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="text-xs">
          {currentUser ? (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="font-mono font-semibold text-blue-700">{currentUser.reg_no}</span>
              <span className="text-slate-400">({currentUser.role})</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
