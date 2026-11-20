'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { loadStoredState, saveState, AppState } from '@/lib/store';
import { HoggedSeatMetric, PeakHourMetric } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BarChart3, AlertOctagon, Printer, ShieldAlert, Sparkles, UserCheck, Flame } from 'lucide-react';
import QRCode from 'qrcode';

export default function AdminPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [qrSheetOpen, setQrSheetOpen] = useState(false);
  const [qrDataUrls, setQrDataUrls] = useState<{ [code: string]: string }>({});

  useEffect(() => {
    const current = loadStoredState();
    setState(current);
  }, []);

  // Generate QR codes for printing
  const handleGeneratePrintableQRs = async () => {
    if (!state) return;
    const urls: { [code: string]: string } = {};
    for (const seat of state.seats.slice(0, 40)) { // 40 for Floor 1 sample print
      urls[seat.code] = await QRCode.toDataURL(seat.code, { margin: 1, width: 120 });
    }
    setQrDataUrls(urls);
    setQrSheetOpen(true);
  };

  if (!state) return null;

  const isAdmin = state.currentUser.role === 'admin';

  // Quick switch to admin role for hackathon judges
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

  // Occupancy per floor
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Admin & Anti-Hogging Analytics</h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time library occupancy, peak traffic patterns, and seat abuse detection
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {!isAdmin ? (
            <button
              onClick={makeAdmin}
              className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Switch to Admin Mode</span>
            </button>
          ) : (
            <button
              onClick={handleGeneratePrintableQRs}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print QR Stickers (PDF)</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Occupancy per Floor */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {floorStats.map((fs) => (
          <div key={fs.level} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Floor {fs.level}</span>
              <span className="text-xs font-mono font-bold text-indigo-400">{fs.occupancyRate}% Full</span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
              <div style={{ width: `${(fs.occupied / fs.total) * 100}%` }} className="bg-rose-500"></div>
              <div style={{ width: `${(fs.onBreak / fs.total) * 100}%` }} className="bg-amber-500"></div>
              <div style={{ width: `${(fs.booked / fs.total) * 100}%` }} className="bg-indigo-500"></div>
            </div>

            <div className="grid grid-cols-3 text-center text-[10px] text-slate-400 pt-1">
              <div>
                <span className="text-rose-400 font-bold block">{fs.occupied}</span>
                <span>Active</span>
              </div>
              <div>
                <span className="text-amber-400 font-bold block">{fs.onBreak}</span>
                <span>Break</span>
              </div>
              <div>
                <span className="text-emerald-400 font-bold block">{fs.free}</span>
                <span>Free</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Peak Hours Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-sm">Peak Hours Library Footfall</h3>
            <p className="text-xs text-slate-400">Total seat bookings by hour across library floors</p>
          </div>
          <span className="text-[11px] font-mono bg-slate-800 text-indigo-300 px-2.5 py-1 rounded-md">
            Peak: 15:00 (118 bookings)
          </span>
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={state.peakHours} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                itemStyle={{ color: '#818cf8' }}
              />
              <Bar dataKey="bookings" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 10 Hogged Seats Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-400" />
            <div>
              <h3 className="font-bold text-white text-sm">Top 10 &ldquo;Hogged&rdquo; Desks</h3>
              <p className="text-xs text-slate-400">
                Formula: Ratio of (break time + unconfirmed booking time) to total held time, plus frequent auto-release timeouts
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="pb-2 font-semibold">Seat</th>
                <th className="pb-2 font-semibold">Floor</th>
                <th className="pb-2 font-semibold">Timeout Releases</th>
                <th className="pb-2 font-semibold">Idle/Break Ratio</th>
                <th className="pb-2 font-semibold">Total Held Time</th>
                <th className="pb-2 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {state.hoggedMetrics.map((hm, idx) => (
                <tr key={hm.seat_code} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 font-bold text-white flex items-center gap-1.5">
                    <span className="text-slate-500 font-normal">#{idx + 1}</span>
                    <span>{hm.seat_label}</span>
                  </td>
                  <td className="py-2.5 text-slate-300 font-sans">{hm.floor_name}</td>
                  <td className="py-2.5 text-rose-400 font-bold">{hm.timeout_count} times</td>
                  <td className="py-2.5">
                    <span className="text-amber-400 font-bold">{hm.break_ratio}%</span>
                  </td>
                  <td className="py-2.5 text-slate-300">{hm.total_held_minutes} mins</td>
                  <td className="py-2.5 text-right font-sans">
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-semibold border border-rose-500/20">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-bold text-lg">SeatSync QR Sticker Sheet (Floor 1 Sample)</h4>
                <p className="text-xs text-slate-500">Print and paste onto corresponding study tables</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs"
                >
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setQrSheetOpen(false)}
                  className="text-slate-500 hover:text-slate-900 text-sm px-2 py-1"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 p-2">
              {Object.entries(qrDataUrls).map(([code, dataUrl]) => (
                <div key={code} className="border border-slate-300 rounded-xl p-2 text-center flex flex-col items-center">
                  <img src={dataUrl} alt={code} className="w-20 h-20" />
                  <span className="text-[10px] font-mono font-bold mt-1">{code}</span>
                  <span className="text-[9px] text-slate-500">Scan via phone</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
