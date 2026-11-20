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
      
      // Auto-release expired bookings lazily on map read
      let modified = false;
      const currentTimestamp = Date.now();
      setNow(currentTimestamp);

      current.seats = current.seats.map((seat) => {
        if (seat.active_booking && seat.active_booking.expires_at) {
          const expireTime = new Date(seat.active_booking.expires_at).getTime();
          if (expireTime < currentTimestamp) {
            // Auto release seat!
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {state.floors.map((fl) => (
            <button
              key={fl.id}
              onClick={() => {
                setSelectedFloorId(fl.id);
                setSelectedSeat(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedFloorId === fl.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Floor {fl.level}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Realtime + 3s Poll</span>
          </div>
          <span className="text-slate-500">•</span>
          <span>Updated: {lastRefreshed}</span>
        </div>
      </div>

      {/* Active User Alert if they already hold a seat */}
      {userActiveSeat && (
        <div className="bg-indigo-950/60 border border-indigo-700/50 rounded-xl p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="text-xs text-indigo-200">
              You are currently holding seat <strong className="text-white font-mono">{userActiveSeat.label}</strong> ({userActiveSeat.status.replace('_', ' ')})
            </div>
          </div>
          <Link
            href="/my-seat"
            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1 rounded-lg shrink-0 flex items-center gap-1 transition"
          >
            <span>My Seat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 bg-slate-900/40 border border-slate-800/60 rounded-xl px-4 py-2 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-md bg-emerald-500 shadow-sm shadow-emerald-500/50"></div>
          <span className="text-slate-300">Free (Click to book)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-md bg-rose-500 shadow-sm shadow-rose-500/50"></div>
          <span className="text-slate-300">Occupied</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-md bg-amber-500 shadow-sm shadow-amber-500/50"></div>
          <span className="text-slate-300">On Break (Timer)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-md bg-indigo-500 shadow-sm shadow-indigo-500/50"></div>
          <span className="text-slate-300">Booked (15m window)</span>
        </div>
      </div>

      {/* Interactive Floor SVG Map */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl overflow-x-auto">
        <div className="min-w-[620px] max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">{currentFloor.name}</h3>
              <p className="text-xs text-slate-400">40 Study Desks (Desks 01 - 40)</p>
            </div>
            <div className="text-xs font-mono bg-slate-800 px-2.5 py-1 rounded-md text-slate-300">
              {floorSeats.filter(s => s.status === 'free').length} / 40 Available
            </div>
          </div>

          {/* SVG Layout Grid */}
          <div className="grid grid-cols-8 gap-2.5 sm:gap-3 py-2">
            {floorSeats.map((seat) => {
              const isFree = seat.status === 'free';
              const isOccupied = seat.status === 'checked_in';
              const isOnBreak = seat.status === 'on_break';
              const isBooked = seat.status === 'booked';
              const isSelected = selectedSeat?.id === seat.id;
              const isMySeat = seat.active_booking?.user_reg_no === state.currentUser.reg_no;

              let bgClasses = 'bg-slate-800/80 border-slate-700 text-slate-400';
              if (isFree) bgClasses = 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60 hover:scale-105 cursor-pointer shadow-sm shadow-emerald-900/30';
              if (isOccupied) bgClasses = 'bg-rose-950/40 border-rose-500/50 text-rose-300 cursor-not-allowed';
              if (isOnBreak) bgClasses = 'bg-amber-950/40 border-amber-500/60 text-amber-300 cursor-not-allowed animate-pulse';
              if (isBooked) bgClasses = 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300 cursor-not-allowed';
              if (isSelected) bgClasses += ' ring-2 ring-indigo-400 scale-105';
              if (isMySeat) bgClasses += ' ring-2 ring-white';

              return (
                <button
                  key={seat.id}
                  onClick={() => handleSeatClick(seat)}
                  className={`relative p-2.5 rounded-xl border flex flex-col items-center justify-center min-h-[64px] transition-all ${bgClasses}`}
                >
                  <span className="font-mono text-xs font-bold">{seat.label.split('-')[1]}</span>
                  
                  {isFree && (
                    <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-semibold mt-1">Free</span>
                  )}
                  {isOccupied && (
                    <span className="text-[9px] uppercase tracking-wider text-rose-400 font-semibold mt-1">Busy</span>
                  )}
                  {isOnBreak && (
                    <span className="text-[9px] font-mono text-amber-400 font-semibold mt-1">
                      {getRemainingTime(seat.active_booking?.expires_at)}
                    </span>
                  )}
                  {isBooked && (
                    <span className="text-[9px] font-mono text-indigo-400 font-semibold mt-1">
                      {getRemainingTime(seat.active_booking?.expires_at)}
                    </span>
                  )}
                  {isMySeat && (
                    <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white rounded-full border-2 border-indigo-600"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Booking Confirmation / Status Modal */}
      {selectedSeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold">
                  {selectedSeat.label.split('-')[1]}
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">{selectedSeat.label}</h4>
                  <p className="text-xs text-slate-400 font-mono">Code: {selectedSeat.code}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSeat(null)}
                className="text-slate-400 hover:text-white text-sm p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {bookingError && (
              <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{bookingError}</span>
              </div>
            )}

            {bookingSuccess && (
              <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{bookingSuccess}</span>
              </div>
            )}

            <div className="bg-slate-950/60 rounded-xl p-3 text-xs space-y-2 border border-slate-800/80">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Status:</span>
                <span className={`font-semibold capitalize ${
                  selectedSeat.status === 'free' ? 'text-emerald-400' :
                  selectedSeat.status === 'checked_in' ? 'text-rose-400' :
                  selectedSeat.status === 'on_break' ? 'text-amber-400' : 'text-indigo-400'
                }`}>
                  {selectedSeat.status.replace('_', ' ')}
                </span>
              </div>

              {selectedSeat.active_booking && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Held By:</span>
                    <span className="text-slate-200 font-mono">{selectedSeat.active_booking.user_reg_no}</span>
                  </div>
                  {selectedSeat.active_booking.expires_at && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Auto-Release In:</span>
                      <span className="text-amber-400 font-mono font-bold">
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
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl transition shadow-lg shadow-emerald-600/30 text-sm flex items-center justify-center gap-2"
              >
                <span>Reserve Seat (15-min Hold)</span>
              </button>
            ) : (
              <button
                onClick={() => setSelectedSeat(null)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 rounded-xl transition text-sm"
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
