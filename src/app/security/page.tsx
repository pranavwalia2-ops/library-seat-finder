'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadStoredState, markBelongingsCollected, ActiveBooking } from '@/lib/store';

function toIST(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function formatCountdown(expiresAt: string | null | undefined): string {
  if (!expiresAt) return '--:--';
  const diff = Math.max(0, new Date(expiresAt).getTime() - Date.now());
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

interface LeftSeat {
  seatLabel: string;
  regNo: string;
  leftAt: number;
  expiresAt: string;
}

interface UnclaimedBooking extends ActiveBooking {
  seatLabel?: string;
}

export default function SecurityPage() {
  const [leftSeats, setLeftSeats] = useState<LeftSeat[]>([]);
  const [unclaimed, setUnclaimed] = useState<UnclaimedBooking[]>([]);
  const [, forceRender] = useState(0);

  const refresh = useCallback(() => {
    try {
      const state = loadStoredState();
      // Table A: active seats where student left library
      const left: LeftSeat[] = state.seats
        .filter((s) => s.active_booking?.leftLibraryAt)
        .map((s) => ({
          seatLabel: s.label,
          regNo: s.active_booking!.user_reg_no ?? s.active_booking!.user_id,
          leftAt: s.active_booking!.leftLibraryAt!,
          expiresAt: s.active_booking!.expires_at ?? '',
        }));
      setLeftSeats(left);

      // Table B: released bookings with reason left_library and not yet collected
      const unc: UnclaimedBooking[] = (state.bookings || [])
        .filter((b) => b.releaseReason === 'left_library' && !b.belongingsCollectedAt)
        .map((b) => {
          const seat = state.seats.find((s) => s.id === b.seat_id);
          return { ...b, seatLabel: seat?.label ?? b.seat_id };
        });
      setUnclaimed(unc);
    } catch {}
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener('seatsync_change', refresh);
    const interval = setInterval(() => {
      refresh();
      setForce();
    }, 1000);
    function setForce() { forceRender((n) => n + 1); }
    return () => {
      window.removeEventListener('seatsync_change', refresh);
      clearInterval(interval);
    };
  }, [refresh]);

  const handleCollected = (bookingId: string) => {
    markBelongingsCollected(bookingId);
    refresh();
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1>Security</h1>
        <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
          A seat is released 20 minutes after the student leaves the library without releasing the seat or taking a break.
        </p>
      </div>

      {/* Table A: Left library, seat held */}
      <div className="panel" style={{ marginBottom: '24px' }}>
        <div className="panel-header">
          Left library — seat will be released soon
          <span style={{ marginLeft: '8px', fontSize: '12px', background: leftSeats.length > 0 ? '#fef3c7' : 'rgba(255,255,255,0.4)', color: leftSeats.length > 0 ? '#92400e' : '#475569', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
            {leftSeats.length}
          </span>
        </div>
        <div className="panel-body" style={{ padding: 0, overflowX: 'auto' }}>
          {leftSeats.length === 0 ? (
            <p style={{ padding: '20px', color: '#475569', fontSize: '14px' }}>No students have exited with an active seat right now.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: 'rgba(248, 250, 252, 0.8)' }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>Seat</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>Reg No</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>Left at (IST)</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>Releases in</th>
                </tr>
              </thead>
              <tbody>
                {leftSeats.map((row, i) => (
                  <tr key={row.regNo + row.seatLabel} style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(226, 232, 240, 0.7)' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: '#0f172a' }}>{row.seatLabel}</td>
                    <td style={{ padding: '10px 16px', color: '#334155' }}>{row.regNo}</td>
                    <td style={{ padding: '10px 16px', color: '#475569' }}>{toIST(row.leftAt)}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        fontSize: '15px',
                        color: formatCountdown(row.expiresAt).startsWith('00:') ? '#dc2626' : '#f59e0b',
                      }}>
                        {formatCountdown(row.expiresAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Table B: Collect belongings */}
      <div className="panel">
        <div className="panel-header">
          Collect belongings
          <span style={{ marginLeft: '8px', fontSize: '12px', background: unclaimed.length > 0 ? '#fee2e2' : 'rgba(255,255,255,0.4)', color: unclaimed.length > 0 ? '#991b1b' : '#475569', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
            {unclaimed.length}
          </span>
        </div>
        <div className="panel-body" style={{ padding: 0, overflowX: 'auto' }}>
          {unclaimed.length === 0 ? (
            <p style={{ padding: '20px', color: '#475569', fontSize: '14px' }}>No uncollected belongings at this time.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: 'rgba(248, 250, 252, 0.8)' }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>Seat</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>Reg No</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {unclaimed.map((b, i) => (
                  <tr key={b.id} style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(226, 232, 240, 0.7)' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: '#0f172a' }}>{(b as any).seatLabel}</td>
                    <td style={{ padding: '10px 16px', color: '#334155' }}>{b.user_reg_no ?? b.user_id}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <button
                        type="button"
                        className="primary"
                        onClick={() => handleCollected(b.id)}
                        style={{ padding: '5px 14px', fontSize: '13px' }}
                      >
                        Collected
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
