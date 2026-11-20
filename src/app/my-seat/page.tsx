'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { loadStoredState, saveState, AppState } from '@/lib/store';
import { Seat } from '@/lib/types';

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

    if (active && active.active_booking?.expires_at) {
      const exp = new Date(active.active_booking.expires_at).getTime();
      if (exp < currentTimestamp) {
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
    setMessage('Break started. 20-minute timer active.');
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
    setMessage('Returned from break. Desk status restored to active study.');
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
    setMessage('Seat released successfully. Thank you for freeing the desk.');
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
    <div className="max-w-md mx-auto space-y-5 pt-2">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Desk Session</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Student ID: <span className="font-mono text-blue-700 font-semibold">{state.currentUser.reg_no}</span> ({state.currentUser.name})
        </p>
      </div>

      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-lg p-3">
          {message}
        </div>
      )}

      {mySeat ? (
        <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase">Reserved Seat</div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono mt-0.5">{mySeat.label}</div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">Code: {mySeat.code}</div>
            </div>
            <div className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${
              mySeat.status === 'checked_in' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
              mySeat.status === 'on_break' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
              'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {mySeat.status.replace('_', ' ')}
            </div>
          </div>

          {remaining && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-4 text-center space-y-1">
              <div className="text-xs font-medium text-amber-800">
                {mySeat.status === 'booked' ? 'Check-in Deadline (15m window)' : 'Break Timer (20m limit)'}
              </div>
              <div className="text-3xl font-black font-mono text-amber-700 tracking-wider">
                {remaining}
              </div>
              <div className="text-[11px] text-amber-600">
                Desk will automatically release when timer reaches 00:00.
              </div>
            </div>
          )}

          <div className="space-y-2.5 pt-1">
            {mySeat.status === 'booked' && (
              <Link
                href="/scan"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded text-xs flex items-center justify-center transition"
              >
                Scan QR at Seat to Check In
              </Link>
            )}

            {mySeat.status === 'checked_in' && (
              <button
                onClick={handleStartBreak}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 px-4 rounded text-xs transition"
              >
                Take a 20-Minute Break
              </button>
            )}

            {mySeat.status === 'on_break' && (
              <button
                onClick={handleReturnFromBreak}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded text-xs transition"
              >
                I&apos;m Back (Resume Study)
              </button>
            )}

            <button
              onClick={handleLeaveSeat}
              className="w-full bg-slate-100 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 text-slate-700 font-medium py-2 px-4 rounded border border-slate-200 text-xs transition"
            >
              Leave Desk &amp; Release Seat
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center space-y-3 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base">No Active Seat Booking</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            You do not currently hold a desk reservation. Browse the floor map to select a free seat.
          </p>
          <div className="pt-2">
            <Link
              href="/map"
              className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-xs transition"
            >
              Browse Floor Map &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
