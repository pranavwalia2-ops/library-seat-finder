'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadStoredState, saveState } from '@/lib/store';
import { setRegistrationNumber } from '@/lib/user';

export default function LoginPage() {
  const router = useRouter();
  const [regNo, setRegNo] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (val: string) => {
    const clean = val.trim();
    if (!/^\d{8}$/.test(clean)) {
      setError('Registration number must be an 8-digit university ID (e.g. 12200001).');
      return;
    }

    setIsSubmitting(true);
    setRegistrationNumber(clean);

    try {
      const state = loadStoredState();
      state.currentUser = {
        id: `u-${clean}`,
        reg_no: clean,
        name: clean === '12200000' ? 'Chief Librarian (Admin)' : `Student ${clean}`,
        role: clean === '12200000' ? 'admin' : 'student',
      };
      saveState(state);
    } catch {}

    // Navigate straight to dashboard
    router.push('/map');
  };

  return (
    <div style={{ maxWidth: '520px', margin: '30px auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.7)',
            padding: '5px 14px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.85)',
            fontSize: '12px',
            fontWeight: 600,
            color: '#2563eb',
            marginBottom: '12px',
          }}
        >
          University Student Portal
        </div>
        <h1 style={{ fontSize: '26px', margin: '0 0 6px 0', color: '#0f172a' }}>
          Sign In to SeatSync
        </h1>
        <p style={{ color: '#475569', fontSize: '14px', margin: 0 }}>
          Enter your 8-digit registration number to book seats and track study sessions.
        </p>
      </div>

      {/* Login Card */}
      <div className="panel" style={{ padding: 0 }}>
        <div className="panel-header">
          <span>Student Authentication</span>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
            LPU Library ID
          </span>
        </div>

        <div className="panel-body">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin(regNo);
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: '#475569',
                  marginBottom: '6px',
                  letterSpacing: '0.04em',
                }}
              >
                8-Digit Registration Number
              </label>
              <input
                type="text"
                maxLength={8}
                value={regNo}
                onChange={(e) => {
                  setRegNo(e.target.value.replace(/\D/g, '').slice(0, 8));
                  setError('');
                }}
                placeholder="e.g. 12200001"
                style={{
                  width: '100%',
                  fontSize: '16px',
                  letterSpacing: '0.05em',
                  fontWeight: 600,
                }}
                autoFocus
              />
              <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Use digits only (e.g., 12200001 to 12200050)
              </span>
            </div>

            {error && (
              <div
                style={{
                  color: '#991b1b',
                  background: '#fef2f2',
                  border: '1px solid #fecdd3',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  marginBottom: '16px',
                  fontWeight: 500,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="primary"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '15px',
                fontWeight: 600,
                borderRadius: '10px',
              }}
            >
              {isSubmitting ? 'Entering Dashboard...' : 'Log in & Open Dashboard →'}
            </button>
          </form>

          {/* Quick Select Personas */}
          <div
            style={{
              marginTop: '22px',
              borderTop: '1px solid rgba(226, 232, 240, 0.8)',
              paddingTop: '16px',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#475569',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '10px',
                letterSpacing: '0.04em',
              }}
            >
              Quick Persona Switch:
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleLogin('12200001')}
                className="secondary-glass"
                style={{ fontSize: '13px', padding: '8px 10px' }}
              >
                👨‍🎓 12200001 (Student)
              </button>

              <button
                type="button"
                onClick={() => handleLogin('12200002')}
                className="secondary-glass"
                style={{ fontSize: '13px', padding: '8px 10px' }}
              >
                👩‍🎓 12200002 (Student)
              </button>

              <button
                type="button"
                onClick={() => handleLogin('12200003')}
                className="secondary-glass"
                style={{ fontSize: '13px', padding: '8px 10px' }}
              >
                🧑‍💻 12200003 (Student)
              </button>

              <button
                type="button"
                onClick={() => handleLogin('12200000')}
                className="secondary-glass"
                style={{ fontSize: '13px', padding: '8px 10px', color: '#7c3aed' }}
              >
                🛡️ 12200000 (Admin)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Helper Navigation Links */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '13px',
          padding: '0 4px',
        }}
      >
        <Link href="/" style={{ color: '#475569', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          ← Back to Landing Page
        </Link>

        <Link href="/map" style={{ color: '#2563eb', fontWeight: 600 }}>
          Skip to Map as Guest →
        </Link>
      </div>
    </div>
  );
}
