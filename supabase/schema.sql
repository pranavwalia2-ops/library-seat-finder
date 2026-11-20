-- ============================================================================
-- SeatSync Database Schema (PostgreSQL / Supabase)
-- Hackathon: Code Fuzion 2026, LPU (Problem M4)
-- Description: Core tables, partial unique indexes for zero double-booking,
--              realtime publication, and event logging for seat analytics.
-- ============================================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean slate if recreating
DROP VIEW IF EXISTS booking_events CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS booking_events CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS seats CASCADE;
DROP TABLE IF EXISTS floors CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ----------------------------------------------------------------------------
-- 1. FLOORS TABLE
-- Represents physical library floors.
-- ----------------------------------------------------------------------------
CREATE TABLE floors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    level INTEGER NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. SEATS TABLE
-- Represents individual seats with visual map coordinates and unique QR codes.
-- ----------------------------------------------------------------------------
CREATE TABLE seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    floor_id UUID NOT NULL REFERENCES floors(id) ON DELETE CASCADE,
    label VARCHAR(20) NOT NULL,           -- e.g. 'F1-S01'
    x INTEGER NOT NULL,                   -- X coordinate on SVG grid
    y INTEGER NOT NULL,                   -- Y coordinate on SVG grid
    code VARCHAR(50) NOT NULL UNIQUE,     -- Scanned from QR or typed manually
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_seats_floor ON seats(floor_id);

-- ----------------------------------------------------------------------------
-- 3. USERS TABLE
-- Simple student/admin profiles identified by university registration number.
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reg_no VARCHAR(8) NOT NULL UNIQUE,   -- 8-digit university registration number
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_reg_no ON users(reg_no);

-- ----------------------------------------------------------------------------
-- 4. BOOKINGS TABLE
-- Tracks the lifecycle of seat reservations:
-- 'booked' -> 'checked_in' -> 'on_break' -> 'released'
-- ----------------------------------------------------------------------------
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seat_id UUID NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'booked' 
        CHECK (status IN ('booked', 'checked_in', 'on_break', 'released')),
    booked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    checked_in_at TIMESTAMPTZ,
    break_started_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,              -- Auto-release deadline for unconfirmed booking or break
    released_at TIMESTAMPTZ,
    release_reason VARCHAR(50)           -- 'user_ended', 'timeout_no_checkin', 'timeout_break_expired', 'admin_override'
);

-- ============================================================================
-- CORE CONCURRENCY GUARANTEES (PARTIAL UNIQUE INDEXES)
-- ============================================================================

-- WHY: A standard UNIQUE index would prevent a seat from ever being booked again
-- after it's released. A PARTIAL UNIQUE index enforces that at any given instant,
-- at most ONE active booking ('booked', 'checked_in', or 'on_break') can exist
-- for a specific seat. Any concurrent booking attempt hits this index constraint
-- and raises unique_violation (Postgres code 23505) atomically.
CREATE UNIQUE INDEX idx_seats_single_active_booking 
    ON bookings(seat_id) 
    WHERE status IN ('booked', 'checked_in', 'on_break');

-- WHY: Prevents a single student from holding multiple seats across floors simultaneously.
CREATE UNIQUE INDEX idx_users_single_active_booking 
    ON bookings(user_id) 
    WHERE status IN ('booked', 'checked_in', 'on_break');

-- Fast lookup indexes for live map state and user status
CREATE INDEX idx_bookings_seat_status ON bookings(seat_id, status);
CREATE INDEX idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX idx_bookings_expires_at ON bookings(expires_at) WHERE status IN ('booked', 'on_break');

-- ----------------------------------------------------------------------------
-- 5. EVENTS TABLE
-- Immutable event ledger for auditing, live tracking, and admin hogging analytics.
-- ----------------------------------------------------------------------------
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    seat_id UUID NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event VARCHAR(50) NOT NULL,          -- 'booked', 'checked_in', 'break_started', 'break_returned', 'released'
    details JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_seat ON events(seat_id, created_at);
CREATE INDEX idx_events_created ON events(created_at);

-- Alias view for backward compatibility
CREATE OR REPLACE VIEW booking_events AS SELECT * FROM events;

-- ----------------------------------------------------------------------------
-- 6. REALTIME REPLICATION ENABLEMENT
-- ----------------------------------------------------------------------------
-- Enable Supabase Realtime for instant broadcast of booking changes to the live map
ALTER PUBLICATION supabase_realtime ADD TABLE seats;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
