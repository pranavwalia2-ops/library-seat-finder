'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { loadStoredState, saveState, AppState } from '@/lib/store';
import { Seat, ActiveBooking } from '@/lib/types';
import { QrCode, Coffee, LogOut, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

export default function MySeatPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [mySeat, setMySeat] = useState<Seat | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [message, setMessage] = useState<string>('');

  const refreshState = () => {
    const current = loadStoredState();
    const currentTimestamp = Date.now();
    setNow(currentTimestamp);

    const active = current.seats.find(
      (s) => s.active_booking && s.active_booking.user_reg_no === current.currentUser.reg_no
    );

    // Auto-release check
    if (active && active.active_booking?.expires_at) {
      const exp = new Date(active.active_booking.expires_at).getTime();
      if (exp < currentTimestamp) {
        const idx = current.seats.findIndex((s) => s.id === active.id);
        current.seats[idx] = { ...current.seats[idx], status: 'free', active_booking: null };
        saveState(current);
        setMySeat(null);
        setState(current);
        setMessage('Your reservation expired and the seat was released for other students.');
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

  const handleStartBreak = () => {
    if (!mySeat) return;
    const current = loadStoredState();
    const idx = current.seats.findIndex((s) => s.id === mySeat.id);
    if (idx === -1) return;

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
    setMessage('Break started! You have 20 minutes before your desk is automatically released.');
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
    setMessage('Welcome back! Your desk status is restored to active study.');
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
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Active Desk Session</h2>
        <p className="text-xs text-slate-500">
          Student ID: <span className="font-mono text-blue-700 font-bold">{state.currentUser.reg_no}</span> ({state.currentUser.name})
        </p>
      </div>

      {message && (
        <div className="text-xs text-blue-900 bg-blue-50 border border-blue-200 rounded-2xl p-3.5 flex items-start gap-2 shadow-sm font-medium">
          <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}

      {mySeat ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-5 border-b border-slate-100">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Reserved Study Desk</div>
              <div className="text-4xl font-black text-slate-900 font-mono mt-0.5">{mySeat.label}</div>
              <div className="text-xs text-slate-500 mt-1 font-mono font-medium">Seat Code: {mySeat.code}</div>
            </div>
            <div className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
              mySeat.status === 'checked_in' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
              mySeat.status === 'on_break' ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' :
              'bg-purple-50 text-purple-700 border border-purple-200'
            }`}>
              {mySeat.status.replace('_', ' ')}
            </div>
          </div>

          {remaining && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-1">
              <div className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>
                  {mySeat.status === 'booked' ? 'Check-in Deadline (15m window)' : 'Break Countdown (20m limit)'}
                </span>
              </div>
              <div className="text-4xl font-black font-mono text-amber-600 tracking-wider">
                {remaining}
              </div>
              <div className="text-[11px] text-slate-400">
                Desk automatically releases when timer reaches 00:00.
              </div>
            </div>
          )}

          <div className="space-y-3 pt-2">
            {mySeat.status === 'booked' && (
              <Link
                href="/scan"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 text-sm"
              >
                <QrCode className="w-4 h-4" />
                <span>Scan QR at Seat to Check In</span>
              </Link>
            )}

            {mySeat.status === 'checked_in' && (
              <button
                onClick={handleStartBreak}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-sm text-sm"
              >
                <Coffee className="w-4 h-4" />
                <span>Take a 20-Minute Break</span>
              </button>
            )}

            {mySeat.status === 'on_break' && (
              <button
                onClick={handleReturnFromBreak}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-sm text-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>I&apos;m Back (Resume Study)</span>
              </button>
            )}

            <button
              onClick={handleLeaveSeat}
              className="w-full bg-slate-100 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-700 font-bold py-3 px-4 rounded-xl border border-slate-200 transition flex items-center justify-center gap-2 text-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Leave Desk & Release Seat</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">No Active Desk Booking</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              You do not have any seat reserved currently. Browse the live floor map to select a free desk.
            </p>
          </div>
          <Link
            href="/map"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-6 py-3 rounded-xl transition text-sm shadow-md shadow-blue-500/20"
          >
            <span>Browse Floor Map</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
