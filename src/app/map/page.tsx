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
    setBookingSuccess(`Seat ${selectedSeat.label} reserved. Check in within 15 minutes.`);
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
    <div>
      <h1>Map</h1>

      {/* Floor selection */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: '12px 0' }}>
        <span>Floor:</span>
        {state.floors.map((fl) => (
          <button
            key={fl.id}
            onClick={() => {
              setSelectedFloorId(fl.id);
              setSelectedSeat(null);
            }}
            className={selectedFloorId === fl.id ? 'primary' : ''}
          >
            Floor {fl.level}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '14px', color: '#666' }}>
          Auto-refresh: 3s (Last: {lastRefreshed})
        </span>
      </div>

      {userActiveSeat && (
        <div style={{ border: '1px solid #000000', padding: '8px', margin: '12px 0', background: '#ffffff' }}>
          You currently hold seat <strong>{userActiveSeat.label}</strong> ({userActiveSeat.status}).{' '}
          <Link href="/my-seat">Go to My seat</Link>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', margin: '12px 0', fontSize: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '16px', height: '16px', border: '1px solid #000', background: '#22c55e' }}></div>
          <span>Green: Free</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '16px', height: '16px', border: '1px solid #000', background: '#ef4444' }}></div>
          <span>Red: Occupied</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '16px', height: '16px', border: '1px solid #000', background: '#f59e0b' }}></div>
          <span>Amber: On break / Booked</span>
        </div>
      </div>

      <div style={{ margin: '8px 0', fontSize: '14px' }}>
        <strong>{currentFloor.name}</strong> ({floorSeats.filter(s => s.status === 'free').length} / 40 free)
      </div>

      {/* Seat grid - 8 columns of plain squares */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, minmax(0, 1fr))',
        gap: '6px',
        maxWidth: '720px',
        margin: '12px 0'
      }}>
        {floorSeats.map((seat) => {
          let bgColor = '#22c55e'; // Green
          if (seat.status === 'checked_in') bgColor = '#ef4444'; // Red
          if (seat.status === 'on_break' || seat.status === 'booked') bgColor = '#f59e0b'; // Amber

          const isMySeat = seat.active_booking?.user_reg_no === state.currentUser.reg_no;

          return (
            <button
              key={seat.id}
              onClick={() => handleSeatClick(seat)}
              style={{
                width: '100%',
                height: '56px',
                border: isMySeat ? '2px solid #000000' : '1px solid #000000',
                background: bgColor,
                color: '#000000',
                padding: '2px',
                fontSize: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: seat.status === 'free' ? 'pointer' : 'default',
                fontWeight: isMySeat ? 'bold' : 'normal',
              }}
            >
              <span>{seat.label.split('-')[1]}</span>
              {seat.active_booking?.expires_at && (
                <span style={{ fontSize: '10px' }}>
                  {getRemainingTime(seat.active_booking.expires_at)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Seat click details modal/box */}
      {selectedSeat && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #000000',
            padding: '16px',
            maxWidth: '360px',
            width: '100%'
          }}>
            <h2 style={{ marginTop: 0 }}>Seat {selectedSeat.label}</h2>
            <p style={{ margin: '4px 0' }}>Code: {selectedSeat.code}</p>
            <p style={{ margin: '4px 0' }}>Status: {selectedSeat.status}</p>

            {selectedSeat.active_booking && (
              <>
                <p style={{ margin: '4px 0' }}>Held by: {selectedSeat.active_booking.user_reg_no}</p>
                {selectedSeat.active_booking.expires_at && (
                  <p style={{ margin: '4px 0' }}>
                    Expires in: {getRemainingTime(selectedSeat.active_booking.expires_at)}
                  </p>
                )}
              </>
            )}

            {bookingError && (
              <p style={{ color: '#dc2626', margin: '8px 0' }}>{bookingError}</p>
            )}
            {bookingSuccess && (
              <p style={{ color: '#16a34a', margin: '8px 0' }}>{bookingSuccess}</p>
            )}

            <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
              {selectedSeat.status === 'free' ? (
                <button onClick={handleConfirmBooking} className="primary">
                  Book seat (15m hold)
                </button>
              ) : null}
              <button onClick={() => setSelectedSeat(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
