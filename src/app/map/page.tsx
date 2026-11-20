'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getRegistrationNumber } from '@/lib/user';

interface RawSeat {
  id?: string;
  seat_id?: string;
  label?: string;
  seat_label?: string;
  code?: string;
  seat_code?: string;
  status?: string;
  seat_status?: string;
  floor?: number;
  level?: number;
  floor_level?: number;
  floor_id?: string;
}

interface SeatItem {
  id: string;
  label: string;
  code: string;
  status: string; // raw status: free, booked, checked_in, on_break, occupied
  floor: number;
}

function parseFloor(seat: RawSeat): number {
  if (typeof seat.floor === 'number') return seat.floor;
  if (typeof seat.level === 'number') return seat.level;
  if (typeof seat.floor_level === 'number') return seat.floor_level;
  const label = seat.label || seat.seat_label || '';
  const match = label.match(/^F(\d+)-/i);
  if (match) return parseInt(match[1], 10);
  if (typeof seat.floor_id === 'string') {
    const fMatch = seat.floor_id.match(/^f?(\d+)/i);
    if (fMatch) return parseInt(fMatch[1], 10);
  }
  return 1;
}

function getDisplayStatus(rawStatus: string | undefined): 'free' | 'occupied' | 'on_break' {
  if (!rawStatus) return 'free';
  const s = rawStatus.toLowerCase();
  if (s === 'on_break') return 'on_break';
  if (s === 'booked' || s === 'checked_in' || s === 'occupied') return 'occupied';
  return 'free';
}

// Fallback initial seats (5 floors x 100 seats) so map renders instantly while RPC connects
function getInitialSeats(): SeatItem[] {
  const floorConfig: Record<number, { occupied: number; onBreak: number }> = {
    1: { occupied: 15, onBreak: 5 },
    2: { occupied: 40, onBreak: 8 },
    3: { occupied: 65, onBreak: 10 },
    4: { occupied: 85, onBreak: 8 },
    5: { occupied: 30, onBreak: 15 },
  };

  const list: SeatItem[] = [];
  for (let floor = 1; floor <= 5; floor++) {
    const { occupied, onBreak } = floorConfig[floor] || { occupied: 20, onBreak: 5 };
    for (let i = 1; i <= 100; i++) {
      const pad = String(i).padStart(3, '0');
      const label = `F${floor}-${pad}`;
      const code = `LPU-F${floor}-${pad}`;
      const id = `s-${floor}-${i}`;
      const seed = floor * 2106 + i * 6723;
      const hash = Math.abs((Math.imul(seed ^ (seed >>> 15), 0x45d9f3b) ^ (seed >>> 7)) % 100);

      let status = 'free';
      if (hash < occupied) status = 'occupied';
      else if (hash < occupied + onBreak) status = 'on_break';

      list.push({ id, label, code, status, floor });
    }
  }
  return list;
}

export default function MapPage() {
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [seats, setSeats] = useState<SeatItem[]>(getInitialSeats);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  const fetchSeats = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_seat_map');
      if (!isMountedRef.current) return;

      if (error || !data) {
        setLoadError('Could not load seats. Retrying.');
        return;
      }

      const list: RawSeat[] = Array.isArray(data) ? data : [];
      if (list.length > 0) {
        const parsed: SeatItem[] = list.map((item, index) => {
          const id = item.id || item.seat_id || `seat-${index}`;
          const label = item.label || item.seat_label || `Seat-${index + 1}`;
          const code = item.code || item.seat_code || label;
          const status = item.status || item.seat_status || 'free';
          const floor = parseFloor(item);
          return { id, label, code, status, floor };
        });

        setSeats(parsed);
        setLoadError(null);
      } else {
        setLoadError('Could not load seats. Retrying.');
      }
    } catch {
      if (isMountedRef.current) {
        setLoadError('Could not load seats. Retrying.');
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchSeats();

    // Subscribe to Realtime changes on the bookings table
    const channel = supabase
      .channel('realtime-map-bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => {
          fetchSeats();
        }
      )
      .subscribe();

    // Re-fetch every 3 seconds with setInterval
    const intervalId = setInterval(fetchSeats, 3000);

    return () => {
      isMountedRef.current = false;
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, [fetchSeats]);

  async function handleSeatClick(seat: SeatItem) {
    const displayStatus = getDisplayStatus(seat.status);
    // Red or amber seats do nothing on click
    if (displayStatus !== 'free') {
      return;
    }

    const confirmed = window.confirm(`Book seat ${seat.label}?`);
    if (!confirmed) return;

    setActionError(null);
    setActionSuccess(null);
    const regNo = getRegistrationNumber();

    try {
      // Use exact SQL function arguments (p_seat_id, p_reg_no)
      let { error } = await supabase.rpc('book_seat', {
        p_seat_id: seat.id,
        p_reg_no: regNo,
      });

      // Fallback if parameter names in SQL function differ
      if (error && error.message && error.message.includes('function') && error.message.includes('not found')) {
        const fallback = await supabase.rpc('book_seat', {
          seat_id: seat.id,
          reg_no: regNo,
        });
        error = fallback.error;
      }

      if (error) {
        setActionError(error.message || 'Seat taken or student already holds a booking.');
        return;
      }

      setActionSuccess(`Seat ${seat.label} booked. Check in within 10 minutes.`);
      fetchSeats();
    } catch (err: any) {
      setActionError(err?.message || 'Seat taken or student already holds a booking.');
    }
  }

  // Summary strip totals calculated across all loaded seats
  const totalLibrarySeats = seats.length;
  const totalLibraryFree = seats.filter((s) => getDisplayStatus(s.status) === 'free').length;
  const totalLibraryOccupied = seats.filter((s) => getDisplayStatus(s.status) === 'occupied').length;
  const totalLibraryOnBreak = seats.filter((s) => getDisplayStatus(s.status) === 'on_break').length;

  // Floor-specific seats and metrics
  const floorSeats = seats.filter((s) => s.floor === selectedFloor);
  const floorFree = floorSeats.filter((s) => getDisplayStatus(s.status) === 'free').length;
  const floorOccupied = floorSeats.filter((s) => getDisplayStatus(s.status) === 'occupied').length;
  const floorOnBreak = floorSeats.filter((s) => getDisplayStatus(s.status) === 'on_break').length;

  return (
    <div>
      <h1>Map</h1>
      <p style={{ color: '#6b7280', margin: '0 0 16px 0', fontSize: '14px' }}>
        Find a free seat and book it. The map refreshes every few seconds.
      </p>

      {/* Summary strip: Total seats, Free, Occupied, On break */}
      <div className="summary-strip">
        <div className="summary-box">
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#000000' }}>{totalLibrarySeats}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Total seats</div>
        </div>
        <div className="summary-box">
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>{totalLibraryFree}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Free</div>
        </div>
        <div className="summary-box">
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>{totalLibraryOccupied}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Occupied</div>
        </div>
        <div className="summary-box">
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706' }}>{totalLibraryOnBreak}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>On break</div>
        </div>
      </div>

      {/* Floor selector & Legend */}
      <div className="panel">
        <div className="panel-header">
          Floor selection and layout (Floor {selectedFloor} - {floorSeats.length} seats)
        </div>
        <div className="panel-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            {/* Floor selector: 5 buttons (Floor 1 to Floor 5) */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5].map((fl) => (
                <button
                  key={fl}
                  type="button"
                  onClick={() => {
                    setSelectedFloor(fl);
                    setActionError(null);
                    setActionSuccess(null);
                  }}
                  className={selectedFloor === fl ? 'primary' : ''}
                >
                  Floor {fl}
                </button>
              ))}
            </div>

            {/* Legend: small squares with dynamic counts */}
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '14px', height: '14px', background: '#22c55e', border: '1px solid #000000' }}></div>
                <span>Free ({floorFree})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '14px', height: '14px', background: '#ef4444', border: '1px solid #000000' }}></div>
                <span>Occupied ({floorOccupied})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '14px', height: '14px', background: '#f59e0b', border: '1px solid #000000' }}></div>
                <span>On break ({floorOnBreak})</span>
              </div>
            </div>
          </div>

          {/* Plain red line above the grid for errors */}
          {loadError && (
            <div style={{ color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>
              {loadError}
            </div>
          )}

          {actionError && (
            <div style={{ color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>
              {actionError}
            </div>
          )}

          {/* Plain green line above the grid for success */}
          {actionSuccess && (
            <div style={{ color: '#16a34a', fontSize: '13px', marginBottom: '12px' }}>
              {actionSuccess}
            </div>
          )}

          {/* Seat grid: 10 columns on desktop (44px), 6 columns on mobile under 600px (40px) */}
          <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
            <div className="seat-grid-container">
              {floorSeats.map((seat) => {
                const displayStatus = getDisplayStatus(seat.status);
                let bg = '#22c55e'; // free = green
                if (displayStatus === 'occupied') bg = '#ef4444'; // occupied (booked or checked_in) = red
                if (displayStatus === 'on_break') bg = '#f59e0b'; // on break = amber

                const isClickable = displayStatus === 'free';

                return (
                  <button
                    key={seat.id}
                    type="button"
                    onClick={() => handleSeatClick(seat)}
                    className="seat-cell"
                    style={{
                      padding: 0,
                      background: bg,
                      border: '1px solid #000000',
                      color: '#000000',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: isClickable ? 'pointer' : 'default',
                    }}
                    title={`${seat.label} (${seat.status})`}
                  >
                    {seat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
