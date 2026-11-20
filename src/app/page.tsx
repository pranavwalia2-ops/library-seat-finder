'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { loadStoredState, AppState } from '@/lib/store';
import { MapPin, UserCheck, QrCode, BarChart3, ShieldCheck, ArrowRight, Zap, Clock } from 'lucide-react';

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
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-800/40 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            Code Fuzion 2026 • Problem M4
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Smart Library Seat Reservation & Anti-Hogging Engine
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Eliminate library walkaways and "ghost bag" seat reservation during exam season. Instant QR check-in, 20-minute break timer with auto-release, and 100% concurrency-safe bookings.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/map"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/30"
            >
              <MapPin className="w-4 h-4" />
              <span>Open Floor Map</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/scan"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan Seat QR</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Live Occupancy Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-400">Available Free</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{freeSeats}</div>
          <div className="text-[11px] text-emerald-500/80 mt-0.5">Ready for booking</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-400">Occupied</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">{occupiedSeats}</div>
          <div className="text-[11px] text-rose-500/80 mt-0.5">Checked-in students</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-400">On Break</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{breakSeats}</div>
          <div className="text-[11px] text-amber-500/80 mt-0.5">20-min countdown</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-400">Awaiting Check-in</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1">{bookedSeats}</div>
          <div className="text-[11px] text-indigo-400/80 mt-0.5">15-min QR window</div>
        </div>
      </div>

      {/* Key Judging Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero Double Booking</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Guaranteed via Postgres partial unique indexes. 100 concurrent clicks on one seat: exactly one wins, others fail cleanly.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <Clock className="w-4 h-4" />
            <span>Anti-Hogging & Auto-Release</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Unclaimed bookings expire in 15 minutes. Break timers release seats after 20 minutes automatically on read and cron.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <BarChart3 className="w-4 h-4" />
            <span>Admin Intelligence</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Live heatmap of peak traffic hours, top 10 hogged seats ranking, and one-click printable QR codes for all 3 floors.
          </p>
        </div>
      </div>
    </div>
  );
}
