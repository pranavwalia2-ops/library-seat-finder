'use client';

import { useState } from 'react';

// TODO: replace static mock data with get_seat_map RPC
export default function MapPage() {
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  // TODO: replace static mock data with get_seat_map RPC
  // Deterministic mock seat generator for 100 seats per floor (labels F1-001 … F5-100)
  const getMockSeats = (floor: number) => {
    const seats = [];
    // Target percentages per floor (occupied, onBreak)
    const floorConfig: Record<number, { occupied: number; onBreak: number }> = {
      1: { occupied: 0.15, onBreak: 0.05 },
      2: { occupied: 0.40, onBreak: 0.08 },
      3: { occupied: 0.65, onBreak: 0.10 },
      4: { occupied: 0.85, onBreak: 0.08 },
      5: { occupied: 0.30, onBreak: 0.15 },
    };
    const { occupied, onBreak } = floorConfig[floor] || { occupied: 0.2, onBreak: 0.05 };
    const occupiedThresh = occupied;
    const onBreakThresh = occupied + onBreak;
    for (let i = 1; i <= 100; i++) {
      const pad = String(i).padStart(3, '0');
      const label = `F${floor}-${pad}`;
      // Simple deterministic pseudo‑random based on floor and seat number
      const hash = (floor * 1000 + i) * 31 % 1000; // 0‑999
      const rand = hash / 1000; // 0‑0.999
      let status: 'free' | 'occupied' | 'on_break' = 'free';
      if (rand < occupiedThresh) {
        status = 'occupied';
      } else if (rand < onBreakThresh) {
        status = 'on_break';
      }
      seats.push({ id: `s-${floor}-${i}`, label, status });
    }
    return seats;
  };

  const currentSeats = getMockSeats(selectedFloor);
  const floorSeatsTotal = 100;
  const floorOccupied = currentSeats.filter((s) => s.status === 'occupied').length;
  const floorOnBreak = currentSeats.filter((s) => s.status === 'on_break').length;
  const floorFree = floorSeatsTotal - (floorOccupied + floorOnBreak);

  // Library-wide summary totals across all 5 floors (500 seats)
  const totalLibrarySeats = 500;
  let totalLibraryOccupied = 0;
  let totalLibraryOnBreak = 0;
  for (let fl = 1; fl <= 5; fl++) {
    const seats = getMockSeats(fl);
    totalLibraryOccupied += seats.filter((s) => s.status === 'occupied').length;
    totalLibraryOnBreak += seats.filter((s) => s.status === 'on_break').length;
  }
  const totalLibraryFree = totalLibrarySeats - (totalLibraryOccupied + totalLibraryOnBreak);

  return (
    <div>
      <h1>Map</h1>
      <p style={{ color: '#6b7280', margin: '0 0 16px 0', fontSize: '14px' }}>
        Find a free seat and book it. The map refreshes every few seconds.
      </p>

      {/* Summary strip: Total seats = 500, Free, Occupied, On break */}
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
        <div className="panel-header">Floor selection and layout (Floor {selectedFloor} - 100 seats)</div>
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
                    setSelectedSeat(null);
                  }}
                  className={selectedFloor === fl ? 'primary' : ''}
                >
                  Floor {fl}
                </button>
              ))}
            </div>

            {/* Legend: small squares */}
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

          {/* Seat grid: 10 columns on desktop (44px), 6 columns on mobile under 600px (40px) */}
          <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
            <div className="seat-grid-container">
              {currentSeats.map((seat) => {
                let bg = '#22c55e'; // Green: Free
                if (seat.status === 'occupied') bg = '#ef4444'; // Red: Occupied
                if (seat.status === 'on_break') bg = '#f59e0b'; // Amber: On break

                const isSelected = selectedSeat === seat.label;

                return (
                  <button
                    key={seat.id}
                    type="button"
                    onClick={() => setSelectedSeat(seat.label)}
                    className="seat-cell"
                    style={{
                      padding: 0,
                      background: bg,
                      border: isSelected ? '2px solid #1d4ed8' : '1px solid #000000',
                      color: '#000000',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: seat.status === 'free' ? 'pointer' : 'default',
                    }}
                    title={`${seat.label} (${seat.status})`}
                  >
                    {seat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedSeat && (
            <div style={{ marginTop: '16px', borderTop: '1px solid #d1d5db', paddingTop: '12px', fontSize: '14px' }}>
              Selected seat: <strong>{selectedSeat}</strong>.{' '}
              <button
                type="button"
                className="primary"
                onClick={() => alert(`Seat ${selectedSeat} booked (15m hold).`)}
                style={{ marginLeft: '8px' }}
              >
                Book seat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
