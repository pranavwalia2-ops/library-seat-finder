'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { loadStoredState, saveState, AppState } from '@/lib/store';
import { Seat, ActiveBooking } from '@/lib/types';
import { QrCode, Coffee, LogOut, CheckCircle2, Clock, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function MySeatPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [mySeat, setMySeat] = useState<Seat | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [message, setMessage] = useState<string>('');

  const refreshState = () => {
    const current = loadStoredState();
    const currentTimestamp = Date.now();
    setNow(currentTimestamp);

    // Find the seat currently held by this student
    const active = current.seats.find(
      (s) => s.active_booking && s.active_booking.user_reg_no === current.currentUser.reg_no
    );

    // Auto-release check
    if (active && active.active_booking?.expires_at) {
      const exp = new Date(active.active_booking.expires_at).getTime();
      if (exp < currentTimestamp) {
        // Seat timed out
        const idx = current.seats.findIndex((s) => s.id === active.id);
        current.seats[idx] = { ...current.seats[idx], status: 'free', active_booking: null };
        saveState(current);
        setMySeat(null);
        setState(current);
        setMessage('Your reservation has expired and the seat was released for other students.');
        return;
      }
    }

    setMySeat(active || null);
    setState(current);
  };

  useEffect(() => {
    refreshState();
    const timer = setInterval(() => {
      setNow(Date.now());
      refreshState();
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!state) return null;

  // Actions
  const handleStartBreak = () => {
    if (!mySeat) return;
    const current = loadStoredState();
    const idx = current.seats.findIndex((s) => s.id === mySeat.id);
    if (idx === -1) return;

    // 20 minute break timer
    const expiresAt = new Date(Date.now() + 20 * 60 * 1000).toISOString();

    current.seats[idx] = {
      ...current.seats[idx],
      status: 'on_break',
      active_booking: {
        ...current.seats[idx].active_booking!,
        status: 'on_break',
        break_started_at: new Date().toISOString(),
        expires_at: expiresAt,
      },
    };

    saveState(current);
    refreshState();
    setMessage('Break started! You have 20 minutes before your seat is automatically released.');
  };

  const handleReturnFromBreak = () => {
    if (!mySeat) return;
    const current = loadStoredState();
    const idx = current.seats.findIndex((s) => s.id === mySeat.id);
    if (idx === -1) return;

    current.seats[idx] = {
      ...current.seats[idx],
      status: 'checked_in',
      active_booking: {
        ...current.seats[idx].active_booking!,
        status: 'checked_in',
        expires_at: null,
      },
    };

    saveState(current);
    refreshState();
    setMessage('Welcome back! Your seat status is restored to active study.');
  };

  const handleLeaveSeat = () => {
    if (!mySeat) return;
    const current = loadStoredState();
    const idx = current.seats.findIndex((s) => s.id === mySeat.id);
    if (idx === -1) return;

    current.seats[idx] = {
      ...current.seats[idx],
      status: 'free',
      active_booking: null,
    };

    saveState(current);
    refreshState();
    setMessage('Seat released successfully. Thank you for making seats available for your peers!');
  };

  // Remaining time calculation
  const getRemainingTime = (expiresAtStr?: string | null) => {
    if (!expiresAtStr) return null;
    const diff = Math.max(0, Math.floor((new Date(expiresAtStr).getTime() - now) / 1000));
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}m ${String(secs).padStart(2, '0')}s`;
  };

  const remaining = getRemainingTime(mySeat?.active_booking?.expires_at);

  return (
    <div className="max-w-md mx-auto space-y-6 pt-2">
      <div className="space-y-1 text-center">
        <h2 className="text-2xl font-bold text-white tracking-tight">Active Seat Session</h2>
        <p className="text-xs text-slate-400">
          Student Reg: <span className="font-mono text-indigo-400 font-semibold">{state.currentUser.reg_no}</span>
        </p>
      </div>

      {message && (
        <div className="text-xs text-indigo-200 bg-indigo-950/70 border border-indigo-700/60 rounded-xl p-3 flex items-start gap-2 shadow-lg">
          <Clock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}

      {mySeat ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          {/* Seat Identity Card */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="text-xs text-slate-400">Reserved Desk</div>
              <div className="text-3xl font-extrabold text-white font-mono">{mySeat.label}</div>
              <div className="text-xs text-slate-400 mt-0.5 font-mono">Code: {mySeat.code}</div>
            </div>
            <div className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
              mySeat.status === 'checked_in' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              mySeat.status === 'on_break' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse' :
              'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
            }`}>
              {mySeat.status.replace('_', ' ')}
            </div>
          </div>

          {/* Dynamic Countdown Timer */}
          {remaining && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-center space-y-1">
              <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {mySeat.status === 'booked' ? 'Check-in Deadline (15m window)' : 'Break Countdown (20m limit)'}
                </span>
              </div>
              <div className="text-3xl font-black font-mono text-amber-400 tracking-wider">
                {remaining}
              </div>
              <div className="text-[10px] text-slate-500">
                Seat automatically releases when the timer reaches 00:00.
              </div>
            </div>
          )}

          {/* Action Buttons based on state */}
          <div className="space-y-3 pt-2">
            {mySeat.status === 'booked' && (
              <Link
                href="/scan"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 text-sm"
              >
                <QrCode className="w-4 h-4" />
                <span>Scan QR at Seat to Check In</span>
              </Link>
            )}

            {mySeat.status === 'checked_in' && (
              <button
                onClick={handleStartBreak}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 text-sm"
              >
                <Coffee className="w-4 h-4" />
                <span>Take a 20-Minute Break</span>
              </button>
            )}

            {mySeat.status === 'on_break' && (
              <button
                onClick={handleReturnFromBreak}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 text-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>I'm Back (Resume Study)</span>
              </button>
            )}

            <button
              onClick={handleLeaveSeat}
              className="w-full bg-slate-800 hover:bg-rose-950/60 hover:border-rose-700/50 hover:text-rose-300 text-slate-300 font-semibold py-2.5 px-4 rounded-xl border border-slate-700 transition flex items-center justify-center gap-2 text-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Leave Desk & Release Seat</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">No Active Seat Booking</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              You do not have any seat reserved currently. Browse the live floor map to select a free seat.
            </p>
          </div>
          <Link
            href="/map"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm shadow-lg shadow-indigo-600/30"
          >
            <span>Browse Floor Map</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
