'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  loadStoredState,
  triggerAutoReleaseEngine,
  simulateRushHourAction,
  resetLibraryAction,
  Seat,
  AppState,
} from '@/lib/store';

export default function AdminPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const refreshData = useCallback(() => {
    try {
      const data = loadStoredState();
      setState(data);
    } catch {}
  }, []);

  useEffect(() => {
    refreshData();
    window.addEventListener('seatsync_change', refreshData);
    return () => window.removeEventListener('seatsync_change', refreshData);
  }, [refreshData]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  const handleAutoRelease = () => {
    const res = triggerAutoReleaseEngine();
    showToast(res.message, 'success');
    refreshData();
  };

  const handleSimulateRush = () => {
    const res = simulateRushHourAction();
    showToast(res.message, 'info');
    refreshData();
  };

  const handleReset = () => {
    const res = resetLibraryAction();
    showToast(res.message, 'info');
    refreshData();
  };

  const seats: Seat[] = state?.seats || [];
  const total = seats.length || 500;
  const occupied = seats.filter((s) => s.status === 'checked_in' || s.status === 'booked').length;
  const onBreak = seats.filter((s) => s.status === 'on_break').length;
  const free = seats.filter((s) => s.status === 'free').length;
  const occupancyPct = Math.round(((occupied + onBreak) / total) * 100);

  const peakHours = state?.peakHours || [
    { hour: '08:00', bookings: 14 },
    { hour: '09:00', bookings: 38 },
    { hour: '10:00', bookings: 76 },
    { hour: '11:00', bookings: 98 },
    { hour: '12:00', bookings: 112 },
    { hour: '13:00', bookings: 89 },
    { hour: '14:00', bookings: 104 },
    { hour: '15:00', bookings: 118 },
    { hour: '16:00', bookings: 95 },
    { hour: '17:00', bookings: 82 },
    { hour: '18:00', bookings: 64 },
    { hour: '19:00', bookings: 42 },
  ];

  const maxBookings = Math.max(...peakHours.map((p) => p.bookings), 120);

  const hoggedSeats = state?.hoggedMetrics || [
    { seat_label: 'F1-005', seat_code: 'LPU-F1-005', floor_name: 'Floor 1', timeout_count: 8, break_ratio: 72, total_held_minutes: 240 },
    { seat_label: 'F1-012', seat_code: 'LPU-F1-012', floor_name: 'Floor 1', timeout_count: 6, break_ratio: 65, total_held_minutes: 190 },
    { seat_label: 'F2-008', seat_code: 'LPU-F2-008', floor_name: 'Floor 2', timeout_count: 5, break_ratio: 58, total_held_minutes: 160 },
    { seat_label: 'F1-022', seat_code: 'LPU-F1-022', floor_name: 'Floor 1', timeout_count: 5, break_ratio: 54, total_held_minutes: 145 },
    { seat_label: 'F3-004', seat_code: 'LPU-F3-004', floor_name: 'Floor 3', timeout_count: 4, break_ratio: 51, total_held_minutes: 130 },
    { seat_label: 'F2-019', seat_code: 'LPU-F2-019', floor_name: 'Floor 2', timeout_count: 4, break_ratio: 48, total_held_minutes: 120 },
    { seat_label: 'F3-015', seat_code: 'LPU-F3-015', floor_name: 'Floor 3', timeout_count: 3, break_ratio: 45, total_held_minutes: 110 },
  ];

  return (
    <div>
      {/* 1. Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div>
          <h1>Administration</h1>
          <p style={{ color: '#475569', margin: '2px 0 0 0', fontSize: '14px' }}>
            Library occupancy trends, peak hour distribution, and seat hogging analytics (Problem M4).
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', background: 'rgba(255,255,255,0.55)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.7)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb', display: 'inline-block' }}></span>
          <span>Daemon: 60s interval</span>
        </div>
      </div>

      {/* 2. Toast Bar */}
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
            background: toastMessage.type === 'success' ? '#f0fdf4' : '#eff6ff',
            border: `1px solid ${toastMessage.type === 'success' ? '#bbf7d0' : '#bfdbfe'}`,
            color: toastMessage.type === 'success' ? '#166534' : '#1e40af',
          }}
        >
          <span>{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: '2px 6px' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. Four Equal Glass Summary Cards */}
      <div className="summary-strip">
        <div className="summary-box">
          <div className="summary-label">Current occupancy</div>
          <div className="summary-number" style={{ color: '#0f172a' }}>{occupancyPct}%</div>
          <div className="summary-caption">{occupied + onBreak} of {total} desks</div>
        </div>

        <div className="summary-box">
          <div className="summary-label">Available desks</div>
          <div className="summary-number" style={{ color: '#16a34a' }}>{free}</div>
          <div className="summary-caption">Ready for reservation</div>
        </div>

        <div className="summary-box">
          <div className="summary-label">Active breaks</div>
          <div className="summary-number" style={{ color: '#f59e0b' }}>{onBreak}</div>
          <div className="summary-caption">20m countdown monitored</div>
        </div>

        <div className="summary-box">
          <div className="summary-label">Auto-releases</div>
          <div className="summary-number" style={{ color: '#2563eb' }}>39</div>
          <div className="summary-caption">Ghost seats reclaimed</div>
        </div>
      </div>

      {/* 4. Controls */}
      <div className="panel">
        <div className="panel-header">
          <span>Administrative controls</span>
          <span style={{ fontSize: '11px', color: '#475569' }}>Autonomous engine triggers</span>
        </div>

        <div className="panel-body">
          <p style={{ fontSize: '13px', color: '#475569', marginTop: 0, marginBottom: '14px' }}>
            Simulate background jobs and student influx:
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="primary"
              onClick={handleAutoRelease}
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              Run auto-release engine
            </button>
            <button
              type="button"
              onClick={handleSimulateRush}
              className="secondary-glass"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              Simulate rush hour (25 students)
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="secondary-glass"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              Reset demo data
            </button>
          </div>
        </div>
      </div>

      {/* 5. Peak Hours Chart */}
      <div className="panel">
        <div className="panel-header">
          <span>Peak hours and booking volume</span>
          <span style={{ fontSize: '12px', color: '#475569' }}>Peak: 15:00 (118 students)</span>
        </div>

        <div className="panel-body">
          <table>
            <thead>
              <tr>
                <th style={{ width: '100px' }}>Hour</th>
                <th style={{ width: '140px' }}>Bookings</th>
                <th>Volume bar</th>
              </tr>
            </thead>
            <tbody>
              {peakHours.map((row) => {
                const pct = Math.round((row.bookings / maxBookings) * 100);
                const isPeak = row.bookings >= 110;
                return (
                  <tr key={row.hour}>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{row.hour}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: isPeak ? '#dc2626' : '#0f172a' }}>
                        {row.bookings} students
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            flex: 1,
                            maxWidth: '380px',
                            height: '10px',
                            background: 'rgba(0,0,0,0.06)',
                            borderRadius: '5px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${pct}%`,
                              height: '100%',
                              background: isPeak ? '#dc2626' : '#2563eb',
                              borderRadius: '5px',
                            }}
                          ></div>
                        </div>
                        <span style={{ fontSize: '12px', color: '#475569', minWidth: '35px' }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Hogged Seats Analytics */}
      <div className="panel">
        <div className="panel-header">
          <span>Problem M4: Top hogged desks audit</span>
          <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 500 }}>
            Flagged for inspection
          </span>
        </div>

        <div className="panel-body">
          <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
            A seat is flagged when the ratio of break time to active study time exceeds 40% or when the 15-minute QR scan timeout is repeatedly triggered.
          </p>

          <table>
            <thead>
              <tr>
                <th>Desk ID</th>
                <th>Location</th>
                <th>Break-to-study ratio</th>
                <th>Timeouts</th>
                <th>Total held time</th>
              </tr>
            </thead>
            <tbody>
              {hoggedSeats.map((row) => (
                <tr key={row.seat_label}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{row.seat_label}</td>
                  <td style={{ color: '#475569' }}>{row.floor_name}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '80px', height: '6px', background: 'rgba(0,0,0,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${row.break_ratio}%`,
                            height: '100%',
                            background: row.break_ratio > 60 ? '#dc2626' : '#f59e0b',
                          }}
                        ></div>
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '12px', color: row.break_ratio > 60 ? '#dc2626' : '#d97706' }}>
                        {row.break_ratio}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626', fontWeight: 600, fontSize: '12px' }}>
                      {row.timeout_count} times
                    </span>
                  </td>
                  <td style={{ color: '#0f172a', fontWeight: 500 }}>
                    {Math.floor(row.total_held_minutes / 60)}h {row.total_held_minutes % 60}m
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
