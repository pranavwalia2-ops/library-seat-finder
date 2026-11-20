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
      setError(`Code mismatch. Booked ${targetSeat.label} (${targetSeat.code}), scanned ${cleanCode}.`);
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
    <div className="max-w-md mx-auto space-y-5 pt-2">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Desk QR Check-in</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Scan the QR sticker on the desk or enter the seat code manually.
        </p>
      </div>

      {error && (
        <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3">
          {error}
        </div>
      )}

      {success && (
        <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          {success}
        </div>
      )}

      {/* Camera scanner card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Camera Scanner</span>
          <button
            onClick={() => setCameraActive(!cameraActive)}
            className="text-xs px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
          >
            {cameraActive ? 'Stop camera' : 'Start camera'}
          </button>
        </div>

        {cameraActive ? (
          <div className="overflow-hidden rounded border border-slate-300 bg-black min-h-[240px]">
            <div id="qr-reader" className="w-full text-white text-xs"></div>
          </div>
        ) : (
          <div className="border border-dashed border-slate-200 rounded p-8 text-center text-xs text-slate-500 bg-slate-50">
            Click &ldquo;Start camera&rdquo; to use your webcam or phone camera to scan desk QR sticker.
          </div>
        )}
      </div>

      {/* Manual Code Fallback */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">Manual Seat Code</span>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCheckInWithCode(manualCode);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.toUpperCase())}
            placeholder="e.g. LPU-F1-002"
            className="flex-1 border border-slate-300 rounded px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded text-xs transition"
          >
            Verify
          </button>
        </form>

        {currentSeat && (
          <div className="bg-blue-50 rounded p-3 text-xs flex items-center justify-between border border-blue-200">
            <div>
              <span className="text-slate-600">Your booked code:</span>
              <span className="ml-1.5 font-mono text-blue-700 font-bold">{currentSeat.code}</span>
            </div>
            <button
              type="button"
              onClick={() => handleCheckInWithCode(currentSeat.code)}
              className="text-xs font-semibold text-blue-700 hover:underline"
            >
              Auto-fill &amp; check in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
