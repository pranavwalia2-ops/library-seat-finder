'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { checkInAction, loadStoredState, Seat, AppState } from '@/lib/store';
import { getRegistrationNumber } from '@/lib/user';

export default function ScanPage() {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [mySeat, setMySeat] = useState<Seat | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    try {
      const reg = getRegistrationNumber();
      const state: AppState = loadStoredState();
      const found = state.seats.find(
        (s) => s.active_booking && (s.active_booking.user_reg_no === reg || s.active_booking.user_id === `u-${reg}`)
      );
      setMySeat(found || null);
    } catch {}
  }, []);

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  };

  const handleScanCode = (targetCode: string) => {
    const reg = getRegistrationNumber();
    const res = checkInAction(targetCode, reg);
    if (res.success) {
      playBeep();
      setMessage({ text: res.message, type: 'success' });
      setCode('');
    } else {
      setMessage({ text: res.message, type: 'error' });
    }
  };

  const toggleWebcam = async () => {
    if (cameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      } catch {
        alert('Webcam access unavailable. Running in simulated scanner mode.');
      }
    }
  };

  return (
    <div>
      {/* 1. Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1>Scan QR code</h1>
        <p style={{ color: '#475569', margin: '2px 0 0 0', fontSize: '14px' }}>
          Point your device camera at the desk QR code or type the desk code to complete check-in.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Scanner Panel */}
        <div className="panel" style={{ maxWidth: '540px' }}>
          <div className="panel-header">
            <span>Camera check-in</span>
            <button
              type="button"
              onClick={toggleWebcam}
              className="secondary-glass"
              style={{ fontSize: '12px', padding: '4px 10px' }}
            >
              {cameraActive ? 'Turn off camera' : 'Enable webcam'}
            </button>
          </div>

          <div className="panel-body">
            {/* Viewfinder */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '4 / 3',
                borderRadius: '10px',
                overflow: 'hidden',
                background: '#090d16',
                border: '1px solid #1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <video
                ref={videoRef}
                style={{
                  display: cameraActive ? 'block' : 'none',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />

              {isScanning && <div className="laser-scanner-line"></div>}

              {/* Viewfinder reticle */}
              <div
                style={{
                  position: 'absolute',
                  width: '180px',
                  height: '180px',
                  border: '1px dashed rgba(34, 197, 94, 0.6)',
                  borderRadius: '12px',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ position: 'absolute', top: -2, left: -2, width: 16, height: 16, borderTop: '2px solid #22c55e', borderLeft: '2px solid #22c55e' }}></div>
                <div style={{ position: 'absolute', top: -2, right: -2, width: 16, height: 16, borderTop: '2px solid #22c55e', borderRight: '2px solid #22c55e' }}></div>
                <div style={{ position: 'absolute', bottom: -2, left: -2, width: 16, height: 16, borderBottom: '2px solid #22c55e', borderLeft: '2px solid #22c55e' }}></div>
                <div style={{ position: 'absolute', bottom: -2, right: -2, width: 16, height: 16, borderBottom: '2px solid #22c55e', borderRight: '2px solid #22c55e' }}></div>

                {!cameraActive && (
                  <div style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>
                    Align QR code in center
                  </div>
                )}
              </div>

              <div style={{ position: 'absolute', top: 12, left: 16, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
                <span style={{ fontSize: '11px', color: '#ffffff', fontWeight: 600, textTransform: 'uppercase' }}>
                  {cameraActive ? 'Live Camera' : 'Optical Viewfinder'}
                </span>
              </div>
            </div>

            {/* Manual Code Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (code.trim()) handleScanCode(code.trim());
              }}
              style={{ display: 'flex', gap: '8px' }}
            >
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. LPU-F1-001 or F1-001"
                style={{ flex: 1, fontWeight: 600 }}
              />
              <button type="submit" className="primary" style={{ padding: '0 16px', height: '36px' }}>
                Check in
              </button>
            </form>

            {message && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 500,
                  background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecdd3'}`,
                  color: message.type === 'success' ? '#166534' : '#991b1b',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{message.text}</span>
                {message.type === 'success' && (
                  <Link href="/my-seat" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'underline' }}>
                    View My seat
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Demo Fast-Action Panel */}
        <div className="panel">
          <div className="panel-header">
            <span>Demo check-in triggers</span>
            <span style={{ fontSize: '11px', color: '#475569' }}>Simulate physical scan</span>
          </div>

          <div className="panel-body">
            <p style={{ fontSize: '13px', color: '#475569', marginTop: 0, marginBottom: '16px' }}>
              Select a quick trigger to simulate scanning the desk QR code:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {mySeat ? (
                <button
                  type="button"
                  className="primary"
                  onClick={() => handleScanCode(mySeat.code)}
                  style={{ padding: '12px 14px', justifyContent: 'flex-start', textAlign: 'left' }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>Scan reserved seat ({mySeat.code})</div>
                    <div style={{ fontSize: '12px', opacity: 0.85 }}>Confirm check-in for your current booking</div>
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  className="primary"
                  onClick={() => handleScanCode('LPU-F1-001')}
                  style={{ padding: '12px 14px', justifyContent: 'flex-start', textAlign: 'left' }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>Walk-in scan: Desk F1-001</div>
                    <div style={{ fontSize: '12px', opacity: 0.85 }}>Claim and check in to free Ground Floor desk</div>
                  </div>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleScanCode('LPU-F2-010')}
                className="secondary-glass"
                style={{ padding: '12px 14px', justifyContent: 'flex-start', textAlign: 'left' }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>Scan Floor 2 desk (LPU-F2-010)</div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>Test check-in on collaborative commons</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleScanCode('LPU-F3-015')}
                className="secondary-glass"
                style={{ padding: '12px 14px', justifyContent: 'flex-start', textAlign: 'left' }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>Scan Floor 3 desk (LPU-F3-015)</div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>Test check-in on silent research wing</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
