'use client';

import { useState, useEffect } from 'react';
import { loadStoredState, saveState, AppState } from '@/lib/store';
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
      name: 'Admin',
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
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Admin &amp; Anti-Hogging Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time library occupancy, peak hours footfall, and seat hogging detection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isAdmin ? (
            <button
              onClick={makeAdmin}
              className="text-xs bg-amber-500 hover:bg-amber-600 text-white font-medium px-3.5 py-1.5 rounded transition"
            >
              Switch to Admin Role
            </button>
          ) : (
            <button
              onClick={handleGeneratePrintableQRs}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-3.5 py-1.5 rounded transition"
            >
              Print QR Codes (Floor 1)
            </button>
          )}
        </div>
      </div>

      {/* Floor Occupancy Progress Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {floorStats.map((fs) => (
          <div key={fs.level} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Floor {fs.level}</span>
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                {fs.occupancyRate}% Full
              </span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
              <div style={{ width: `${(fs.occupied / fs.total) * 100}%` }} className="bg-rose-500" title="Occupied"></div>
              <div style={{ width: `${(fs.onBreak / fs.total) * 100}%` }} className="bg-amber-500" title="On Break"></div>
              <div style={{ width: `${(fs.booked / fs.total) * 100}%` }} className="bg-blue-500" title="Booked"></div>
            </div>

            <div className="grid grid-cols-3 text-center text-[10px] text-slate-500 pt-0.5">
              <div><span className="text-rose-600 font-bold block">{fs.occupied}</span>Active</div>
              <div><span className="text-amber-600 font-bold block">{fs.onBreak}</span>Break</div>
              <div><span className="text-emerald-600 font-bold block">{fs.free}</span>Free</div>
            </div>
          </div>
        ))}
      </div>

      {/* Peak Hours Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Peak Hours Library Footfall</h2>
          <span className="text-xs text-blue-700 font-mono font-semibold">Peak: 15:00 (118 bookings)</span>
        </div>

        <table className="w-full text-xs">
          <thead>
            <tr>
              <th>Time</th>
              <th>Bookings Count</th>
              <th>Footfall Level</th>
            </tr>
          </thead>
          <tbody>
            {state.peakHours.map((ph) => {
              const pct = Math.round((ph.bookings / 120) * 100);
              return (
                <tr key={ph.hour} className="hover:bg-slate-50">
                  <td className="font-mono font-medium text-slate-800">{ph.hour}</td>
                  <td className="font-bold text-slate-900">{ph.bookings} students</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div style={{ width: `${pct}%` }} className="bg-blue-600 h-full"></div>
                      </div>
                      <span className="text-[10px] text-slate-500">{pct}% capacity</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Top 10 Hogged Seats Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
          <h2 className="text-sm font-bold text-slate-800">Top 10 Hogged Desks</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Formula: Desks with high ratio of break time to total held time, and frequent auto-release timeouts.
          </p>
        </div>

        <table className="w-full text-xs">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Desk</th>
              <th>Floor</th>
              <th>Timeout Releases</th>
              <th>Break / Idle Ratio</th>
              <th>Total Time Held</th>
              <th>Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {state.hoggedMetrics.map((hm, idx) => (
              <tr key={hm.seat_code} className="hover:bg-slate-50">
                <td className="font-mono text-slate-400">#{idx + 1}</td>
                <td className="font-bold font-mono text-slate-900">{hm.seat_label}</td>
                <td className="text-slate-600">{hm.floor_name}</td>
                <td className="font-bold text-rose-600">{hm.timeout_count} times</td>
                <td>
                  <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {hm.break_ratio}%
                  </span>
                </td>
                <td className="text-slate-700">{hm.total_held_minutes} mins</td>
                <td>
                  <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                    High Hog
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* QR print modal */}
      {qrSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-300 rounded-lg max-w-2xl w-full p-5 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-base">SeatSync QR Sticker Sheet (Floor 1)</h4>
                <p className="text-xs text-slate-500">Print and paste onto corresponding study desks</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded text-xs"
                >
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setQrSheetOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded text-xs border border-slate-200"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 p-1">
              {Object.entries(qrDataUrls).map(([code, dataUrl]) => (
                <div key={code} className="border border-slate-200 rounded p-2 text-center bg-slate-50">
                  <img src={dataUrl} alt={code} className="w-20 h-20 mx-auto" />
                  <div className="text-[10px] font-mono font-bold text-slate-800 mt-1">{code}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
