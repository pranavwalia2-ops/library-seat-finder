'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { loadStoredState, AppState } from '@/lib/store';
import { MapPin, UserCheck, QrCode, BarChart3, ShieldCheck, ArrowRight, Zap, Clock, Presentation } from 'lucide-react';

export default function HomePage() {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    setState(loadStoredState());
  }, []);

  const totalSeats = state?.seats.length || 120;
  const occupiedSeats = state?.seats.filter(s => s.status === 'checked_in').length || 0;
  const breakSeats = state?.seats.filter(s => s.status === 'on_break').length || 0;
  const bookedSeats = state?.seats.filter(s => s.status === 'booked').length || 0;
  const freeSeats = totalSeats - (occupiedSeats + breakSeats + bookedSeats);

  return (
    <div className="space-y-6">
      {/* Hero Banner - University Light Theme */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 sm:p-10 shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-purple-100 to-blue-100 rounded-full blur-3xl -mr-20 -mt-20 opacity-70 pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            LPU Code Fuzion 2026 • Problem M4
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Smart Library Seat Booking & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Anti-Hogging Engine</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Eliminate exam-week floor walking and &ldquo;ghost-bag&rdquo; desk reservation. Instant mobile QR check-in, 20-minute break timer with auto-release, and 100% concurrency safety.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/map"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-sm transition shadow-md shadow-blue-500/20"
            >
              <MapPin className="w-4 h-4" />
              <span>Open Live Floor Map</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pitch"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm transition shadow-sm"
            >
              <Presentation className="w-4 h-4 text-purple-600" />
              <span>Judges Pitch Slides</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Live Occupancy Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Available Free</div>
          <div className="text-3xl font-black text-emerald-600 mt-1">{freeSeats}</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">Ready for booking</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Occupied</div>
          <div className="text-3xl font-black text-rose-600 mt-1">{occupiedSeats}</div>
          <div className="text-xs text-rose-600 font-medium mt-1">Checked-in students</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">On Break</div>
          <div className="text-3xl font-black text-amber-600 mt-1">{breakSeats}</div>
          <div className="text-xs text-amber-600 font-medium mt-1">20-min countdown</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Awaiting Check-in</div>
          <div className="text-3xl font-black text-purple-600 mt-1">{bookedSeats}</div>
          <div className="text-xs text-purple-600 font-medium mt-1">15-min QR window</div>
        </div>
      </div>

      {/* Key Engineering Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span>Zero Double Booking</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Enforced at the database kernel level via PostgreSQL Partial Unique Indexes. 100 simultaneous requests on one desk: exactly one wins, others fail cleanly.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
            <Clock className="w-5 h-5 text-purple-600" />
            <span>Anti-Hogging & Auto-Release</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Unclaimed desk holds expire in 15 minutes. Break timers release seats after 20 minutes automatically on read and cron.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Admin Intelligence</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Live heatmap of peak traffic hours, top 10 hogged desks ranking, and one-click printable QR sticker sheets for all 3 floors.
          </p>
        </div>
      </div>
    </div>
  );
}
