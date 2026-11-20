'use client';

import { useState, useEffect, useCallback } from 'react';
import { gateScan, loadStoredState, GateLog } from '@/lib/store';

function toIST(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export default function GatePage() {
  const [regNo, setRegNo] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [recentLogs, setRecentLogs] = useState<GateLog[]>([]);

  const refreshLogs = useCallback(() => {
    try {
      const state = loadStoredState();
      setRecentLogs((state.gateLogs || []).slice(0, 10));
    } catch {}
  }, []);

  useEffect(() => {
    refreshLogs();
    window.addEventListener('seatsync_change', refreshLogs);
    return () => window.removeEventListener('seatsync_change', refreshLogs);
  }, [refreshLogs]);

  const handleScan = (direction: 'in' | 'out') => {
    const trimmed = regNo.trim();
    if (!/^\d{8}$/.test(trimmed)) {
      setMessage({ text: 'Enter a valid 8-digit registration number.', type: 'error' });
      return;
    }
    const result = gateScan(trimmed, direction);
    setMessage({ text: result, type: 'success' });
    refreshLogs();
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1>Gate scan</h1>
        <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
          Simulates the turnstile reader. The real turnstile sends registration number and direction.
        </p>
      </div>

      {/* Input Panel */}
      <div className="panel" style={{ marginBottom: '24px' }}>
        <div className="panel-header">Turnstile Input</div>
        <div className="panel-body">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 220px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Registration Number
              </label>
              <input
                type="text"
                placeholder="e.g. 12200001"
                maxLength={8}
                value={regNo}
                onChange={(e) => setRegNo(e.target.value.replace(/\D/g, '').slice(0, 8))}
                onKeyDown={(e) => { if (e.key === 'Enter') handleScan('in'); }}
                style={{ width: '100%' }}
              />
            </div>
            <button
              type="button"
              className="primary"
              onClick={() => handleScan('in')}
              style={{ padding: '9px 22px', fontSize: '14px', background: '#16a34a' }}
            >
              Entry turnstile
            </button>
            <button
              type="button"
              className="primary"
              onClick={() => handleScan('out')}
              style={{ padding: '9px 22px', fontSize: '14px', background: '#dc2626' }}
            >
              Exit turnstile
            </button>
          </div>

          {message && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 500,
                background: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
                border: message.type === 'error' ? '1px solid #fecdd3' : '1px solid #bbf7d0',
                color: message.type === 'error' ? '#991b1b' : '#166534',
              }}
            >
              {message.text}
            </div>
          )}
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="panel">
        <div className="panel-header">Last 10 scans</div>
        <div className="panel-body" style={{ padding: 0, overflowX: 'auto' }}>
          {recentLogs.length === 0 ? (
            <p style={{ padding: '20px', color: '#475569', fontSize: '14px' }}>No scans yet. Use the buttons above.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: 'rgba(248, 250, 252, 0.8)' }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>Reg No</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>Direction</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>Time (IST)</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log, i) => (
                  <tr key={log.id} style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(226, 232, 240, 0.7)' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: '#0f172a' }}>{log.regNo}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 10px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: log.direction === 'in' ? '#dcfce7' : '#fee2e2',
                        color: log.direction === 'in' ? '#166534' : '#991b1b',
                      }}>
                        {log.direction === 'in' ? '↑ Entry' : '↓ Exit'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', color: '#475569' }}>{toIST(log.at)}</td>
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
