'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStoredState, saveState } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const [regNo, setRegNo] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (selectedRegNo: string, selectedRole: 'student' | 'admin', selectedName: string) => {
    const cleanReg = selectedRegNo.trim();
    if (!/^\d{8}$/.test(cleanReg)) {
      setError('Registration number must be 8 digits.');
      return;
    }

    const state = loadStoredState();
    state.currentUser = {
      id: `u-${cleanReg}`,
      reg_no: cleanReg,
      name: selectedName || (selectedRole === 'admin' ? 'Admin' : `Student ${cleanReg}`),
      role: selectedRole,
    };
    saveState(state);
    router.push('/map');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(regNo, regNo === '12200000' ? 'admin' : 'student', name);
  };

  return (
    <div>
      <h1>Login</h1>
      <p style={{ margin: '8px 0 16px 0' }}>Enter your 8-digit university registration number.</p>

      <form onSubmit={handleSubmit} style={{ maxWidth: '360px' }}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Registration number:</label>
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

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>Name (optional):</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Rahul Sharma"
            style={{ width: '100%' }}
          />
        </div>

        {error && (
          <div style={{ color: '#dc2626', marginBottom: '12px' }}>
            {error}
          </div>
        )}

        <button type="submit" className="primary" style={{ width: '100%', marginBottom: '16px' }}>
          Login
        </button>
      </form>

      <div style={{ borderTop: '1px solid #999', paddingTop: '12px', maxWidth: '360px' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Quick demo accounts:</p>
        <button
          type="button"
          onClick={() => handleLogin('12200001', 'student', 'Student 12200001')}
          style={{ marginRight: '8px', marginBottom: '8px' }}
        >
          Student (12200001)
        </button>
        <button
          type="button"
          onClick={() => handleLogin('12200000', 'admin', 'Admin')}
        >
          Admin (12200000)
        </button>
      </div>
    </div>
  );
}
