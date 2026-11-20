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
      setError('Registration number must be 8 digits (e.g. 12200001).');
      return;
    }

    const state = loadStoredState();
    state.currentUser = {
      id: `u-${cleanReg}`,
      reg_no: cleanReg,
      name: selectedName || (selectedRole === 'admin' ? 'Library Admin' : `Student ${cleanReg}`),
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
    <div className="max-w-md mx-auto pt-6 space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Student &amp; Staff Login</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Enter your 8-digit university registration number to access SeatSync.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Registration Number (8 Digits)
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
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rahul Sharma"
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          {error && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded p-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded text-sm transition"
          >
            Sign in &rarr;
          </button>
        </form>

        <div className="border-t border-slate-200 pt-3">
          <p className="text-xs text-slate-500 mb-2 font-medium">Quick demo logins:</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleLogin('12200001', 'student', 'Student 12200001')}
              className="flex-1 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 border border-slate-200 text-slate-700 text-xs py-1.5 px-2 rounded transition"
            >
              Student (12200001)
            </button>
            <button
              type="button"
              onClick={() => handleLogin('12200000', 'admin', 'Library Admin')}
              className="flex-1 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 border border-slate-200 text-slate-700 text-xs py-1.5 px-2 rounded transition"
            >
              Admin (12200000)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
