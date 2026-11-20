'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { loadStoredState, saveState } from '@/lib/store';

export default function ScanPage() {
  const router = useRouter();
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef<any>(null);

  const handleCheckInWithCode = (code: string) => {
    setError('');
    setSuccess('');
    const cleanCode = code.trim().toUpperCase();

    const state = loadStoredState();
    const userRegNo = state.currentUser.reg_no;

    const userSeatIndex = state.seats.findIndex(
      (s) => s.active_booking && s.active_booking.user_reg_no === userRegNo
    );

    if (userSeatIndex === -1) {
      setError(`No active booking found for student ${userRegNo}.`);
      return;
    }

    const targetSeat = state.seats[userSeatIndex];

    if (targetSeat.code !== cleanCode) {
      setError(`Code mismatch. Booked ${targetSeat.label} (${targetSeat.code}), entered ${cleanCode}.`);
      return;
    }

    state.seats[userSeatIndex] = {
      ...targetSeat,
      status: 'checked_in',
      active_booking: {
        ...targetSeat.active_booking!,
        status: 'checked_in',
        checked_in_at: new Date().toISOString(),
        expires_at: null,
      },
    };

    saveState(state);
    setSuccess(`Checked in to seat ${targetSeat.label}.`);
    setTimeout(() => {
      router.push('/my-seat');
    }, 1200);
  };

  useEffect(() => {
    let html5QrCodeScanner: any = null;

    if (cameraActive) {
      import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
        html5QrCodeScanner = new Html5QrcodeScanner(
          'qr-reader',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );

        html5QrCodeScanner.render(
          (decodedText: string) => {
            handleCheckInWithCode(decodedText);
            html5QrCodeScanner.clear();
            setCameraActive(false);
          },
          () => {}
        );
        scannerRef.current = html5QrCodeScanner;
      });
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [cameraActive]);

  const state = typeof window !== 'undefined' ? loadStoredState() : null;
  const currentSeat = state?.seats.find(
    (s) => s.active_booking && s.active_booking.user_reg_no === state.currentUser.reg_no
  );

  return (
    <div>
      <h1>Scan QR</h1>
      <p style={{ margin: '4px 0 16px 0' }}>Scan the QR sticker at your seat or enter the seat code manually.</p>

      {error && (
        <div style={{ color: '#dc2626', marginBottom: '12px' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ color: '#16a34a', marginBottom: '12px' }}>
          {success}
        </div>
      )}

      {/* Camera scanner */}
      <div style={{ border: '1px solid #000000', padding: '16px', maxWidth: '420px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <strong>Camera scanner</strong>
          <button onClick={() => setCameraActive(!cameraActive)}>
            {cameraActive ? 'Stop camera' : 'Start camera'}
          </button>
        </div>

        {cameraActive ? (
          <div id="qr-reader" style={{ width: '100%' }}></div>
        ) : (
          <div style={{ border: '1px solid #999', padding: '24px', textAlign: 'center', background: '#f9f9f9', fontSize: '14px' }}>
            Camera is inactive. Click &quot;Start camera&quot; or enter the seat code below.
          </div>
        )}
      </div>

      {/* Manual input */}
      <div style={{ border: '1px solid #000000', padding: '16px', maxWidth: '420px' }}>
        <strong>Manual seat code entry</strong>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCheckInWithCode(manualCode);
          }}
          style={{ display: 'flex', gap: '8px', marginTop: '8px' }}
        >
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.toUpperCase())}
            placeholder="e.g. LPU-F1-001"
            style={{ flex: 1 }}
          />
          <button type="submit" className="primary">
            Verify
          </button>
        </form>

        {currentSeat && (
          <div style={{ marginTop: '12px', fontSize: '14px', borderTop: '1px solid #ccc', paddingTop: '8px' }}>
            <span>Your booked seat code is: <strong>{currentSeat.code}</strong>. </span>
            <button
              type="button"
              onClick={() => handleCheckInWithCode(currentSeat.code)}
              style={{ padding: '2px 6px', fontSize: '12px' }}
            >
              Auto-fill &amp; check in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
