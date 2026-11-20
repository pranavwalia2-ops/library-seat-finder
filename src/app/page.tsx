'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { loadStoredState, AppState } from '@/lib/store';

export default function HomePage() {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    setState(loadStoredState());
  }, []);

  const totalSeats = state?.seats.length || 120;
  const occupiedSeats = state?.seats.filter(s => s.status === 'checked_in').length || 0;
  const breakSeats = state?.seats.filter(s => s.status === 'on_break').length || 0;
  const bookedSeats = state?.seats.filter(s => s.status === 'booked').length || 0;
  const freeSeats = totalSeats - (occupiedSeats + breakSeats + bookedSeats);

  return (
    <div>
      <h1>SeatSync</h1>
      <p style={{ margin: '8px 0 16px 0' }}>
        Library seat booking and status tracking.
      </p>

      <h2>Current occupancy</h2>
      <table>
        <thead>
          <tr>
            <th>Status</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Free seats</td>
            <td>{freeSeats}</td>
          </tr>
          <tr>
            <td>Occupied</td>
            <td>{occupiedSeats}</td>
          </tr>
          <tr>
            <td>On break</td>
            <td>{breakSeats}</td>
          </tr>
          <tr>
            <td>Booked (awaiting check-in)</td>
            <td>{bookedSeats}</td>
          </tr>
          <tr>
            <td><strong>Total</strong></td>
            <td><strong>{totalSeats}</strong></td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: '16px' }}>
        <Link href="/map" style={{ marginRight: '16px' }}>Go to Map &rarr;</Link>
        <Link href="/my-seat">View My seat &rarr;</Link>
      </div>
    </div>
  );
}
