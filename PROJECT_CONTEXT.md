# PROJECT CONTEXT: Library Seat Finder (SeatSync)

## 1. Project
- **Name**: Library Seat Finder (SeatSync)
- **Event**: Code Fuzion 2026, Lovely Professional University (LPU)
- **Problem Statement**: Problem M4
- **Core Goal**: 
  - Enable students to find and reserve open library seats in real time across floors.
  - Confirm reservations at the desk via QR code scan or manual code entry (15-minute hold).
  - Support designated 20-minute study breaks with live countdown timers.
  - Automatically release abandoned or expired seats back to the general pool without requiring expensive hardware sensors.
  - Provide librarians/administrators with live visibility into peak occupancy hours and identify chronically hogged seats.

---

## 2. Tech Stack & Architecture
- **Framework**: Next.js 14 App Router + TypeScript located in `src/`.
- **Styling**: Plain CSS located in `src/app/globals.css` with system-ui typography and responsive grids.
- **Storage / State Management (CRITICAL)**:
  - The application currently runs entirely on a reactive client-side store in `src/lib/store.ts` using browser `localStorage` under the key `seatsync_state_v5`, **NOT on Supabase**.
  - Components listen and broadcast state updates in real time using the `seatsync_change` custom window event.
  - The `/supabase` folder contains `schema.sql` and `seed.sql`, including PostgreSQL table DDL, partial unique indexes (`idx_seats_single_active_booking`, `idx_users_single_active_booking`), and planned stored procedures (`book_seat`, `check_in`, `start_break`, `return_from_break`, `leave_seat`, `release_expired`, `get_seat_map`) that are **not wired into the live frontend yet**.

---

## 3. What Is Built
- **Pages**:
  - `/map`: Interactive 5-floor map displaying 500 desks with floor selector pills, status filters (All, Free, Occupied, On Break), search bar, summary cards, and one-click desk reservation/release.
  - `/my-seat`: Student dashboard displaying current active desk reservation, live real-time countdown timer (15m scan hold, active study duration, or 20m break timer), and action buttons (Check in, Start break, Return from break, Release desk).
  - `/scan`: QR code scanner with camera viewfinder, target reticle, scanning animation, audio beep confirmation, and fallback manual desk code input (`LPU-F{floor}-{seat}`).
  - `/admin`: Librarian administration dashboard featuring 4 equal summary cards, peak-hours booking volume bar chart, top hogged seats metric table (timeout count, break ratio %, total held minutes), and auto-release/rush-hour simulation controls.
  - `/demo`: Concurrency stress tester simulating 100 simultaneous student booking attempts on a single desk to demonstrate zero duplicate bookings, along with an instant library state reset button.
  - `/login`: Student registration session login (8-digit ID, e.g. `12200001` or admin `12200000`).
  - `/pitch`: Presentation deck containing problem statement, solution overview, concurrency database guarantees, and anti-hogging slides.
- **Floors & Desks**:
  - 5 Floors: Ground Floor (Quiet Study Zone), First Floor (Collaborative Commons), Second Floor (Silent Research Wing), Third Floor (Periodicals & Journals), Fourth Floor (Digital Lab & Media).
  - 100 seats per floor (`F1-001` through `F5-100`), totaling 500 desks.
  - Realistic deterministic seed occupancy per floor.
- **Core Business Logic**:
  - 15-minute booking hold with QR verification requirement.
  - 20-minute break timer with automatic timeout.
  - Autonomous auto-release engine for ghost desks.

---

## 4. Look & Feel Rules
- **Aesthetic**: Clean, transparent, professional glassmorphism campus portal look.
- **Color Palette**:
  - Primary Accent: University Blue `#2563eb` (hover: `#1d4ed8`).
  - Free Seat: Green `#16a34a` / `#22c55e`.
  - Occupied / Checked In Seat: Red `#dc2626` / `#ef4444`.
  - On Break Seat: Amber `#f59e0b` / `#d97706`.
  - Surface Background: Soft diagonal gradient (`#e8f0ff` to `#eef2ff`) with blurred radial gradient blobs behind glass panels (`rgba(255, 255, 255, 0.55)`).
- **Seat Cell Performance Rule**:
  - Individual seat buttons MUST remain lightweight solid colors with NO `backdrop-filter` and NO `box-shadow` to ensure smooth rendering across 500 interactive elements without UI lag.
- **Consistency & Typography**:
  - Consistent system-ui font across all pages (`system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`).
  - Standardized `.panel`, `.panel-header`, `.summary-box`, `.summary-strip`, and `.glass-header` classes across every page.

---

## 5. Working Rules
1. **Preserve Existing Look**: Do not alter the visual styling or theme of existing pages.
2. **Preserve Existing Logic**: Do not break existing booking, QR check-in, or storage mechanisms.
3. **Small Changes**: Keep modifications minimal, atomic, and incremental.
4. **Read Before Writing**: Inspect and review existing project files before proposing or writing code.
5. **Commit After Every Step**: Run git commit after each verified milestone.
6. **Report Format**: After every step, list files changed and provide a 3-line judge explanation, then stop.

---

## 6. Current Status & TODO List
- **Done**:
  - 5-floor interactive floor map with 500 seats (`F1-001` to `F5-100`).
  - LocalStorage reactive store (`seatsync_state_v5`) with custom change events and deterministic floor distribution.
  - 15-minute booking hold and 20-minute break timers with real-time second-by-second countdowns.
  - QR scanner camera interface with manual seat code entry fallback and audio feedback.
  - Admin dashboard displaying peak hours and top hogged seats.
  - Concurrency demonstration bench (100 simultaneous requests) and presentation pitch deck.
  - Unified glassmorphism design system across all pages.
- **TODO**:
  - **Gate Tracking**: Turnstile in/out logging; if a student leaves the library without releasing their seat or taking an official break, auto-release the seat after 20 minutes (configurable demo window).
  - **Security Page**: Dedicated interface for campus security personnel to view seats vacated via gate exit and mark confiscated/collected belongings.
  - **Load Testing**: Concurrency and performance verification under high volume.
  - **Documentation**: Finalize `README.md` and update `AI_USAGE.md`.
  - **Deployment**: Production deployment configuration and Vercel release.

---

## 7. Judge Feedback & Turnstile Gate Specification
- **Feedback**: Store exact entry and exit timestamps when students pass through library turnstiles.
- **Automatic Seat Release**: If a student exits through the turnstile gate without releasing their seat or initiating a break, start a 15–20 minute grace period countdown. If the student does not return through the entry gate within that window, automatically release the seat for other students.
- **Security Belongings Protocol**: When an unreleased seat expires following a library exit, flag the desk on the security dashboard so library security staff can collect any left-behind belongings and mark them as collected.
