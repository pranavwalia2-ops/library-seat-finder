'use client';

import { useState } from 'react';

// TODO: replace static mock data with get_seat_map RPC
export default function MapPage() {
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  // Static mock seat generator for 100 seats per floor (10 cols x 10 rows)
  const getMockSeats = (floor: number) => {
    const seats = [];
    for (let i = 1; i <= 100; i++) {
      const pad = String(i).padStart(2, '0');
      const label = `F${floor}-${pad}`;
      
      // Deterministic mock statuses for realistic demo distribution
      let status: 'free' | 'occupied' | 'on_break' = 'free';
      if (
        i === 3 || i === 7 || i === 12 || i === 18 || i === 25 || i === 31 ||
        i === 44 || i === 52 || i === 63 || i === 71 || i === 85 || i === 94
      ) {
        status = 'occupied';
      } else if (i === 5 || i === 15 || i === 22 || i === 48 || i === 67 || i === 82) {
        status = 'on_break';
      }

      seats.push({ id: `s-${floor}-${i}`, label, status });
    }
    return seats;
  };

  const currentSeats = getMockSeats(selectedFloor);
  const total = 100;
  const occupied = currentSeats.filter((s) => s.status === 'occupied').length;
  const onBreak = currentSeats.filter((s) => s.status === 'on_break').length;
  const free = total - (occupied + onBreak);

  return (
    <div>
      <h1>Map</h1>
      <p style={{ color: '#6b7280', margin: '0 0 16px 0', fontSize: '14px' }}>
        Find a free seat and book it. The map refreshes every few seconds. (5 floors, 100 seats per floor)
      </p>

      {/* Summary strip of 4 boxes in one row: Total seats, Free, Occupied, On break */}
      <div className="summary-strip">
        <div className="summary-box">
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#000000' }}>{total}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Total on Floor {selectedFloor}</div>
        </div>
        <div className="summary-box">
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>{free}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Free</div>
        </div>
        <div className="summary-box">
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>{occupied}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Occupied</div>
        </div>
        <div className="summary-box">
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706' }}>{onBreak}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>On break</div>
        </div>
      </div>

      {/* Floor selector & Legend */}
      <div className="panel">
        <div className="panel-header">Floor selection and layout (100 seats)</div>
        <div className="panel-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            {/* Floor selector: 5 buttons */}
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
                <span>Free ({free})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '14px', height: '14px', background: '#ef4444', border: '1px solid #000000' }}></div>
                <span>Occupied ({occupied})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '14px', height: '14px', background: '#f59e0b', border: '1px solid #000000' }}></div>
                <span>On break ({onBreak})</span>
              </div>
            </div>
          </div>

          {/* Seat grid for the selected floor: 10 columns, 44px square cells, 1px black border */}
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
                    style={{
                      width: '44px',
                      height: '44px',
                      padding: 0,
                      background: bg,
                      border: isSelected ? '2px solid #1d4ed8' : '1px solid #000000',
                      color: '#000000',
                      fontSize: '11px',
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
