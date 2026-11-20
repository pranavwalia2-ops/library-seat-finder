'use client';

import { Floor, Seat, User, ActiveBooking, HoggedSeatMetric, PeakHourMetric } from './types';

export type { Floor, Seat, User, ActiveBooking, HoggedSeatMetric, PeakHourMetric };

// ============================================================================
// SeatSync Reactive Local Storage & Supabase Store
// ============================================================================

const STORAGE_KEY = 'seatsync_state_v5';

export interface AppState {
  currentUser: User;
  floors: Floor[];
  seats: Seat[];
  bookings: ActiveBooking[];
  hoggedMetrics: HoggedSeatMetric[];
  peakHours: PeakHourMetric[];
}

// Deterministic seed hash generator matching hackathon target floor mixes
function getSeededStatus(floor: number, seatNum: number): 'free' | 'checked_in' | 'on_break' {
  const floorConfig: Record<number, { occupied: number; onBreak: number }> = {
    1: { occupied: 15, onBreak: 5 },
    2: { occupied: 40, onBreak: 8 },
    3: { occupied: 65, onBreak: 10 },
    4: { occupied: 85, onBreak: 8 },
    5: { occupied: 30, onBreak: 15 },
  };
  const { occupied, onBreak } = floorConfig[floor] || { occupied: 20, onBreak: 5 };
  const hash = Math.abs((floor * 7919 + seatNum * 1013) * 48271) % 100;
  if (hash < occupied) return 'checked_in';
  if (hash < occupied + onBreak) return 'on_break';
  return 'free';
}

export function generateInitialSeats(): { floors: Floor[]; seats: Seat[] } {
  const floors: Floor[] = [
    { id: 'f1', name: 'Ground Floor — Quiet Study Zone', level: 1 },
    { id: 'f2', name: 'First Floor — Collaborative Commons', level: 2 },
    { id: 'f3', name: 'Second Floor — Silent Research Wing', level: 3 },
    { id: 'f4', name: 'Third Floor — Periodicals & Journals', level: 4 },
    { id: 'f5', name: 'Fourth Floor — Digital Lab & Media', level: 5 },
  ];

  const seats: Seat[] = [];

  for (let floor = 1; floor <= 5; floor++) {
    for (let i = 1; i <= 100; i++) {
      const col = ((i - 1) % 10) + 1;
      const row = Math.floor((i - 1) / 10) + 1;
      const pad = String(i).padStart(3, '0');
      const label = `F${floor}-${pad}`;
      const code = `LPU-F${floor}-${pad}`;
      const id = `s-${floor}-${i}`;
      const status = getSeededStatus(floor, i);

      let active_booking: ActiveBooking | undefined = undefined;
      const now = Date.now();

      if (status === 'checked_in') {
        const studentNum = 12200000 + (floor * 100) + i;
        active_booking = {
          id: `b-${id}`,
          seat_id: id,
          user_id: `u-${studentNum}`,
          user_reg_no: String(studentNum),
          user_name: `Student ${studentNum}`,
          status: 'checked_in',
          booked_at: new Date(now - 45 * 60 * 1000).toISOString(),
          checked_in_at: new Date(now - 40 * 60 * 1000).toISOString(),
        };
      } else if (status === 'on_break') {
        const studentNum = 12200500 + (floor * 100) + i;
        active_booking = {
          id: `b-${id}`,
          seat_id: id,
          user_id: `u-${studentNum}`,
          user_reg_no: String(studentNum),
          user_name: `Student ${studentNum}`,
          status: 'on_break',
          booked_at: new Date(now - 55 * 60 * 1000).toISOString(),
          checked_in_at: new Date(now - 50 * 60 * 1000).toISOString(),
          break_started_at: new Date(now - 6 * 60 * 1000).toISOString(),
          expires_at: new Date(now + 14 * 60 * 1000).toISOString(),
        };
      }

      seats.push({
        id,
        floor_id: `f${floor}`,
        label,
        x: col,
        y: row,
        code,
        status,
        active_booking,
      });
    }
  }

  return { floors, seats };
}

export function getInitialHoggedMetrics(): HoggedSeatMetric[] {
  return [
    { seat_label: 'F1-005', seat_code: 'LPU-F1-005', floor_name: 'Ground Floor', timeout_count: 8, break_ratio: 72, total_held_minutes: 240 },
    { seat_label: 'F1-012', seat_code: 'LPU-F1-012', floor_name: 'Ground Floor', timeout_count: 6, break_ratio: 65, total_held_minutes: 190 },
    { seat_label: 'F2-008', seat_code: 'LPU-F2-008', floor_name: 'First Floor', timeout_count: 5, break_ratio: 58, total_held_minutes: 160 },
    { seat_label: 'F1-022', seat_code: 'LPU-F1-022', floor_name: 'Ground Floor', timeout_count: 5, break_ratio: 54, total_held_minutes: 145 },
    { seat_label: 'F3-004', seat_code: 'LPU-F3-004', floor_name: 'Second Floor', timeout_count: 4, break_ratio: 51, total_held_minutes: 130 },
    { seat_label: 'F2-019', seat_code: 'LPU-F2-019', floor_name: 'First Floor', timeout_count: 4, break_ratio: 48, total_held_minutes: 120 },
    { seat_label: 'F3-015', seat_code: 'LPU-F3-015', floor_name: 'Second Floor', timeout_count: 3, break_ratio: 45, total_held_minutes: 110 },
    { seat_label: 'F1-030', seat_code: 'LPU-F1-030', floor_name: 'Ground Floor', timeout_count: 3, break_ratio: 42, total_held_minutes: 95 },
    { seat_label: 'F4-025', seat_code: 'LPU-F4-025', floor_name: 'Third Floor', timeout_count: 2, break_ratio: 38, total_held_minutes: 85 },
    { seat_label: 'F5-010', seat_code: 'LPU-F5-010', floor_name: 'Fourth Floor', timeout_count: 2, break_ratio: 35, total_held_minutes: 70 },
  ];
}

export function getInitialPeakHours(): PeakHourMetric[] {
  return [
    { hour: '08:00', bookings: 14 },
    { hour: '09:00', bookings: 38 },
    { hour: '10:00', bookings: 76 },
    { hour: '11:00', bookings: 98 },
    { hour: '12:00', bookings: 112 },
    { hour: '13:00', bookings: 89 },
    { hour: '14:00', bookings: 104 },
    { hour: '15:00', bookings: 118 },
    { hour: '16:00', bookings: 95 },
    { hour: '17:00', bookings: 82 },
    { hour: '18:00', bookings: 64 },
    { hour: '19:00', bookings: 42 },
  ];
}

export function loadStoredState(): AppState {
  if (typeof window === 'undefined') {
    const { floors, seats } = generateInitialSeats();
    return {
      currentUser: { id: 'u-12200001', reg_no: '12200001', name: 'Dev Student (12200001)', role: 'student' },
      floors,
      seats,
      bookings: [],
      hoggedMetrics: getInitialHoggedMetrics(),
      peakHours: getInitialPeakHours(),
    };
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (
        parsed &&
        Array.isArray(parsed.seats) &&
        parsed.seats.length === 500 &&
        Array.isArray(parsed.floors) &&
        parsed.floors.length === 5
      ) {
        return parsed;
      }
    } catch {}
  }

  const { floors, seats } = generateInitialSeats();
  const initial: AppState = {
    currentUser: { id: 'u-12200001', reg_no: '12200001', name: 'Dev Student (12200001)', role: 'student' },
    floors,
    seats,
    bookings: [],
    hoggedMetrics: getInitialHoggedMetrics(),
    peakHours: getInitialPeakHours(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

export function saveState(state: AppState) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('seatsync_change'));
  }
}

// ----------------------------------------------------------------------------
// Action Life Cycle Methods
// ----------------------------------------------------------------------------

export function bookSeatAction(seatId: string, userRegNo: string): { success: boolean; message: string; seat?: Seat } {
  const state = loadStoredState();
  const target = state.seats.find((s) => s.id === seatId || s.label === seatId);

  if (!target) return { success: false, message: 'Desk not found.' };
  if (target.status !== 'free') return { success: false, message: `Desk ${target.label} is already occupied.` };

  // Check if user already holds a desk
  const existing = state.seats.find(
    (s) => s.active_booking && (s.active_booking.user_reg_no === userRegNo || s.active_booking.user_id === `u-${userRegNo}`)
  );
  if (existing) {
    return {
      success: false,
      message: `You already hold desk ${existing.label}. Release it first before reserving another.`,
    };
  }

  const now = new Date();
  const expires = new Date(now.getTime() + 15 * 60 * 1000); // 15 min scan hold
  const booking: ActiveBooking = {
    id: `b-${target.id}-${now.getTime()}`,
    seat_id: target.id,
    user_id: `u-${userRegNo}`,
    user_reg_no: userRegNo,
    user_name: `Student ${userRegNo}`,
    status: 'booked',
    booked_at: now.toISOString(),
    expires_at: expires.toISOString(),
  };

  target.status = 'booked';
  target.active_booking = booking;
  saveState(state);

  return { success: true, message: `Desk ${target.label} reserved! Hold expires in 15 minutes.`, seat: target };
}

export function checkInAction(seatCodeOrLabel: string, userRegNo: string): { success: boolean; message: string; seat?: Seat } {
  const state = loadStoredState();
  const cleanCode = seatCodeOrLabel.trim().toUpperCase();

  const target = state.seats.find(
    (s) => s.code.toUpperCase() === cleanCode || s.label.toUpperCase() === cleanCode || s.id === seatCodeOrLabel
  );

  if (!target) {
    return { success: false, message: `Desk code "${cleanCode}" not found in library directory.` };
  }

  const now = new Date();

  // If already booked by this user, confirm check-in
  if (target.active_booking && target.active_booking.user_reg_no === userRegNo) {
    target.status = 'checked_in';
    target.active_booking.status = 'checked_in';
    target.active_booking.checked_in_at = now.toISOString();
    target.active_booking.expires_at = null;
    saveState(state);
    return { success: true, message: `Checked in successfully to desk ${target.label}!`, seat: target };
  }

  // If free, allow instant check-in
  if (target.status === 'free') {
    const existing = state.seats.find(
      (s) => s.active_booking && (s.active_booking.user_reg_no === userRegNo || s.active_booking.user_id === `u-${userRegNo}`)
    );
    if (existing) {
      return {
        success: false,
        message: `You already hold desk ${existing.label}. Please release it first.`,
      };
    }

    const booking: ActiveBooking = {
      id: `b-${target.id}-${now.getTime()}`,
      seat_id: target.id,
      user_id: `u-${userRegNo}`,
      user_reg_no: userRegNo,
      user_name: `Student ${userRegNo}`,
      status: 'checked_in',
      booked_at: now.toISOString(),
      checked_in_at: now.toISOString(),
    };
    target.status = 'checked_in';
    target.active_booking = booking;
    saveState(state);
    return { success: true, message: `Desk ${target.label} claimed and checked in!`, seat: target };
  }

  return { success: false, message: `Desk ${target.label} is currently held by another student.` };
}

export function startBreakAction(seatId: string): { success: boolean; message: string } {
  const state = loadStoredState();
  const target = state.seats.find((s) => s.id === seatId || s.label === seatId);

  if (!target || !target.active_booking) {
    return { success: false, message: 'No active reservation found.' };
  }

  const now = new Date();
  const expires = new Date(now.getTime() + 20 * 60 * 1000); // 20 min break limit
  target.status = 'on_break';
  target.active_booking.status = 'on_break';
  target.active_booking.break_started_at = now.toISOString();
  target.active_booking.expires_at = expires.toISOString();
  saveState(state);

  return { success: true, message: '20-minute break timer active! Return before timer expires.' };
}

export function returnFromBreakAction(seatId: string): { success: boolean; message: string } {
  const state = loadStoredState();
  const target = state.seats.find((s) => s.id === seatId || s.label === seatId);

  if (!target || !target.active_booking) {
    return { success: false, message: 'No active reservation found.' };
  }

  target.status = 'checked_in';
  target.active_booking.status = 'checked_in';
  target.active_booking.break_started_at = null;
  target.active_booking.expires_at = null;
  saveState(state);

  return { success: true, message: 'Welcome back! Status restored to Checked In.' };
}

export function releaseSeatAction(seatId: string, reason: string = 'student_released'): { success: boolean; message: string } {
  const state = loadStoredState();
  const target = state.seats.find((s) => s.id === seatId || s.label === seatId);

  if (!target) return { success: false, message: 'Desk not found.' };

  target.status = 'free';
  target.active_booking = null;
  saveState(state);

  return { success: true, message: `Desk ${target.label} is now free for other students.` };
}

export function triggerAutoReleaseEngine(): { releasedCount: number; message: string } {
  const state = loadStoredState();
  let count = 0;
  const now = Date.now();

  state.seats.forEach((seat) => {
    if (seat.active_booking && seat.active_booking.expires_at) {
      const exp = new Date(seat.active_booking.expires_at).getTime();
      if (exp <= now) {
        seat.status = 'free';
        seat.active_booking = null;
        count++;
      }
    }
  });

  // Also simulate 2 random ghost releases for interactive demo if none naturally expired
  if (count === 0) {
    const breakOrBooked = state.seats.filter((s) => s.status === 'on_break' || s.status === 'booked');
    const toFree = breakOrBooked.slice(0, 3);
    toFree.forEach((seat) => {
      seat.status = 'free';
      seat.active_booking = null;
      count++;
    });
  }

  saveState(state);
  return {
    releasedCount: count,
    message: `Auto-Release Engine scanned 500 desks: Released ${count} inactive/ghost seats back to free status!`,
  };
}

export function simulateRushHourAction(): { addedCount: number; message: string } {
  const state = loadStoredState();
  const freeSeats = state.seats.filter((s) => s.status === 'free');
  const count = Math.min(25, freeSeats.length);
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const seat = freeSeats[i];
    const randId = 12209000 + i;
    seat.status = 'checked_in';
    seat.active_booking = {
      id: `rush-b-${seat.id}`,
      seat_id: seat.id,
      user_id: `u-${randId}`,
      user_reg_no: String(randId),
      user_name: `Student ${randId}`,
      status: 'checked_in',
      booked_at: new Date(now - 15 * 60 * 1000).toISOString(),
      checked_in_at: new Date(now - 10 * 60 * 1000).toISOString(),
    };
  }

  saveState(state);
  return { addedCount: count, message: `Simulated rush hour wave: ${count} students just checked in!` };
}

export function resetLibraryAction(): { message: string } {
  const { floors, seats } = generateInitialSeats();
  const clean: AppState = {
    currentUser: { id: 'u-12200001', reg_no: '12200001', name: 'Dev Student (12200001)', role: 'student' },
    floors,
    seats,
    bookings: [],
    hoggedMetrics: getInitialHoggedMetrics(),
    peakHours: getInitialPeakHours(),
  };
  saveState(clean);
  return { message: 'Library restored to fresh 500-desk state!' };
}
