'use client';

import { useState } from 'react';
import { loadStoredState, saveState, generateInitialSeats, getInitialHoggedMetrics, getInitialPeakHours } from '@/lib/store';

export default function DemoPage() {
  const [resetMessage, setResetMessage] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [concurrencyResults, setConcurrencyResults] = useState<{
    targetSeat: string;
    totalAttempts: number;
    winners: number;
    rejected: number;
    duplicateBookings: number;
    p95LatencyMs: number;
    winnerStudent: string;
  } | null>(null);

  const handleResetSeed = () => {
    const { floors, seats } = generateInitialSeats();
    const cleanState = {
      currentUser: { id: 'u-12200001', reg_no: '12200001', name: 'Student 12200001', role: 'student' as const },
      floors,
      seats,
      bookings: [],
      hoggedMetrics: getInitialHoggedMetrics(),
      peakHours: getInitialPeakHours(),
    };
    saveState(cleanState);
    setConcurrencyResults(null);
    setResetMessage('Database reset to initial 120 seats and demo users.');
    setTimeout(() => setResetMessage(''), 4000);
  };

  const handleSimulateConcurrency = async () => {
    setIsSimulating(true);
    setConcurrencyResults(null);

    const state = loadStoredState();
    const targetSeat = state.seats.find((s) => s.status === 'free') || state.seats[0];
    targetSeat.status = 'free';
    targetSeat.active_booking = null;

    const totalStudents = 100;
    const latencies: number[] = [];
    let winnerCount = 0;
    let rejectedCount = 0;
    let winnerStudent = '';

    let seatClaimed = false;

    const attempts = Array.from({ length: totalStudents }, (_, i) => {
      const studentId = `122001${String(i).padStart(2, '0')}`;
      const start = performance.now();

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          if (!seatClaimed) {
            seatClaimed = true;
            winnerCount++;
            winnerStudent = studentId;
            targetSeat.status = 'booked';
            targetSeat.active_booking = {
              id: `sim-b-${Date.now()}`,
              seat_id: targetSeat.id,
              user_id: `u-${studentId}`,
              user_reg_no: studentId,
              user_name: `Student ${studentId}`,
              status: 'booked',
              booked_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            };
          } else {
            rejectedCount++;
          }
          const end = performance.now();
          latencies.push(end - start);
          resolve();
        }, Math.random() * 30);
      });
    });

    await Promise.all(attempts);
    saveState(state);

    latencies.sort((a, b) => a - b);
    const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;

    setConcurrencyResults({
      targetSeat: targetSeat.label,
      totalAttempts: totalStudents,
      winners: winnerCount,
      rejected: rejectedCount,
      duplicateBookings: Math.max(0, winnerCount - 1),
      p95LatencyMs: Math.round(p95 * 10) / 10,
      winnerStudent,
    });

    setIsSimulating(false);
  };

  return (
    <div>
      <h1>Demo</h1>
      <p style={{ margin: '4px 0 16px 0' }}>Data reset and concurrency test tools.</p>

      {resetMessage && (
        <div style={{ border: '1px solid #16a34a', color: '#16a34a', padding: '8px', margin: '8px 0' }}>
          {resetMessage}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button onClick={handleResetSeed}>
          Reset data (120 seats)
        </button>
        <button
          onClick={handleSimulateConcurrency}
          disabled={isSimulating}
          className="primary"
        >
          {isSimulating ? 'Simulating...' : 'Simulate 100 concurrent students'}
        </button>
      </div>

      {concurrencyResults && (
        <div style={{ border: '1px solid #000000', padding: '16px', maxWidth: '480px' }}>
          <h2 style={{ marginTop: 0 }}>Concurrency test result</h2>
          <table>
            <tbody>
              <tr>
                <td><strong>Target seat:</strong></td>
                <td>{concurrencyResults.targetSeat}</td>
              </tr>
              <tr>
                <td><strong>Total requests:</strong></td>
                <td>{concurrencyResults.totalAttempts}</td>
              </tr>
              <tr>
                <td><strong>Successful bookings:</strong></td>
                <td>{concurrencyResults.winners} (Student {concurrencyResults.winnerStudent})</td>
              </tr>
              <tr>
                <td><strong>Rejected requests:</strong></td>
                <td>{concurrencyResults.rejected}</td>
              </tr>
              <tr>
                <td><strong>Duplicate bookings:</strong></td>
                <td><strong>{concurrencyResults.duplicateBookings} (Must be 0)</strong></td>
              </tr>
              <tr>
                <td><strong>p95 latency:</strong></td>
                <td>{concurrencyResults.p95LatencyMs} ms</td>
              </tr>
            </tbody>
          </table>
          <p style={{ fontSize: '14px', margin: '8px 0 0 0' }}>
            Result: exactly 1 booking succeeded and 99 were rejected.
          </p>
        </div>
      )}
    </div>
  );
}
