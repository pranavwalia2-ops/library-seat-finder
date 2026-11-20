'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStoredState, saveState } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const [regNo, setRegNo] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (val: string) => {
    const clean = val.trim();
    if (!/^\d{8}$/.test(clean)) {
      setError('Registration number must be 8 digits (e.g. 12200001).');
      return;
    }

    const state = loadStoredState();
    state.currentUser = {
      id: `u-${clean}`,
      reg_no: clean,
      name: `Student ${clean}`,
      role: clean === '12200000' ? 'admin' : 'student',
    };
    saveState(state);
    router.push('/map');
  };

  return (
    <div>
      <h1>Registration</h1>
      <p style={{ color: '#6b7280', margin: '0 0 16px 0', fontSize: '14px' }}>
        Save your student registration number for this session.
      </p>

      <div className="panel" style={{ maxWidth: '400px' }}>
        <div className="panel-header">Enter registration number</div>
        <div className="panel-body">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin(regNo);
            }}
          >
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>
                8-Digit Registration Number:
              </label>
              <input
                type="text"
                maxLength={8}
                value={regNo}
                onChange={(e) => {
                  setRegNo(e.target.value);
                  setError('');
                }}
                placeholder="12200001"
                style={{ width: '100%' }}
              />
            </div>

            {error && (
              <div style={{ color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>
                {error}
              </div>
            )}

            <button type="submit" className="primary" style={{ width: '100%' }}>
              Save and continue
            </button>
          </form>

          <div style={{ marginTop: '16px', borderTop: '1px solid #d1d5db', paddingTop: '12px' }}>
            <span style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '6px' }}>
              Quick select:
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleLogin('12200001')}
                style={{ flex: 1, fontSize: '12px' }}
              >
                12200001 (Student)
              </button>
              <button
                type="button"
                onClick={() => handleLogin('12200000')}
                style={{ flex: 1, fontSize: '12px' }}
              >
                12200000 (Admin)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
