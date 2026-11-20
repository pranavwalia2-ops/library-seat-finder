// ============================================================================
// SeatSync Domain Types
// ============================================================================

export type SeatStatus = 'free' | 'booked' | 'checked_in' | 'on_break' | 'released';

export interface Floor {
  id: string;
  name: string;
  level: number;
}

export interface Seat {
  id: string;
  floor_id: string;
  label: string;
  x: number;
  y: number;
  code: string;
  status: SeatStatus;
  active_booking?: ActiveBooking | null;
}

export interface ActiveBooking {
  id: string;
  seat_id: string;
  user_id: string;
  user_reg_no?: string;
  user_name?: string;
  status: 'booked' | 'checked_in' | 'on_break';
  booked_at: string;
  checked_in_at?: string | null;
  break_started_at?: string | null;
  expires_at?: string | null;
  leftLibraryAt?: number | null;
  belongingsCollectedAt?: number | null;
  releaseReason?: string | null;
}

export interface GateLog {
  id: string;
  regNo: string;
  direction: 'in' | 'out';
  at: number;
}

export interface User {
  id: string;
  reg_no: string;
  name: string;
  role: 'student' | 'admin';
}

export interface BookingEvent {
  id: string;
  booking_id: string;
  seat_id: string;
  user_id: string;
  event: string;
  created_at: string;
}

export interface HoggedSeatMetric {
  seat_label: string;
  seat_code: string;
  floor_name: string;
  timeout_count: number;
  break_ratio: number; // percentage
  total_held_minutes: number;
}

export interface PeakHourMetric {
  hour: string;
  bookings: number;
}
