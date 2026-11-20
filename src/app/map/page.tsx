'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { loadStoredState, saveState, AppState } from '@/lib/store';
import { Seat } from '@/lib/types';
import { MapPin, RefreshCw, AlertCircle, CheckCircle2, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export default function MapPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [selectedFloorId, setSelectedFloorId] = useState<string>('f1');
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [bookingError, setBookingError] = useState<string>('');
  const [bookingSuccess, setBookingSuccess] = useState<string>('');
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');
  const [now, setNow] = useState<number>(Date.now());

  // Auto-release check and poll fallback every 3 seconds
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

  // Check if current user already holds a seat
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

    // Check 1: User already holds active seat
    const alreadyHolding = current.seats.find(
      (s) => s.active_booking && s.active_booking.user_reg_no === current.currentUser.reg_no
    );
    if (alreadyHolding) {
      setBookingError(`You already hold seat ${alreadyHolding.label}. Only 1 active seat is allowed.`);
      return;
    }

    // Check 2: Seat availability (Simulating Atomic Postgres Partial Unique Index)
    const targetSeatIndex = current.seats.findIndex((s) => s.id === selectedSeat.id);
    if (targetSeatIndex === -1 || current.seats[targetSeatIndex].status !== 'free') {
      setBookingError(`Seat ${selectedSeat.label} was just taken by another student! Please select another.`);
      setSelectedSeat(current.seats[targetSeatIndex]);
      return;
    }

    // Book seat for 15-minute check-in confirmation window
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
    setBookingSuccess(`Seat ${selectedSeat.label} reserved! You have 15 minutes to scan QR at seat.`);
    setSelectedSeat(null);
  };

  // Helper for countdown display
  const getRemainingTime = (expiresAtStr?: string | null) => {
    if (!expiresAtStr) return '';
    const diff = Math.max(0, Math.floor((new Date(expiresAtStr).getTime() - now) / 1000));
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-4">
      {/* Top Controls: Floor Tabs & Refresh Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {state.floors.map((fl) => (
            <button
              key={fl.id}
              onClick={() => {
                setSelectedFloorId(fl.id);
                setSelectedSeat(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedFloorId === fl.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Floor {fl.level}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Realtime + 3s Auto-Poll</span>
          </div>
          <span className="text-slate-300">•</span>
          <span className="font-mono">Updated: {lastRefreshed}</span>
        </div>
      </div>

      {/* Active User Alert if they already hold a seat */}
      {userActiveSeat && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="text-xs text-slate-800">
              You are currently holding desk <strong className="text-blue-700 font-mono text-sm">{userActiveSeat.label}</strong> ({userActiveSeat.status.replace('_', ' ')})
            </div>
          </div>
          <Link
            href="/my-seat"
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 rounded-xl shrink-0 flex items-center gap-1.5 transition shadow-sm"
          >
            <span>My Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 bg-white border border-slate-200 rounded-2xl px-5 py-3 text-xs shadow-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-md bg-emerald-500"></div>
          <span className="text-slate-700 font-medium">Free (Click to book)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-md bg-rose-500"></div>
          <span className="text-slate-700 font-medium">Occupied</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-md bg-amber-500"></div>
          <span className="text-slate-700 font-medium">On Break (Timer)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-md bg-purple-600"></div>
          <span className="text-slate-700 font-medium">Booked (15m window)</span>
        </div>
      </div>

      {/* Interactive Floor SVG Map */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm overflow-x-auto">
        <div className="min-w-[620px] max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">{currentFloor.name}</h3>
              <p className="text-xs text-slate-500">Study Desks Layout (Desks 01 - 40)</p>
            </div>
            <div className="text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-lg">
              {floorSeats.filter(s => s.status === 'free').length} / 40 Desks Free
            </div>
          </div>

          {/* Seat Grid */}
          <div className="grid grid-cols-8 gap-2.5 sm:gap-3 py-2">
            {floorSeats.map((seat) => {
              const isFree = seat.status === 'free';
              const isOccupied = seat.status === 'checked_in';
              const isOnBreak = seat.status === 'on_break';
              const isBooked = seat.status === 'booked';
              const isSelected = selectedSeat?.id === seat.id;
              const isMySeat = seat.active_booking?.user_reg_no === state.currentUser.reg_no;

              let bgClasses = 'bg-slate-50 border-slate-200 text-slate-600';
              if (isFree) bgClasses = 'bg-white border-emerald-300 text-emerald-800 hover:border-emerald-500 hover:bg-emerald-50/50 hover:scale-105 cursor-pointer shadow-sm';
              if (isOccupied) bgClasses = 'bg-rose-50 border-rose-200 text-rose-700 cursor-not-allowed';
              if (isOnBreak) bgClasses = 'bg-amber-50 border-amber-300 text-amber-800 cursor-not-allowed animate-pulse';
              if (isBooked) bgClasses = 'bg-purple-50 border-purple-200 text-purple-700 cursor-not-allowed';
              if (isSelected) bgClasses += ' ring-2 ring-blue-600 scale-105';
              if (isMySeat) bgClasses += ' ring-2 ring-purple-600 font-bold';

              return (
                <button
                  key={seat.id}
                  onClick={() => handleSeatClick(seat)}
                  className={`relative p-2.5 rounded-2xl border flex flex-col items-center justify-center min-h-[68px] transition-all ${bgClasses}`}
                >
                  <span className="font-mono text-xs font-black">{seat.label.split('-')[1]}</span>
                  
                  {isFree && (
                    <span className="text-[9px] uppercase tracking-wider text-emerald-600 font-bold mt-1">Free</span>
                  )}
                  {isOccupied && (
                    <span className="text-[9px] uppercase tracking-wider text-rose-600 font-bold mt-1">Busy</span>
                  )}
                  {isOnBreak && (
                    <span className="text-[9px] font-mono text-amber-700 font-bold mt-1">
                      {getRemainingTime(seat.active_booking?.expires_at)}
                    </span>
                  )}
                  {isBooked && (
                    <span className="text-[9px] font-mono text-purple-700 font-bold mt-1">
                      {getRemainingTime(seat.active_booking?.expires_at)}
                    </span>
                  )}
                  {isMySeat && (
                    <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-purple-600 rounded-full border-2 border-white shadow-sm"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Booking Confirmation / Status Modal */}
      {selectedSeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-black">
                  {selectedSeat.label.split('-')[1]}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">{selectedSeat.label}</h4>
                  <p className="text-xs text-slate-500 font-mono">Code: {selectedSeat.code}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSeat(null)}
                className="text-slate-400 hover:text-slate-800 text-sm p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {bookingError && (
              <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{bookingError}</span>
              </div>
            )}

            {bookingSuccess && (
              <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{bookingSuccess}</span>
              </div>
            )}

            <div className="bg-slate-50 rounded-2xl p-3.5 text-xs space-y-2 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Current Status:</span>
                <span className={`font-bold capitalize ${
                  selectedSeat.status === 'free' ? 'text-emerald-600' :
                  selectedSeat.status === 'checked_in' ? 'text-rose-600' :
                  selectedSeat.status === 'on_break' ? 'text-amber-600' : 'text-purple-600'
                }`}>
                  {selectedSeat.status.replace('_', ' ')}
                </span>
              </div>

              {selectedSeat.active_booking && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Held By:</span>
                    <span className="text-slate-800 font-mono font-semibold">{selectedSeat.active_booking.user_reg_no}</span>
                  </div>
                  {selectedSeat.active_booking.expires_at && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Auto-Release In:</span>
                      <span className="text-amber-700 font-mono font-bold">
                        {getRemainingTime(selectedSeat.active_booking.expires_at)}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {selectedSeat.status === 'free' ? (
              <button
                onClick={handleConfirmBooking}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition shadow-md shadow-blue-500/20 text-sm flex items-center justify-center gap-2"
              >
                <span>Reserve Desk (15-min Hold)</span>
              </button>
            ) : (
              <button
                onClick={() => setSelectedSeat(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition text-sm"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
