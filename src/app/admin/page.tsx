'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { loadStoredState, saveState, AppState } from '@/lib/store';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BarChart3, Printer, ShieldAlert, Flame } from 'lucide-react';
import QRCode from 'qrcode';

export default function AdminPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [qrSheetOpen, setQrSheetOpen] = useState(false);
  const [qrDataUrls, setQrDataUrls] = useState<{ [code: string]: string }>({});

  useEffect(() => {
    const current = loadStoredState();
    setState(current);
  }, []);

  const handleGeneratePrintableQRs = async () => {
    if (!state) return;
    const urls: { [code: string]: string } = {};
    for (const seat of state.seats.slice(0, 40)) {
      urls[seat.code] = await QRCode.toDataURL(seat.code, { margin: 1, width: 120 });
    }
    setQrDataUrls(urls);
    setQrSheetOpen(true);
  };

  if (!state) return null;

  const isAdmin = state.currentUser.role === 'admin';

  const makeAdmin = () => {
    const current = loadStoredState();
    current.currentUser = {
      id: 'u-12200000',
      reg_no: '12200000',
      name: 'Chief Librarian Admin',
      role: 'admin',
    };
    saveState(current);
    setState(current);
  };

  const floorStats = state.floors.map((fl) => {
    const floorSeats = state.seats.filter((s) => s.floor_id === fl.id);
    const occupied = floorSeats.filter((s) => s.status === 'checked_in').length;
    const onBreak = floorSeats.filter((s) => s.status === 'on_break').length;
    const booked = floorSeats.filter((s) => s.status === 'booked').length;
    const free = floorSeats.length - (occupied + onBreak + booked);
    const occupancyRate = Math.round(((occupied + onBreak + booked) / floorSeats.length) * 100);

    return {
      floor: fl.name,
      level: fl.level,
      total: floorSeats.length,
      occupied,
      onBreak,
      booked,
      free,
      occupancyRate,
    };
  });

  return (
    <div className="space-y-6 pt-2">
      {/* Header & Role Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Admin & Anti-Hogging Analytics</h2>
          </div>
          <p className="text-xs text-slate-500">
            Real-time library occupancy, peak footfall patterns, and desk abuse intelligence
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {!isAdmin ? (
            <button
              onClick={makeAdmin}
              className="text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Switch to Admin Mode</span>
            </button>
          ) : (
            <button
              onClick={handleGeneratePrintableQRs}
              className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-blue-500/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print QR Stickers (PDF)</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Occupancy per Floor */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {floorStats.map((fs) => (
          <div key={fs.level} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Floor {fs.level}</span>
              <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                {fs.occupancyRate}% Full
              </span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
              <div style={{ width: `${(fs.occupied / fs.total) * 100}%` }} className="bg-rose-500"></div>
              <div style={{ width: `${(fs.onBreak / fs.total) * 100}%` }} className="bg-amber-500"></div>
              <div style={{ width: `${(fs.booked / fs.total) * 100}%` }} className="bg-purple-600"></div>
            </div>

            <div className="grid grid-cols-3 text-center text-[10px] text-slate-500 pt-1 font-medium">
              <div>
                <span className="text-rose-600 font-bold block text-sm">{fs.occupied}</span>
                <span>Active</span>
              </div>
              <div>
                <span className="text-amber-600 font-bold block text-sm">{fs.onBreak}</span>
                <span>Break</span>
              </div>
              <div>
                <span className="text-emerald-600 font-bold block text-sm">{fs.free}</span>
                <span>Free</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Peak Hours Chart */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Peak Hours Library Footfall</h3>
            <p className="text-xs text-slate-500">Total seat bookings by hour across all 3 floors</p>
          </div>
          <span className="text-xs font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-lg">
            Peak: 15:00 (118 bookings)
          </span>
        </div>

        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={state.peakHours} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '1rem', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
              />
              <Bar dataKey="bookings" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 10 Hogged Seats Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Top 10 &ldquo;Hogged&rdquo; Desks</h3>
              <p className="text-xs text-slate-500">
                Formula: Ratio of (break time + unconfirmed booking time) to total held time, plus frequent auto-release timeouts
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100">
                <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Seat</th>
                <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Floor</th>
                <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Timeout Releases</th>
                <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Idle/Break Ratio</th>
                <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Total Held Time</th>
                <th className="pb-3 font-bold uppercase tracking-wider text-[10px] text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {state.hoggedMetrics.map((hm, idx) => (
                <tr key={hm.seat_code} className="hover:bg-slate-50 transition">
                  <td className="py-3 font-black text-slate-900 flex items-center gap-1.5">
                    <span className="text-slate-400 font-normal">#{idx + 1}</span>
                    <span>{hm.seat_label}</span>
                  </td>
                  <td className="py-3 text-slate-600 font-sans">{hm.floor_name}</td>
                  <td className="py-3 text-rose-600 font-bold">{hm.timeout_count} times</td>
                  <td className="py-3">
                    <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {hm.break_ratio}%
                    </span>
                  </td>
                  <td className="py-3 text-slate-600">{hm.total_held_minutes} mins</td>
                  <td className="py-3 text-right font-sans">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-200">
                      High Hog Risk
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable QR Sheet Modal */}
      {qrSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-extrabold text-lg">SeatSync QR Sticker Sheet (Floor 1 Sample)</h4>
                <p className="text-xs text-slate-500">Print and paste onto corresponding study desks</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm"
                >
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setQrSheetOpen(false)}
                  className="text-slate-400 hover:text-slate-800 text-sm px-2 py-1"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 p-2">
              {Object.entries(qrDataUrls).map(([code, dataUrl]) => (
                <div key={code} className="border border-slate-200 rounded-2xl p-3 text-center flex flex-col items-center bg-slate-50">
                  <img src={dataUrl} alt={code} className="w-20 h-20" />
                  <span className="text-[11px] font-mono font-black mt-1 text-slate-900">{code}</span>
                  <span className="text-[9px] text-slate-500 font-medium">Scan via phone</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
