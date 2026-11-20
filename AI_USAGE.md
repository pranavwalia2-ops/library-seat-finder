# SeatSync - AI Usage Log

In accordance with hackathon guidelines, this document logs all AI assistance, tooling, and generation used during the development of SeatSync (Code Fuzion 2026, LPU, Problem M4).

---

## 1. Architecture & Design Phase
- **Tool**: Google Antigravity (Gemini 3.8 Flash)
- **Role**: Senior Full-Stack Pair-Programmer & Mentor
- **Contribution**: 
  - Designed the database schema with partial unique indexes for mathematical concurrency guarantees against double bookings.
  - Planned the atomic PostgreSQL RPC architecture (`book_seat`, `check_in`, `start_break`, `return_from_break`, `release_expired`, `end_session`).
  - Outlined the Next.js 14 App Router project structure and live map polling fallback mechanism.

## 2. Database & SQL Generation
- **Files**: `supabase/schema.sql`, `supabase/seed.sql`
- **Contribution**: Generated DDL for floors, seats, users, bookings, and booking events with partial unique index constraints (`idx_seats_single_active_booking`, `idx_users_single_active_booking`) and automated seed data for 3 floors x 40 seats (120 seats).

---
*This log will be updated continuously as each module is built.*

## 3. Frontend & Presentation Framework
- **Files**: `src/app/*`, `src/components/*`, `src/lib/*`
- **Contribution**: Scaffolded Next.js 14 App Router with Tailwind CSS, SVG floor map, live countdown timers, HTML5 QR camera scanner with manual code fallback, Recharts peak-hours heatmap, top 10 hogged desks detection, and live concurrency simulator.
