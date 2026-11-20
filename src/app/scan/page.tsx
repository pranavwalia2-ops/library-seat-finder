'use client';

import { useState } from 'react';

export default function ScanPage() {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setMessage('Please enter a valid seat code.');
      return;
    }
    setMessage(`Successfully checked in to seat code: ${code.trim().toUpperCase()}`);
  };

  return (
    <div>
      <h1>Scan QR</h1>
      <p style={{ color: '#6b7280', margin: '0 0 16px 0', fontSize: '14px' }}>
        Scan the QR code at your desk or type the seat code to check in.
      </p>

      {/* A panel with a rectangular box (4:3) labelled "Camera area" */}
      <div className="panel" style={{ maxWidth: '480px' }}>
        <div className="panel-header">Camera check-in</div>
        <div className="panel-body">
          {/* Rectangular box (4:3 aspect ratio) labelled "Camera area" */}
          <div
            style={{
              width: '100%',
              aspectRatio: '4 / 3',
              border: '1px solid #d1d5db',
              background: '#f9fafb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
              fontSize: '14px',
              marginBottom: '16px',
            }}
          >
            Camera area
          </div>

          {/* Text input plus button "Check in with code" */}
          <form onSubmit={handleCheckIn} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. LPU-F1-004"
              style={{ flex: 1 }}
            />
            <button type="submit" className="primary">
              Check in with code
            </button>
          </form>

          {message && (
            <div style={{ marginTop: '12px', fontSize: '13px', color: '#16a34a' }}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
