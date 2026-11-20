'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { loadStoredState, bookSeatAction, releaseSeatAction, Seat, AppState } from '@/lib/store';
import { getRegistrationNumber } from '@/lib/user';

const FLOOR_NAMES: Record<number, string> = {
  1: 'Floor 1 — Quiet Study Zone',
  2: 'Floor 2 — Collaborative Commons',
  3: 'Floor 3 — Silent Research Wing',
  4: 'Floor 4 — Periodicals & Journals',
  5: 'Floor 5 — Digital Lab & Media',
};

export default function MapPage() {
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'free' | 'occupied' | 'on_break'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [currentRegNo, setCurrentRegNo] = useState<string>('12200001');

  // Load seats from reactive local store
  const refreshSeats = useCallback(() => {
    try {
      const state: AppState = loadStoredState();
      setSeats(state.seats);
      const reg = getRegistrationNumber();
      setCurrentRegNo(reg);
    } catch {}
  }, []);

  const selectedSeat = useMemo(() => {
    return selectedSeatId ? seats.find((s) => s.id === selectedSeatId) || null : null;
  }, [seats, selectedSeatId]);

  useEffect(() => {
    refreshSeats();
    window.addEventListener('seatsync_change', refreshSeats);
    const interval = setInterval(refreshSeats, 3000);
    return () => {
      window.removeEventListener('seatsync_change', refreshSeats);
      clearInterval(interval);
    };
  }, [refreshSeats]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  const handleBookSeat = (seat: Seat) => {
    const res = bookSeatAction(seat.id, currentRegNo);
    if (!res.success) {
      showToast(res.message, 'error');
    } else {
      showToast(res.message, 'success');
      refreshSeats();
    }
  };

  const handleReleaseSeat = (seat: Seat) => {
    const res = releaseSeatAction(seat.id);
    if (res.success) {
      showToast(`Desk ${seat.label} has been released.`, 'info');
      refreshSeats();
    }
  };

  const myActiveSeat = useMemo(() => {
    return seats.find(
      (s) => s.active_booking && (s.active_booking.user_reg_no === currentRegNo || s.active_booking.user_id === `u-${currentRegNo}`)
    );
  }, [seats, currentRegNo]);

  // Library-wide summary totals
  const totalSeats = seats.length || 500;
  const freeSeats = seats.filter((s) => s.status === 'free').length;
  const occupiedSeats = seats.filter((s) => s.status === 'checked_in').length;
  const bookedSeats = seats.filter((s) => s.status === 'booked').length;
  const breakSeats = seats.filter((s) => s.status === 'on_break').length;

  // Selected floor seats
  const floorSeats = useMemo(() => {
    const prefix = `f${selectedFloor}`;
    return seats.filter((s) => s.floor_id === prefix || s.label.startsWith(`F${selectedFloor}-`));
  }, [seats, selectedFloor]);

  // Filtered floor seats
  const visibleFloorSeats = useMemo(() => {
    return floorSeats.filter((seat) => {
      if (filterStatus === 'free' && seat.status !== 'free') return false;
      if (filterStatus === 'occupied' && seat.status !== 'checked_in' && seat.status !== 'booked') return false;
      if (filterStatus === 'on_break' && seat.status !== 'on_break') return false;

      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        return seat.label.toLowerCase().includes(query) || seat.code.toLowerCase().includes(query);
      }
      return true;
    });
  }, [floorSeats, filterStatus, searchQuery]);

  // Floor stats
  const floorFree = floorSeats.filter((s) => s.status === 'free').length;
  const floorOccupied = floorSeats.filter((s) => s.status === 'checked_in' || s.status === 'booked').length;
  const floorBreak = floorSeats.filter((s) => s.status === 'on_break').length;
  const floorOccupancyPercent = Math.round(((floorOccupied + floorBreak) / (floorSeats.length || 100)) * 100);

  return (
    <div>
      {/* 1. Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div>
          <h1>Interactive Floor Map</h1>
          <p style={{ color: '#475569', margin: '2px 0 0 0', fontSize: '14px' }}>
            Real-time seat availability across 5 library floors (500 desks). Click any desk to reserve.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', background: 'rgba(255,255,255,0.55)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.7)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }}></span>
          <span>Autonomous sync active</span>
        </div>
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

      {/* 3. Active Reservation Banner */}
      {myActiveSeat && (
        <div
          className="panel"
          style={{
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            borderLeft: '4px solid #2563eb',
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: '15px', color: '#0f172a' }}>
              Your Reservation: Seat {myActiveSeat.label} ({FLOOR_NAMES[parseInt(myActiveSeat.label.replace('F', '').split('-')[0], 10) || 1]})
            </div>
            <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
              Status: <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{myActiveSeat.status.replace('_', ' ')}</span>
              {myActiveSeat.status === 'booked' && ' • 15m QR scan hold active'}
              {myActiveSeat.status === 'on_break' && ' • 20m break timer active'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Link
              href="/my-seat"
              className="btn primary"
              style={{ padding: '7px 14px', fontSize: '13px', textDecoration: 'none' }}
            >
              Open My seat
            </Link>
            <button
              type="button"
              onClick={() => handleReleaseSeat(myActiveSeat)}
              className="secondary-glass"
              style={{ padding: '7px 12px', fontSize: '13px' }}
            >
              Release
            </button>
          </div>
        </div>
      )}

      {/* 4. Four Equal Glass Summary Cards */}
      <div className="summary-strip">
        <div className="summary-box">
          <div className="summary-label">Total capacity</div>
          <div className="summary-number" style={{ color: '#0f172a' }}>{totalSeats}</div>
          <div className="summary-caption">5 floors, 100 desks each</div>
        </div>

        <div className="summary-box">
          <div className="summary-label">Free seats</div>
          <div className="summary-number" style={{ color: '#16a34a' }}>{freeSeats}</div>
          <div className="summary-caption">Available for reservation</div>
        </div>

        <div className="summary-box">
          <div className="summary-label">Occupied</div>
          <div className="summary-number" style={{ color: '#dc2626' }}>{occupiedSeats + bookedSeats}</div>
          <div className="summary-caption">Students checked in</div>
        </div>

        <div className="summary-box">
          <div className="summary-label">On break</div>
          <div className="summary-number" style={{ color: '#f59e0b' }}>{breakSeats}</div>
          <div className="summary-caption">20-minute limit active</div>
        </div>
      </div>

      {/* 5. Main Map Panel */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <span>{FLOOR_NAMES[selectedFloor]}</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginLeft: '10px' }}>
              ({floorOccupancyPercent}% occupancy)
            </span>
          </div>

          <div style={{ fontSize: '13px', color: '#475569' }}>
            Showing <strong>{visibleFloorSeats.length}</strong> of 100 desks
          </div>
        </div>

        <div className="panel-body">
          {/* Floor selector pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {[1, 2, 3, 4, 5].map((fl) => {
              const prefix = `f${fl}`;
              const flSeats = seats.filter((s) => s.floor_id === prefix || s.label.startsWith(`F${fl}-`));
              const flOccCount = flSeats.filter((s) => s.status === 'checked_in' || s.status === 'booked' || s.status === 'on_break').length;
              const flOcc = Math.round((flOccCount / (flSeats.length || 100)) * 100);
              const isSelected = selectedFloor === fl;

              return (
                <button
                  key={fl}
                  type="button"
                  onClick={() => {
                    setSelectedFloor(fl);
                    setSelectedSeatId(null);
                  }}
                  className={`floor-pill ${isSelected ? 'active' : ''}`}
                >
                  <span>Floor {fl}</span>
                  <span style={{ opacity: isSelected ? 0.9 : 0.6, fontSize: '11px' }}>{flOcc}%</span>
                </button>
              );
            })}
          </div>

          {/* Filter chips and search bar in one row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`filter-chip ${filterStatus === 'all' ? 'active' : ''}`}
              >
                All (100)
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('free')}
                className={`filter-chip ${filterStatus === 'free' ? 'active' : ''}`}
              >
                Free ({floorFree})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('occupied')}
                className={`filter-chip ${filterStatus === 'occupied' ? 'active' : ''}`}
              >
                Occupied ({floorOccupied})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('on_break')}
                className={`filter-chip ${filterStatus === 'on_break' ? 'active' : ''}`}
              >
                On break ({floorBreak})
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                placeholder="Search seat (e.g. 025)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '190px' }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ height: '36px', padding: '0 10px', fontSize: '12px' }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Seat Grid: Left-aligned, full width, 10 columns desktop, 6 columns mobile */}
          <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
            <div className="seat-grid-container">
              {visibleFloorSeats.map((seat) => {
                const isMine = seat.active_booking && (seat.active_booking.user_reg_no === currentRegNo || seat.active_booking.user_id === `u-${currentRegNo}`);
                const isSelected = selectedSeat?.id === seat.id;

                // Seat colours matching exact palette:
                // free #16a34a, occupied #dc2626, on break #f59e0b, booked #eab308
                let bg = '#16a34a';
                if (seat.status === 'booked') {
                  bg = '#eab308';
                } else if (seat.status === 'checked_in') {
                  bg = '#dc2626';
                } else if (seat.status === 'on_break') {
                  bg = '#f59e0b';
                }

                if (isMine) {
                  bg = '#2563eb';
                }

                // Show only the seat number inside, no dots or icons
                const seatNumber = seat.label.replace(`F${selectedFloor}-`, '');

                return (
                  <button
                    key={seat.id}
                    type="button"
                    onClick={() => setSelectedSeatId(seat.id)}
                    className="seat-cell"
                    style={{
                      background: bg,
                      outline: isSelected ? '2px solid #0f172a' : isMine ? '2px solid #2563eb' : 'none',
                      outlineOffset: '2px',
                    }}
                    title={`${seat.label} (${seat.status})${isMine ? ' - Your seat' : ''}`}
                  >
                    {seatNumber}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend in one row with 12px colour squares (Every state used is represented) */}
          <div
            style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(226, 232, 240, 0.7)',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px',
              fontSize: '13px',
              color: '#475569',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', background: '#16a34a', borderRadius: '2px' }}></div>
              <span>Free</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', background: '#eab308', borderRadius: '2px' }}></div>
              <span>Hold (15m)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', background: '#dc2626', borderRadius: '2px' }}></div>
              <span>Occupied</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '2px' }}></div>
              <span>On break</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', background: '#2563eb', borderRadius: '2px' }}></div>
              <span>Your seat</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Desk Details Drawer / Panel */}
      {selectedSeat && (
        <div className="panel" style={{ border: '1px solid rgba(37, 99, 235, 0.4)' }}>
          <div className="panel-header" style={{ background: 'rgba(239, 246, 255, 0.7)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '15px', color: '#0f172a' }}>
                Desk {selectedSeat.label}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background:
                    selectedSeat.status === 'free' ? '#dcfce7' :
                    selectedSeat.status === 'on_break' ? '#fef3c7' :
                    selectedSeat.status === 'booked' ? '#fef9c3' : '#fee2e2',
                  color:
                    selectedSeat.status === 'free' ? '#166534' :
                    selectedSeat.status === 'on_break' ? '#92400e' :
                    selectedSeat.status === 'booked' ? '#854d0e' : '#991b1b',
                  textTransform: 'uppercase',
                }}
              >
                {selectedSeat.status.replace('_', ' ')}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedSeatId(null)}
              style={{ background: 'transparent', border: 'none', fontSize: '15px', cursor: 'pointer', color: '#475569' }}
            >
              ✕
            </button>
          </div>

          <div className="panel-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.6)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                <div style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 600 }}>Location</div>
                <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>{FLOOR_NAMES[selectedSeat.floor_id ? parseInt(selectedSeat.floor_id.replace('f', ''), 10) || selectedFloor : selectedFloor]}</div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>Code: <code style={{ color: '#2563eb', fontWeight: 600 }}>{selectedSeat.code}</code></div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.6)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                <div style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 600 }}>Amenities</div>
                <div style={{ fontSize: '13px', color: '#334155', marginTop: '4px' }}>
                  2x 230V AC Power Socket, High-Speed Campus 5G Wi-Fi
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.6)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                <div style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 600 }}>Policy</div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                  15 minutes to scan QR hold, 20 minutes max break limit.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', paddingTop: '12px', borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
              {selectedSeat.status === 'free' ? (
                <>
                  <span style={{ fontSize: '13px', color: '#166534', marginRight: 'auto', fontWeight: 500 }}>
                    This desk is free and ready to reserve.
                  </span>
                  <button
                    type="button"
                    className="primary"
                    onClick={() => handleBookSeat(selectedSeat)}
                    style={{ padding: '8px 18px', fontSize: '13px' }}
                  >
                    Book desk {selectedSeat.label} (15m hold)
                  </button>
                </>
              ) : selectedSeat.active_booking?.user_reg_no === currentRegNo ? (
                <>
                  <span style={{ fontSize: '13px', color: '#2563eb', marginRight: 'auto', fontWeight: 500 }}>
                    Your current reserved seat.
                  </span>
                  <Link
                    href="/my-seat"
                    className="btn primary"
                    style={{ padding: '8px 16px', fontSize: '13px', textDecoration: 'none' }}
                  >
                    Open in My seat
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleReleaseSeat(selectedSeat)}
                    style={{ color: '#dc2626', borderColor: '#fca5a5', background: '#fff1f2', fontSize: '13px' }}
                  >
                    Release desk
                  </button>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '13px', color: '#475569', marginRight: 'auto' }}>
                    Held by student ({selectedSeat.active_booking?.user_reg_no || 'Occupied'})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      showToast(`Inspection request logged for seat ${selectedSeat.label}.`, 'info');
                    }}
                    style={{ fontSize: '12px' }}
                  >
                    Report ghost desk
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSeatId(null)}
                    style={{ fontSize: '13px' }}
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
