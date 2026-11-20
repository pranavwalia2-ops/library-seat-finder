'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { loadStoredState, saveState, AppState } from '@/lib/store';
import { Seat } from '@/lib/types';

export default function MapPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [selectedFloorId, setSelectedFloorId] = useState<string>('f1');
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [bookingError, setBookingError] = useState<string>('');
  const [bookingSuccess, setBookingSuccess] = useState<string>('');
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const refreshData = () => {
      const current = loadStoredState();
      let modified = false;
      const currentTimestamp = Date.now();
      setNow(currentTimestamp);

      current.seats = current.seats.map((seat) => {
        if (seat.active_booking && seat.active_booking.expires_at) {
          const expireTime = new Date(seat.active_booking.expires_at).getTime();
          if (expireTime < currentTimestamp) {
            modified = true;
            return {
              ...seat,
              status: 'free' as const,
              active_booking: null,
            };
          }
        }
        return seat;
      });

      if (modified) {
        saveState(current);
      }

      setState(current);
      setLastRefreshed(new Date().toLocaleTimeString());
    };

    refreshData();
    const timer = setInterval(refreshData, 3000);
    return () => clearInterval(timer);
  }, []);

  if (!state) return null;

  const currentFloor = state.floors.find((f) => f.id === selectedFloorId) || state.floors[0];
  const floorSeats = state.seats.filter((s) => s.floor_id === currentFloor.id);

  const userActiveSeat = state.seats.find(
    (s) => s.active_booking && s.active_booking.user_reg_no === state.currentUser.reg_no
  );

  const handleSeatClick = (seat: Seat) => {
    setBookingError('');
    setBookingSuccess('');
    setSelectedSeat(seat);
  };

  const handleConfirmBooking = () => {
    if (!selectedSeat) return;

    const current = loadStoredState();

    const alreadyHolding = current.seats.find(
      (s) => s.active_booking && s.active_booking.user_reg_no === current.currentUser.reg_no
    );
    if (alreadyHolding) {
      setBookingError(`You already hold seat ${alreadyHolding.label}. Only 1 active seat is allowed.`);
      return;
    }

    const targetSeatIndex = current.seats.findIndex((s) => s.id === selectedSeat.id);
    if (targetSeatIndex === -1 || current.seats[targetSeatIndex].status !== 'free') {
      setBookingError(`Seat ${selectedSeat.label} was just taken by another student. Please select another.`);
      setSelectedSeat(current.seats[targetSeatIndex]);
      return;
    }

    const newBooking = {
      id: `b-${Date.now()}`,
      seat_id: selectedSeat.id,
      user_id: current.currentUser.id,
      user_reg_no: current.currentUser.reg_no,
      user_name: current.currentUser.name,
      status: 'booked' as const,
      booked_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };

    current.seats[targetSeatIndex] = {
      ...current.seats[targetSeatIndex],
      status: 'booked',
      active_booking: newBooking,
    };

    saveState(current);
    setState(current);
    setBookingSuccess(`Seat ${selectedSeat.label} reserved. You have 15 minutes to scan QR at seat.`);
    setSelectedSeat(null);
  };

  const getRemainingTime = (expiresAtStr?: string | null) => {
    if (!expiresAtStr) return '';
    const diff = Math.max(0, Math.floor((new Date(expiresAtStr).getTime() - now) / 1000));
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-4">
      {/* Floor Selector Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase mr-1">Floor:</span>
          {state.floors.map((fl) => (
            <button
              key={fl.id}
              onClick={() => {
                setSelectedFloorId(fl.id);
                setSelectedSeat(null);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                selectedFloorId === fl.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Floor {fl.level}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live 3s polling (Updated: {lastRefreshed})</span>
        </div>
      </div>

      {userActiveSeat && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm flex items-center justify-between">
          <div>
            You currently hold desk <strong className="text-blue-700 font-mono">{userActiveSeat.label}</strong> ({userActiveSeat.status.replace('_', ' ')}).
          </div>
          <Link href="/my-seat" className="font-semibold text-blue-700 hover:underline text-xs">
            Manage my seat &rarr;
          </Link>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 flex flex-wrap items-center gap-5 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-emerald-500"></div>
          <span className="font-medium text-slate-700">Green: Free (Click to book)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-rose-500"></div>
          <span className="font-medium text-slate-700">Red: Occupied</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-amber-500"></div>
          <span className="font-medium text-slate-700">Amber: On Break (Timer active)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-blue-500"></div>
          <span className="font-medium text-slate-700">Blue: Booked (15m window)</span>
        </div>
      </div>

      {/* Floor Map Layout */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 shadow-sm overflow-x-auto">
        <div className="min-w-[600px] space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{currentFloor.name}</h3>
              <p className="text-xs text-slate-500">40 Study Desks (Desks 01 - 40)</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
              {floorSeats.filter(s => s.status === 'free').length} / 40 Free
            </span>
          </div>

          {/* Seat Grid */}
          <div className="grid grid-cols-8 gap-2.5 pt-2">
            {floorSeats.map((seat) => {
              const isFree = seat.status === 'free';
              const isOccupied = seat.status === 'checked_in';
              const isOnBreak = seat.status === 'on_break';
              const isBooked = seat.status === 'booked';
              const isSelected = selectedSeat?.id === seat.id;
              const isMySeat = seat.active_booking?.user_reg_no === state.currentUser.reg_no;

              let style = 'bg-slate-50 border-slate-200 text-slate-600';
              if (isFree) style = 'bg-emerald-50 border-emerald-400 text-emerald-900 hover:bg-emerald-100 hover:border-emerald-600 cursor-pointer shadow-xs';
              if (isOccupied) style = 'bg-rose-50 border-rose-300 text-rose-800 cursor-not-allowed';
              if (isOnBreak) style = 'bg-amber-50 border-amber-400 text-amber-900 cursor-not-allowed';
              if (isBooked) style = 'bg-blue-50 border-blue-400 text-blue-900 cursor-not-allowed';
              if (isSelected) style += ' ring-2 ring-blue-600';
              if (isMySeat) style += ' ring-2 ring-slate-900 font-bold';

              return (
                <button
                  key={seat.id}
                  onClick={() => handleSeatClick(seat)}
                  className={`border rounded p-2 flex flex-col items-center justify-center min-h-[58px] transition ${style}`}
                >
                  <span className="font-mono text-xs font-bold">{seat.label.split('-')[1]}</span>
                  {isFree && <span className="text-[10px] text-emerald-700 font-semibold mt-0.5">Free</span>}
                  {isOccupied && <span className="text-[10px] text-rose-700 font-semibold mt-0.5">Busy</span>}
                  {isOnBreak && (
                    <span className="text-[9px] font-mono font-bold text-amber-800 mt-0.5">
                      {getRemainingTime(seat.active_booking?.expires_at)}
                    </span>
                  )}
                  {isBooked && (
                    <span className="text-[9px] font-mono font-bold text-blue-800 mt-0.5">
                      {getRemainingTime(seat.active_booking?.expires_at)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {selectedSeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-300 rounded-lg max-w-sm w-full p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div>
                <h4 className="font-bold text-slate-900 text-base">Seat {selectedSeat.label}</h4>
                <p className="text-xs text-slate-500 font-mono">Code: {selectedSeat.code}</p>
              </div>
              <button
                onClick={() => setSelectedSeat(null)}
                className="text-slate-400 hover:text-slate-700 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 rounded p-3 text-xs space-y-1.5 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className={`font-bold capitalize ${
                  selectedSeat.status === 'free' ? 'text-emerald-700' :
                  selectedSeat.status === 'checked_in' ? 'text-rose-700' :
                  selectedSeat.status === 'on_break' ? 'text-amber-700' : 'text-blue-700'
                }`}>
                  {selectedSeat.status.replace('_', ' ')}
                </span>
              </div>
              {selectedSeat.active_booking && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Held by:</span>
                    <span className="font-mono text-slate-800">{selectedSeat.active_booking.user_reg_no}</span>
                  </div>
                  {selectedSeat.active_booking.expires_at && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Auto-release in:</span>
                      <span className="font-mono text-amber-700 font-bold">
                        {getRemainingTime(selectedSeat.active_booking.expires_at)}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {bookingError && (
              <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded p-2.5">
                {bookingError}
              </div>
            )}
            {bookingSuccess && (
              <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-2.5">
                {bookingSuccess}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              {selectedSeat.status === 'free' ? (
                <button
                  onClick={handleConfirmBooking}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded text-xs transition"
                >
                  Book Seat (15m Hold)
                </button>
              ) : null}
              <button
                onClick={() => setSelectedSeat(null)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded text-xs border border-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
