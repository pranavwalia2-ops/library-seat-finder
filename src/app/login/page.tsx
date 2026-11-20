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
    <div className="max-w-md mx-auto pt-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
          <GraduationCap className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">University Portal Login</h2>
        <p className="text-xs text-slate-500">
          Enter your 8-digit university registration number to access SeatSync
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
              Full Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          {error && (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3 font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-md shadow-blue-500/20"
          >
            <span>Proceed to Floor Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-slate-400 font-bold tracking-wider">Demo Quick Switch</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleLogin('12200001', 'student', 'Demo Student 01')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50/60 hover:bg-blue-50 border border-blue-200 text-left transition"
          >
            <User className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-900">Student 12200001</div>
              <div className="text-[10px] text-blue-600 font-medium">Regular Student</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleLogin('12200000', 'admin', 'Chief Librarian Admin')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-50/60 hover:bg-purple-50 border border-purple-200 text-left transition"
          >
            <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-900">Admin 12200000</div>
              <div className="text-[10px] text-purple-600 font-medium">Librarian Role</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
