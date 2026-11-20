'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, UserCheck, QrCode, BarChart3, Sparkles, LogIn } from 'lucide-react';
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
    { label: 'Map', href: '/map', icon: MapPin },
    { label: 'My Seat', href: '/my-seat', icon: UserCheck },
    { label: 'Scan QR', href: '/scan', icon: QrCode },
    { label: 'Admin', href: '/admin', icon: BarChart3 },
    { label: 'Demo', href: '/demo', icon: Sparkles },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/map" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              S
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight">SeatSync</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                LPU M4
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <Link
                href="/login"
                className="flex items-center gap-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span className="font-mono font-medium">{currentUser.reg_no}</span>
                <span className="text-slate-400">({currentUser.role})</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3 py-1.5 rounded-lg transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-2 sm:hidden">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition ${
                  isActive ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-indigo-400' : ''}`} />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
