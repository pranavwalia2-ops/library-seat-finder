'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { loadStoredState, saveState } from '@/lib/store';
import { QrCode, CheckCircle2, AlertCircle, ArrowRight, Camera, Keyboard } from 'lucide-react';

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
      setError(`No active booking found for student ${userRegNo}. Please reserve a seat from the map first.`);
      return;
    }

    const targetSeat = state.seats[userSeatIndex];

    if (targetSeat.code !== cleanCode) {
      setError(`QR Code mismatch! You booked seat ${targetSeat.label} (${targetSeat.code}), but scanned ${cleanCode}.`);
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
    setSuccess(`Successfully verified! Checked into desk ${targetSeat.label}.`);
    setTimeout(() => {
      router.push('/my-seat');
    }, 1500);
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
    <div className="max-w-md mx-auto space-y-6 pt-2">
      <div className="text-center space-y-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Desk QR Verification</h2>
        <p className="text-xs text-slate-500">
          Scan the QR sticker on your library desk or enter the seat code manually
        </p>
      </div>

      {error && (
        <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-start gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Camera Scanner View */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Camera className="w-4 h-4 text-blue-600" />
            <span>Camera Scanner</span>
          </div>
          <button
            onClick={() => setCameraActive(!cameraActive)}
            className="text-xs px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm"
          >
            {cameraActive ? 'Stop Camera' : 'Start Camera'}
          </button>
        </div>

        {cameraActive ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black min-h-[260px] flex items-center justify-center">
            <div id="qr-reader" className="w-full text-white text-xs"></div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-500 bg-slate-50">
            Click &ldquo;Start Camera&rdquo; to use your phone or laptop camera to scan the desk QR sticker.
          </div>
        )}

        {/* Manual Fallback Input */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Keyboard className="w-4 h-4 text-purple-600" />
            <span>Manual Seat Code Fallback</span>
          </div>

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
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-sm shrink-0"
            >
              Verify
            </button>
          </form>

          {currentSeat && (
            <div className="bg-blue-50/70 rounded-2xl p-3.5 border border-blue-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-600">Your Reserved Code:</span>
                <span className="ml-2 font-mono text-blue-700 font-bold">{currentSeat.code}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCheckInWithCode(currentSeat.code)}
                className="text-xs font-bold text-purple-700 hover:text-purple-900 underline"
              >
                Auto-Fill & Check In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
