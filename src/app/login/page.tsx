'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStoredState, saveState } from '@/lib/store';
import { GraduationCap, ArrowRight, CheckCircle2, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [regNo, setRegNo] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (selectedRegNo: string, selectedRole: 'student' | 'admin', selectedName: string) => {
    // 8-digit validation
    const cleanReg = selectedRegNo.trim();
    if (!/^\d{8}$/.test(cleanReg)) {
      setError('Registration number must be exactly 8 digits (e.g. 12200001).');
      return;
    }

    const state = loadStoredState();
    state.currentUser = {
      id: `u-${cleanReg}`,
      reg_no: cleanReg,
      name: selectedName || (selectedRole === 'admin' ? 'Chief Librarian Admin' : `Student ${cleanReg}`),
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
    <div className="max-w-md mx-auto pt-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">University Login</h2>
        <p className="text-xs text-slate-400">
          Enter your 8-digit university registration number to access SeatSync
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
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
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Full Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {error && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-600/30"
          >
            <span>Continue to Floor Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-2 text-slate-500 font-semibold">Demo Quick Switch</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleLogin('12200001', 'student', 'Demo Student 01')}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition"
          >
            <User className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-slate-200">Student 12200001</div>
              <div className="text-[10px] text-slate-400">Regular student</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleLogin('12200000', 'admin', 'Chief Librarian Admin')}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-slate-200">Admin 12200000</div>
              <div className="text-[10px] text-slate-400">Librarian role</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
