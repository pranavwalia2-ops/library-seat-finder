'use client';

import { useState, useEffect } from 'react';
import { loadStoredState, saveState, AppState } from '@/lib/store';
import QRCode from 'qrcode';

export default function AdminPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [qrSheetOpen, setQrSheetOpen] = useState(false);
  const [qrDataUrls, setQrDataUrls] = useState<{ [code: string]: string }>({});

  useEffect(() => {
    const current = loadStoredState();
    setState(current);
  }, []);

  const handleGeneratePrintableQRs = async () => {
    if (!state) return;
    const urls: { [code: string]: string } = {};
    for (const seat of state.seats.slice(0, 40)) {
      urls[seat.code] = await QRCode.toDataURL(seat.code, { margin: 1, width: 120 });
    }
    setQrDataUrls(urls);
    setQrSheetOpen(true);
  };

  if (!state) return null;

  const isAdmin = state.currentUser.role === 'admin';

  const makeAdmin = () => {
    const current = loadStoredState();
    current.currentUser = {
      id: 'u-12200000',
      reg_no: '12200000',
      name: 'Admin',
      role: 'admin',
    };
    saveState(current);
    setState(current);
  };

  const floorStats = state.floors.map((fl) => {
    const floorSeats = state.seats.filter((s) => s.floor_id === fl.id);
    const occupied = floorSeats.filter((s) => s.status === 'checked_in').length;
    const onBreak = floorSeats.filter((s) => s.status === 'on_break').length;
    const booked = floorSeats.filter((s) => s.status === 'booked').length;
    const free = floorSeats.length - (occupied + onBreak + booked);
    const occupancyRate = Math.round(((occupied + onBreak + booked) / floorSeats.length) * 100);

    return {
      floor: fl.name,
      level: fl.level,
      total: floorSeats.length,
      occupied,
      onBreak,
      booked,
      free,
      occupancyRate,
    };
  });

  return (
    <div>
      <h1>Admin</h1>
      <p style={{ margin: '4px 0 16px 0' }}>Library occupancy, peak hours and hogged seat records.</p>

      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        {!isAdmin ? (
          <button onClick={makeAdmin} className="primary">
            Switch to admin role
          </button>
        ) : (
          <button onClick={handleGeneratePrintableQRs}>
            Print QR codes (Floor 1)
          </button>
        )}
      </div>

      <h2>Floor occupancy</h2>
      <table>
        <thead>
          <tr>
            <th>Floor</th>
            <th>Total</th>
            <th>Occupied</th>
            <th>On break</th>
            <th>Booked</th>
            <th>Free</th>
            <th>Occupancy</th>
          </tr>
        </thead>
        <tbody>
          {floorStats.map((fs) => (
            <tr key={fs.level}>
              <td>Floor {fs.level} ({fs.floor})</td>
              <td>{fs.total}</td>
              <td>{fs.occupied}</td>
              <td>{fs.onBreak}</td>
              <td>{fs.booked}</td>
              <td>{fs.free}</td>
              <td>{fs.occupancyRate}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Peak hours footfall</h2>
      <table>
        <thead>
          <tr>
            <th>Hour</th>
            <th>Bookings</th>
          </tr>
        </thead>
        <tbody>
          {state.peakHours.map((ph) => (
            <tr key={ph.hour}>
              <td>{ph.hour}</td>
              <td>{ph.bookings}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Top 10 hogged seats</h2>
      <p style={{ fontSize: '14px', margin: '4px 0 8px 0', color: '#666' }}>
        Criteria: frequent timeout releases and high ratio of break time to total held time.
      </p>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Seat</th>
            <th>Floor</th>
            <th>Timeouts</th>
            <th>Break ratio</th>
            <th>Held time</th>
          </tr>
        </thead>
        <tbody>
          {state.hoggedMetrics.map((hm, idx) => (
            <tr key={hm.seat_code}>
              <td>{idx + 1}</td>
              <td>{hm.seat_label}</td>
              <td>{hm.floor_name}</td>
              <td>{hm.timeout_count} times</td>
              <td>{hm.break_ratio}%</td>
              <td>{hm.total_held_minutes} mins</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* QR print modal */}
      {qrSheetOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #000000',
            padding: '16px',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0 }}>QR codes sheet</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => window.print()} className="primary">Print</button>
                <button onClick={() => setQrSheetOpen(false)}>Close</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {Object.entries(qrDataUrls).map(([code, dataUrl]) => (
                <div key={code} style={{ border: '1px solid #999', padding: '8px', textAlign: 'center' }}>
                  <img src={dataUrl} alt={code} style={{ width: '100px', height: '100px', margin: '0 auto' }} />
                  <div style={{ fontSize: '12px', marginTop: '4px', fontFamily: 'monospace' }}>{code}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
