'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  loadStoredState,
  bookSeatAction,
  checkInAction,
  startBreakAction,
  returnFromBreakAction,
  releaseSeatAction,
  Seat,
  AppState,
  ActiveBooking,
} from '@/lib/store';
import { getRegistrationNumber } from '@/lib/user';

const FLOOR_NAMES: Record<number, string> = {
  1: 'Floor 1 — Quiet Study Zone',
  2: 'Floor 2 — Collaborative Commons',
  3: 'Floor 3 — Silent Research Wing',
  4: 'Floor 4 — Periodicals & Journals',
  5: 'Floor 5 — Digital Lab & Media',
};

export default function MySeatPage() {
  const [currentRegNo, setCurrentRegNo] = useState<string>('12200001');
  const [mySeat, setMySeat] = useState<Seat | null>(null);
  const [leftLibraryRelease, setLeftLibraryRelease] = useState<ActiveBooking | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [percentLeft, setPercentLeft] = useState<number>(100);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const refreshState = useCallback(() => {
    try {
      const reg = getRegistrationNumber();
      setCurrentRegNo(reg);
      const state: AppState = loadStoredState();
      const found = state.seats.find(
        (s) => s.active_booking && (s.active_booking.user_reg_no === reg || s.active_booking.user_id === `u-${reg}`)
      );
      setMySeat(found || null);
      // Check if the user's last released booking was due to leaving library
      const lastReleased = (state.bookings || [])
        .filter(
          (b) =>
            b.releaseReason === 'left_library' &&
            (b.user_reg_no === reg || b.user_id === `u-${reg}`) &&
            !b.belongingsCollectedAt
        )
        .sort((a, b) => (b.id > a.id ? 1 : -1))[0];
      setLeftLibraryRelease(lastReleased || null);
    } catch {}
  }, []);

  useEffect(() => {
    refreshState();
    window.addEventListener('seatsync_change', refreshState);
    return () => window.removeEventListener('seatsync_change', refreshState);
  }, [refreshState]);

  // Real-time countdown timer (every 1 second)
  useEffect(() => {
    if (!mySeat || !mySeat.active_booking) {
      setTimeLeft('');
      return;
    }

    const updateTimer = () => {
      const booking = mySeat.active_booking;
      if (!booking) return;

      if (booking.expires_at) {
        const expires = new Date(booking.expires_at).getTime();
        const diff = Math.max(0, expires - Date.now());
        const totalDuration = booking.status === 'on_break' ? 20 * 60 * 1000 : 15 * 60 * 1000;
        const pct = Math.min(100, Math.max(0, Math.round((diff / totalDuration) * 100)));
        setPercentLeft(pct);

        if (diff <= 0) {
          setTimeLeft('Expired (Auto-releasing)');
        } else {
          const mins = Math.floor(diff / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          setTimeLeft(`${mins}m ${secs.toString().padStart(2, '0')}s remaining`);
        }
      } else if (booking.checked_in_at) {
        const checkedIn = new Date(booking.checked_in_at).getTime();
        const diff = Math.max(0, Date.now() - checkedIn);
        const hours = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(
          hours > 0
            ? `${hours}h ${mins}m ${secs.toString().padStart(2, '0')}s active`
            : `${mins}m ${secs.toString().padStart(2, '0')}s active`
        );
        setPercentLeft(100);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [mySeat]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  const handleQuickBook = () => {
    const state = loadStoredState();
    const freeDesk = state.seats.find((s) => s.status === 'free') || state.seats[0];
    const res = bookSeatAction(freeDesk.id, currentRegNo);
    if (res.success) {
      showToast(`Desk ${freeDesk.label} booked. Hold expires in 15 minutes.`, 'success');
      refreshState();
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleCheckIn = () => {
    if (!mySeat) return;
    const res = checkInAction(mySeat.code, currentRegNo);
    if (res.success) {
      showToast(`Check-in confirmed for desk ${mySeat.label}.`, 'success');
      refreshState();
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleStartBreak = () => {
    if (!mySeat) return;
    const res = startBreakAction(mySeat.id);
    if (res.success) {
      showToast('Break timer started (20 minutes).', 'info');
      refreshState();
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleReturnFromBreak = () => {
    if (!mySeat) return;
    const res = returnFromBreakAction(mySeat.id);
    if (res.success) {
      showToast('Status restored to Checked In.', 'success');
      refreshState();
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleRelease = () => {
    if (!mySeat) return;
    const confirmed = window.confirm(`Release desk ${mySeat.label}? This will make it available for other students.`);
    if (!confirmed) return;
    const res = releaseSeatAction(mySeat.id);
    if (res.success) {
      showToast(`Desk ${mySeat.label} released.`, 'info');
      refreshState();
    }
  };

  const floorNumber = mySeat ? parseInt(mySeat.label.replace('F', '').split('-')[0], 10) || 1 : 1;

  // Gate exit return deadline string
  const gateExpiresAt = mySeat?.active_booking?.expires_at;
  const leftLibraryAt = mySeat?.active_booking?.leftLibraryAt;
  const returnDeadline = gateExpiresAt && leftLibraryAt
    ? new Date(gateExpiresAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false })
    : null;

  return (
    <div>
      {/* 1. Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1>My seat</h1>
        <p style={{ color: '#475569', margin: '2px 0 0 0', fontSize: '14px' }}>
          Current reservation status, break countdown timer, and desk QR verification.
        </p>
      </div>

      {/* 2. Toast Notification */}
      {toastMessage && (
        <div
          style={{
            marginBottom: '20px',
            padding: '12px 18px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background:
              toastMessage.type === 'success' ? '#f0fdf4' :
              toastMessage.type === 'error' ? '#fef2f2' : '#eff6ff',
            border:
              toastMessage.type === 'success' ? '1px solid #bbf7d0' :
              toastMessage.type === 'error' ? '1px solid #fecdd3' : '1px solid #bfdbfe',
            color:
              toastMessage.type === 'success' ? '#166534' :
              toastMessage.type === 'error' ? '#991b1b' : '#1e40af',
          }}
        >
          <span>{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: '2px 6px', fontWeight: 600 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. Content */}
      {!mySeat ? (
        <div className="panel" style={{ padding: '36px 20px', textAlign: 'center' }}>
          {leftLibraryRelease && (
            <div style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecdd3', color: '#991b1b', fontSize: '14px', fontWeight: 500, textAlign: 'left' }}>
              Your seat was released because you left the library without returning in time.
            </div>
          )}
          <h2 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '6px' }}>No active reservation</h2>
          <p style={{ color: '#475569', maxWidth: '420px', margin: '0 auto 20px auto', fontSize: '14px' }}>
            You do not currently hold a library desk. Select an available seat from the floor map.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Link
              href="/map"
              className="btn primary"
              style={{ padding: '8px 18px', fontSize: '13px', textDecoration: 'none' }}
            >
              Browse floor map
            </Link>
            <button
              type="button"
              onClick={handleQuickBook}
              className="secondary-glass"
              style={{ padding: '8px 18px', fontSize: '13px' }}
            >
              Book available desk (demo)
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Main Booking Panel */}
          <div className="panel">
            <div className="panel-header">
              <span style={{ fontWeight: 600 }}>Desk {mySeat.label}</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background:
                    mySeat.status === 'checked_in' ? '#dcfce7' :
                    mySeat.status === 'on_break' ? '#fef3c7' : '#fef9c3',
                  color:
                    mySeat.status === 'checked_in' ? '#166534' :
                    mySeat.status === 'on_break' ? '#92400e' : '#854d0e',
                  textTransform: 'uppercase',
                }}
              >
                {mySeat.status.replace('_', ' ')}
              </span>
            </div>

            <div className="panel-body">
              {/* Gate exit warning */}
              {leftLibraryAt && returnDeadline && (
                <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '10px', background: '#fef3c7', border: '1px solid #fde68a', color: '#92400e', fontSize: '14px', fontWeight: 500 }}>
                  ⚠ You left the library. Return before <strong>{returnDeadline}</strong> or your seat will be released.
                </div>
              )}
              {/* Timer Progress Container */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.65)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#475569' }}>
                    {mySeat.status === 'booked' ? 'QR Scan Hold' : mySeat.status === 'on_break' ? 'Break Limit' : 'Study Session'}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                    {timeLeft}
                  </span>
                </div>

                {(mySeat.status === 'booked' || mySeat.status === 'on_break') && (
                  <div style={{ height: '6px', background: 'rgba(0,0,0,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${percentLeft}%`,
                        height: '100%',
                        background: mySeat.status === 'on_break' ? '#f59e0b' : '#2563eb',
                        transition: 'width 1s linear',
                      }}
                    ></div>
                  </div>
                )}
              </div>

              {/* Booking Info Table */}
              <table style={{ marginBottom: '20px' }}>
                <tbody>
                  <tr>
                    <th style={{ width: '130px' }}>Desk ID</th>
                    <td><strong>{mySeat.label}</strong> (Code: <code>{mySeat.code}</code>)</td>
                  </tr>
                  <tr>
                    <th>Location</th>
                    <td>{FLOOR_NAMES[floorNumber]}</td>
                  </tr>
                  <tr>
                    <th>Student ID</th>
                    <td>{currentRegNo}</td>
                  </tr>
                  <tr>
                    <th>Amenities</th>
                    <td>2x 230V AC Power Socket, Campus 5G Wi-Fi</td>
                  </tr>
                </tbody>
              </table>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {mySeat.status === 'booked' && (
                  <button type="button" className="primary" onClick={handleCheckIn} style={{ flex: 1, minWidth: '140px' }}>
                    Check in via QR
                  </button>
                )}

                {mySeat.status === 'checked_in' && (
                  <button type="button" onClick={handleStartBreak} className="secondary-glass" style={{ flex: 1, minWidth: '140px' }}>
                    Take 20m break
                  </button>
                )}

                {mySeat.status === 'on_break' && (
                  <button type="button" className="primary" onClick={handleReturnFromBreak} style={{ flex: 1, minWidth: '140px' }}>
                    Return from break
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleRelease}
                  style={{ color: '#dc2626', borderColor: '#fca5a5', background: 'rgba(255,255,255,0.6)', flex: 1, minWidth: '120px' }}
                >
                  Release seat
                </button>
              </div>
            </div>
          </div>

          {/* QR Pass Panel */}
          <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="panel-header">
              <span>Digital QR Desk Pass</span>
              <span style={{ fontSize: '11px', color: '#475569' }}>Physical desk code</span>
            </div>

            <div className="panel-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <div
                style={{
                  padding: '16px',
                  background: '#ffffff',
                  border: '1px solid rgba(226, 232, 240, 0.9)',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  display: 'inline-block',
                }}
              >
                <svg width="140" height="140" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="150" height="150" fill="white" />
                  <rect x="15" y="15" width="36" height="36" rx="4" fill="#0f172a" />
                  <rect x="23" y="23" width="20" height="20" fill="white" />
                  <rect x="27" y="27" width="12" height="12" fill="#0f172a" />

                  <rect x="99" y="15" width="36" height="36" rx="4" fill="#0f172a" />
                  <rect x="107" y="23" width="20" height="20" fill="white" />
                  <rect x="111" y="27" width="12" height="12" fill="#0f172a" />

                  <rect x="15" y="99" width="36" height="36" rx="4" fill="#0f172a" />
                  <rect x="23" y="107" width="20" height="20" fill="white" />
                  <rect x="27" y="111" width="12" height="12" fill="#0f172a" />

                  <rect x="62" y="20" width="8" height="8" fill="#2563eb" />
                  <rect x="76" y="28" width="10" height="6" fill="#0f172a" />
                  <rect x="62" y="44" width="26" height="8" fill="#0f172a" />
                  <rect x="20" y="62" width="18" height="8" fill="#2563eb" />
                  <rect x="46" y="62" width="8" height="18" fill="#0f172a" />
                  <rect x="64" y="62" width="22" height="22" rx="2" fill="#16a34a" />
                  <rect x="96" y="62" width="12" height="8" fill="#0f172a" />
                  <rect x="116" y="62" width="14" height="14" fill="#2563eb" />
                  <rect x="20" y="80" width="14" height="8" fill="#0f172a" />
                  <rect x="42" y="88" width="14" height="18" fill="#2563eb" />
                  <rect x="64" y="94" width="16" height="8" fill="#0f172a" />
                  <rect x="90" y="90" width="22" height="14" fill="#0f172a" />
                  <rect x="120" y="86" width="10" height="22" fill="#2563eb" />
                  <rect x="64" y="116" width="18" height="14" fill="#0f172a" />
                  <rect x="92" y="116" width="20" height="14" fill="#2563eb" />
                </svg>
              </div>

              <div style={{ fontWeight: 600, fontSize: '15px', color: '#0f172a' }}>
                {mySeat.code}
              </div>
              <p style={{ fontSize: '13px', color: '#475569', margin: '4px 0 16px 0', maxWidth: '280px' }}>
                Scan the QR code on desk {mySeat.label} to complete check-in.
              </p>

              <Link
                href="/scan"
                className="btn secondary-glass"
                style={{ fontSize: '13px', textDecoration: 'none' }}
              >
                Open scanner
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
