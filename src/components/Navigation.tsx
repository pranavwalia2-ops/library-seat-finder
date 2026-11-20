'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, UserCheck, QrCode, BarChart3, Sparkles, LogIn, Presentation } from 'lucide-react';
import { useEffect, useState } from 'react';
import { loadStoredState } from '@/lib/store';

export default function Navigation() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<{ reg_no: string; role: string; name: string } | null>(null);

  useEffect(() => {
    const state = loadStoredState();
    setCurrentUser(state.currentUser);
  }, [pathname]);

  const navItems = [
    { label: 'Pitch', href: '/pitch', icon: Presentation },
    { label: 'Floor Map', href: '/map', icon: MapPin },
    { label: 'My Desk', href: '/my-seat', icon: UserCheck },
    { label: 'Scan QR', href: '/scan', icon: QrCode },
    { label: 'Admin', href: '/admin', icon: BarChart3 },
    { label: 'Demo Test', href: '/demo', icon: Sparkles },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/map" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
              S
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">Seat<span className="text-purple-600">Sync</span></span>
              <span className="hidden sm:inline-block ml-2 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                LPU M4
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/pitch"
              className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm transition"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Judges Pitch</span>
            </Link>

            {currentUser ? (
              <Link
                href="/login"
                className="flex items-center gap-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition font-medium"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="font-mono font-semibold text-blue-700">{currentUser.reg_no}</span>
                <span className="text-slate-500">({currentUser.role})</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg transition shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-2 py-2 sm:hidden shadow-lg">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition ${
                  isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-blue-600' : ''}`} />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
