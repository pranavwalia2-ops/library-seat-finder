'use client';

import { Floor, Seat, User, ActiveBooking, HoggedSeatMetric, PeakHourMetric } from './types';

// ============================================================================
// SeatSync State Management (Reactive client store + Supabase sync)
// ============================================================================

const STORAGE_KEY = 'seatsync_state_v1';

export interface AppState {
  currentUser: User;
  floors: Floor[];
  seats: Seat[];
  bookings: ActiveBooking[];
  hoggedMetrics: HoggedSeatMetric[];
  peakHours: PeakHourMetric[];
}

// Generate the canonical 5 floors x 100 seats (500 seats total)
export function generateInitialSeats(): { floors: Floor[]; seats: Seat[] } {
  const floors: Floor[] = [
    { id: 'f1', name: 'Ground Floor - Quiet Study Zone', level: 1 },
    { id: 'f2', name: 'First Floor - Collaborative Commons', level: 2 },
    { id: 'f3', name: 'Second Floor - Silent Research Wing', level: 3 },
    { id: 'f4', name: 'Third Floor - Periodicals & Journals', level: 4 },
    { id: 'f5', name: 'Fourth Floor - Digital Lab & Media', level: 5 },
  ];

  const seats: Seat[] = [];
  const prefixes = ['F1', 'F2', 'F3', 'F4', 'F5'];

  floors.forEach((fl, fIdx) => {
    const prefix = prefixes[fIdx];
    for (let i = 1; i <= 100; i++) {
      const col = ((i - 1) % 10) + 1;
      const row = Math.floor((i - 1) / 10) + 1;
      const label = `${prefix}-S${String(i).padStart(2, '0')}`;
      const code = `LPU-${prefix}-${String(i).padStart(3, '0')}`;

      // Pre-seed a few live states for instant realistic demo
      let status: Seat['status'] = 'free';
      let active_booking: ActiveBooking | undefined = undefined;

      if (fIdx === 0 && i === 1) {
        status = 'checked_in';
        active_booking = {
          id: 'b-f1-01',
          seat_id: `${prefix}-seat-${i}`,
          user_id: 'u-12200002',
          user_reg_no: '12200002',
          user_name: 'Rahul Sharma',
          status: 'checked_in',
          booked_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          checked_in_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        };
      } else if (fIdx === 0 && i === 2) {
        status = 'booked';
        active_booking = {
          id: 'b-f1-02',
          seat_id: `${prefix}-seat-${i}`,
          user_id: 'u-12200003',
          user_reg_no: '12200003',
          user_name: 'Priya Patel',
          status: 'booked',
          booked_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        };
      } else if (fIdx === 0 && i === 3) {
        status = 'on_break';
        active_booking = {
          id: 'b-f1-03',
          seat_id: `${prefix}-seat-${i}`,
          user_id: 'u-12200004',
          user_reg_no: '12200004',
          user_name: 'Aman Verma',
          status: 'on_break',
          booked_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          checked_in_at: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
          break_started_at: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
          expires_at: new Date(Date.now() + 14 * 60 * 1000).toISOString(),
        };
      } else if (fIdx === 1 && (i === 10 || i === 11)) {
        status = 'checked_in';
        active_booking = {
          id: `b-${prefix}-${i}`,
          seat_id: `${prefix}-seat-${i}`,
          user_id: `u-122000${10 + i}`,
          user_reg_no: `122000${10 + i}`,
          user_name: `Student ${10 + i}`,
          status: 'checked_in',
          booked_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          checked_in_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        };
      }

      seats.push({
        id: `${prefix}-seat-${i}`,
        floor_id: fl.id,
        label,
        x: col,
        y: row,
        code,
        status,
        active_booking,
      });
    }
  });

  return { floors, seats };
}

export function getInitialHoggedMetrics(): HoggedSeatMetric[] {
  return [
    { seat_label: 'F1-S05', seat_code: 'LPU-F1-005', floor_name: 'Ground Floor', timeout_count: 8, break_ratio: 72, total_held_minutes: 240 },
    { seat_label: 'F1-S12', seat_code: 'LPU-F1-012', floor_name: 'Ground Floor', timeout_count: 6, break_ratio: 65, total_held_minutes: 190 },
    { seat_label: 'F2-S08', seat_code: 'LPU-F2-008', floor_name: 'First Floor', timeout_count: 5, break_ratio: 58, total_held_minutes: 160 },
    { seat_label: 'F1-S22', seat_code: 'LPU-F1-022', floor_name: 'Ground Floor', timeout_count: 5, break_ratio: 54, total_held_minutes: 145 },
    { seat_label: 'F3-S04', seat_code: 'LPU-F3-004', floor_name: 'Second Floor', timeout_count: 4, break_ratio: 51, total_held_minutes: 130 },
    { seat_label: 'F2-S19', seat_code: 'LPU-F2-019', floor_name: 'First Floor', timeout_count: 4, break_ratio: 48, total_held_minutes: 120 },
    { seat_label: 'F3-S15', seat_code: 'LPU-F3-015', floor_name: 'Second Floor', timeout_count: 3, break_ratio: 45, total_held_minutes: 110 },
    { seat_label: 'F1-S30', seat_code: 'LPU-F1-030', floor_name: 'Ground Floor', timeout_count: 3, break_ratio: 42, total_held_minutes: 95 },
    { seat_label: 'F2-S35', seat_code: 'LPU-F2-035', floor_name: 'First Floor', timeout_count: 2, break_ratio: 38, total_held_minutes: 85 },
    { seat_label: 'F3-S38', seat_code: 'LPU-F3-038', floor_name: 'Second Floor', timeout_count: 2, break_ratio: 35, total_held_minutes: 70 },
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
      return parsed;
    } catch {
      // Fallback
    }
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
  }
}
