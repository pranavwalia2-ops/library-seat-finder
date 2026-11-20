'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { loadStoredState, AppState } from '@/lib/store';

export default function HomePage() {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    setState(loadStoredState());
  }, []);

  const totalSeats = state?.seats.length || 120;
  const occupiedSeats = state?.seats.filter(s => s.status === 'checked_in').length || 0;
  const breakSeats = state?.seats.filter(s => s.status === 'on_break').length || 0;
  const bookedSeats = state?.seats.filter(s => s.status === 'booked').length || 0;
  const freeSeats = totalSeats - (occupiedSeats + breakSeats + bookedSeats);

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">SeatSync Library Booking</h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time seat reservation, break timers, and anti-hogging seat release.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/map"
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition"
            >
              Open Floor Map &rarr;
            </Link>
            <Link
              href="/my-seat"
              className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-medium text-sm transition"
            >
              My Seat
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Colored Stat Boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Available Free</div>
          <div className="text-3xl font-bold text-emerald-700 mt-1">{freeSeats}</div>
          <div className="text-xs text-emerald-600 mt-0.5">Ready for booking</div>
        </div>

        <div className="bg-rose-50/80 border border-rose-200 rounded-lg p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-rose-700">Occupied</div>
          <div className="text-3xl font-bold text-rose-700 mt-1">{occupiedSeats}</div>
          <div className="text-xs text-rose-600 mt-0.5">Checked-in students</div>
        </div>

        <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-700">On Break</div>
          <div className="text-3xl font-bold text-amber-700 mt-1">{breakSeats}</div>
          <div className="text-xs text-amber-600 mt-0.5">20-minute countdown</div>
        </div>

        <div className="bg-blue-50/80 border border-blue-200 rounded-lg p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">Awaiting Check-in</div>
          <div className="text-3xl font-bold text-blue-700 mt-1">{bookedSeats}</div>
          <div className="text-xs text-blue-600 mt-0.5">15-minute hold</div>
        </div>
      </div>

      {/* Floor Breakdown Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Library Floors Status</h2>
          <span className="text-xs text-slate-500">Total 3 Floors • 120 Desks</span>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>Floor Name</th>
              <th>Total Desks</th>
              <th>Occupied</th>
              <th>On Break</th>
              <th>Free Available</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {state?.floors.map((fl) => {
              const floorSeats = state.seats.filter(s => s.floor_id === fl.id);
              const occ = floorSeats.filter(s => s.status === 'checked_in').length;
              const brk = floorSeats.filter(s => s.status === 'on_break').length;
              const fr = floorSeats.filter(s => s.status === 'free').length;

              return (
                <tr key={fl.id} className="hover:bg-slate-50/80">
                  <td className="font-medium text-slate-900">Floor {fl.level} - {fl.name}</td>
                  <td className="text-slate-600">{floorSeats.length}</td>
                  <td><span className="text-rose-600 font-semibold">{occ}</span></td>
                  <td><span className="text-amber-600 font-semibold">{brk}</span></td>
                  <td><span className="text-emerald-600 font-bold">{fr}</span></td>
                  <td>
                    <Link href="/map" className="text-blue-600 hover:text-blue-800 font-medium text-xs">
                      View map &rarr;
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
