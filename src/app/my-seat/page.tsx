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
        setMessage('Your reservation has expired and the seat was released.');
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
    setMessage('Returned from break. Status updated to checked in.');
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
    setMessage('Seat released.');
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
    <div>
      <h1>My seat</h1>
      <p style={{ margin: '4px 0 16px 0' }}>
        Logged in as: {state.currentUser.reg_no} ({state.currentUser.name})
      </p>

      {message && (
        <div style={{ border: '1px solid #000000', padding: '8px', margin: '8px 0', background: '#f3f4f6' }}>
          {message}
        </div>
      )}

      {mySeat ? (
        <div style={{ border: '1px solid #000000', padding: '16px', maxWidth: '420px' }}>
          <table>
            <tbody>
              <tr>
                <td><strong>Seat:</strong></td>
                <td>{mySeat.label} (Code: {mySeat.code})</td>
              </tr>
              <tr>
                <td><strong>Status:</strong></td>
                <td>{mySeat.status}</td>
              </tr>
              {remaining && (
                <tr>
                  <td><strong>Time left:</strong></td>
                  <td><strong>{remaining}</strong></td>
                </tr>
              )}
            </tbody>
          </table>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            {mySeat.status === 'booked' && (
              <Link href="/scan" style={{ textDecoration: 'none' }}>
                <button className="primary" style={{ width: '100%' }}>
                  Scan QR to check in
                </button>
              </Link>
            )}

            {mySeat.status === 'checked_in' && (
              <button onClick={handleStartBreak} style={{ width: '100%' }}>
                Take a break (20 minutes)
              </button>
            )}

            {mySeat.status === 'on_break' && (
              <button onClick={handleReturnFromBreak} className="primary" style={{ width: '100%' }}>
                Return from break
              </button>
            )}

            <button onClick={handleLeaveSeat} style={{ width: '100%' }}>
              Leave seat
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p>You have no active seat booking.</p>
          <p>
            <Link href="/map">Go to Map to book a seat &rarr;</Link>
          </p>
        </div>
      )}
    </div>
  );
}
