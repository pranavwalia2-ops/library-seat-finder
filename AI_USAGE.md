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

## 4. University Theme & Presentation Deck Redesign
- **Files**: `src/app/*`, `src/components/Navigation.tsx`, `presentation_deck.html`
- **Contribution**: Redesigned all interfaces from dark mode to an authentic, clean campus portal aesthetic (white surfaces `#ffffff`, slate borders, vibrant university blue `#2563eb`, and purple `#7c3aed` accents). Updated judges pitch slides and viva cheat sheet.

## 5. College Internal Tool Restyling
- **Files**: `src/app/globals.css`, `src/app/layout.tsx`, `src/components/Navigation.tsx`, `src/app/*`
- **Contribution**: Restyled all pages to look like an authentic student-built internal tool: plain `#ffffff` background, black text `#000000`, 16px Arial font, 1px solid black borders, max-width 900px, collapsed table borders (`#999999`), and plain square seat grid with colors green, red, amber. Removed all gradients, icons, shadows, animations, rounded cards, and marketing copy.

## 6. Structural Layout & Panel Improvements
- **Files**: `src/app/globals.css`, `src/app/layout.tsx`, `src/components/Navigation.tsx`, `src/app/map/page.tsx`, `src/app/my-seat/page.tsx`, `src/app/scan/page.tsx`, `src/app/admin/page.tsx`, `src/app/login/page.tsx`
- **Contribution**: Restructured the frontend into clean panels (`border: 1px solid #d1d5db`, `#f3f4f6` 14px bold heading strip), full-width top header with "Library Seat Finder", active tab with 3px blue bottom border, 10-column 44px square seat grid with mock statuses and TODO comment, 4-box summary strip, 4:3 camera area, peak-hours volume bars, and hogged seats table.
