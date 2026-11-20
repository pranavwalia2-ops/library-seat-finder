-- ============================================================================
-- SeatSync Database Seed Script
-- Hackathon: Code Fuzion 2026, LPU (Problem M4)
-- Description: Seeds 3 library floors, 120 seats (40 per floor), demo users
--              (students & admin), plus sample historical and active bookings
--              for immediate live demo & admin analytics testing.
-- ============================================================================

DO $$
DECLARE
    f1_id UUID;
    f2_id UUID;
    f3_id UUID;
    f4_id UUID;
    f5_id UUID;
    admin_id UUID;
    student_ids UUID[] := ARRAY[]::UUID[];
    temp_seat_id UUID;
    temp_booking_id UUID;
    temp_user_id UUID;
    s_idx INT;
    floor_record RECORD;
    col INT;
    row INT;
    seat_label TEXT;
    seat_code TEXT;
BEGIN
    -- 1. Insert 5 Floors
    INSERT INTO floors (name, level) VALUES
        ('Ground Floor - Quiet Study Zone', 1)
        RETURNING id INTO f1_id;

    INSERT INTO floors (name, level) VALUES
        ('First Floor - Collaborative Commons', 2)
        RETURNING id INTO f2_id;

    INSERT INTO floors (name, level) VALUES
        ('Second Floor - Silent Research Wing', 3)
        RETURNING id INTO f3_id;

    INSERT INTO floors (name, level) VALUES
        ('Third Floor - Periodicals & Journals', 4)
        RETURNING id INTO f4_id;

    INSERT INTO floors (name, level) VALUES
        ('Fourth Floor - Digital Lab & Media', 5)
        RETURNING id INTO f5_id;

    -- 2. Insert Admin User
    INSERT INTO users (reg_no, name, role) VALUES
        ('12200000', 'Chief Librarian Admin', 'admin')
        RETURNING id INTO admin_id;

    -- 3. Insert 50 Demo Students
    FOR s_idx IN 1..50 LOOP
        INSERT INTO users (reg_no, name, role)
        VALUES (
            LPAD((12200000 + s_idx)::TEXT, 8, '0'),
            'Student ' || s_idx,
            'student'
        )
        RETURNING id INTO temp_user_id;

        student_ids := array_append(student_ids, temp_user_id);
    END LOOP;

    -- 4. Generate 100 Seats per Floor (10 columns x 10 rows grid layout, 500 total)
    FOR floor_record IN 
        SELECT f1_id as id, 1 as lvl, 'F1' as prefix
        UNION ALL
        SELECT f2_id as id, 2 as lvl, 'F2' as prefix
        UNION ALL
        SELECT f3_id as id, 3 as lvl, 'F3' as prefix
        UNION ALL
        SELECT f4_id as id, 4 as lvl, 'F4' as prefix
        UNION ALL
        SELECT f5_id as id, 5 as lvl, 'F5' as prefix
    LOOP
        FOR s_idx IN 1..100 LOOP
            -- Coordinates: 10 cols (1..10), 10 rows (1..10)
            col := ((s_idx - 1) % 10) + 1;
            row := ((s_idx - 1) / 10) + 1;
            seat_label := floor_record.prefix || '-S' || LPAD(s_idx::TEXT, 2, '0');
            seat_code := 'LPU-' || floor_record.prefix || '-' || LPAD(s_idx::TEXT, 3, '0');

            INSERT INTO seats (floor_id, label, x, y, code)
            VALUES (floor_record.id, seat_label, col, row, seat_code);
        END LOOP;
    END LOOP;

    -- 5. Create Sample Active Bookings (for immediate visual feedback on map)
    -- Floor 1 Seat 1: Currently Checked In
    SELECT id INTO temp_seat_id FROM seats WHERE label = 'F1-S01';
    temp_user_id := student_ids[1];
    INSERT INTO bookings (seat_id, user_id, status, booked_at, checked_in_at)
    VALUES (temp_seat_id, temp_user_id, 'checked_in', NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '40 minutes')
    RETURNING id INTO temp_booking_id;
    
    INSERT INTO booking_events (booking_id, seat_id, user_id, event, created_at)
    VALUES 
        (temp_booking_id, temp_seat_id, temp_user_id, 'booked', NOW() - INTERVAL '45 minutes'),
        (temp_booking_id, temp_seat_id, temp_user_id, 'checked_in', NOW() - INTERVAL '40 minutes');

    -- Floor 1 Seat 2: Booked (Awaiting QR Scan, 10 min left)
    SELECT id INTO temp_seat_id FROM seats WHERE label = 'F1-S02';
    temp_user_id := student_ids[2];
    INSERT INTO bookings (seat_id, user_id, status, booked_at, expires_at)
    VALUES (temp_seat_id, temp_user_id, 'booked', NOW() - INTERVAL '5 minutes', NOW() + INTERVAL '10 minutes')
    RETURNING id INTO temp_booking_id;

    INSERT INTO booking_events (booking_id, seat_id, user_id, event, created_at)
    VALUES (temp_booking_id, temp_seat_id, temp_user_id, 'booked', NOW() - INTERVAL '5 minutes');

    -- Floor 1 Seat 3: On Break (14 min left on 20 min timer)
    SELECT id INTO temp_seat_id FROM seats WHERE label = 'F1-S03';
    temp_user_id := student_ids[3];
    INSERT INTO bookings (seat_id, user_id, status, booked_at, checked_in_at, break_started_at, expires_at)
    VALUES (temp_seat_id, temp_user_id, 'on_break', NOW() - INTERVAL '60 minutes', NOW() - INTERVAL '55 minutes', NOW() - INTERVAL '6 minutes', NOW() + INTERVAL '14 minutes')
    RETURNING id INTO temp_booking_id;

    INSERT INTO booking_events (booking_id, seat_id, user_id, event, created_at)
    VALUES 
        (temp_booking_id, temp_seat_id, temp_user_id, 'booked', NOW() - INTERVAL '60 minutes'),
        (temp_booking_id, temp_seat_id, temp_user_id, 'checked_in', NOW() - INTERVAL '55 minutes'),
        (temp_booking_id, temp_seat_id, temp_user_id, 'break_started', NOW() - INTERVAL '6 minutes');

    -- Floor 2 Seat 10 & 11: Checked In
    SELECT id INTO temp_seat_id FROM seats WHERE label = 'F2-S10';
    temp_user_id := student_ids[4];
    INSERT INTO bookings (seat_id, user_id, status, booked_at, checked_in_at)
    VALUES (temp_seat_id, temp_user_id, 'checked_in', NOW() - INTERVAL '120 minutes', NOW() - INTERVAL '115 minutes');

    SELECT id INTO temp_seat_id FROM seats WHERE label = 'F2-S11';
    temp_user_id := student_ids[5];
    INSERT INTO bookings (seat_id, user_id, status, booked_at, checked_in_at)
    VALUES (temp_seat_id, temp_user_id, 'checked_in', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '25 minutes');

    -- 6. Insert Historical Bookings for Admin Analytics (Peak Hours & Hogging)
    -- Seat F1-S05 will be heavily "hogged" (frequent timeouts / breaks)
    SELECT id INTO temp_seat_id FROM seats WHERE label = 'F1-S05';
    FOR s_idx IN 6..15 LOOP
        INSERT INTO bookings (seat_id, user_id, status, booked_at, checked_in_at, break_started_at, expires_at, released_at, release_reason)
        VALUES (
            temp_seat_id,
            student_ids[s_idx],
            'released',
            NOW() - ((s_idx * 6) || ' hours')::INTERVAL,
            NOW() - ((s_idx * 6) - 1 || ' hours')::INTERVAL,
            NOW() - ((s_idx * 6) - 2 || ' hours')::INTERVAL,
            NOW() - ((s_idx * 6) - 2 || ' hours')::INTERVAL + INTERVAL '20 minutes',
            NOW() - ((s_idx * 6) - 2 || ' hours')::INTERVAL + INTERVAL '20 minutes',
            'timeout_break_expired'
        )
        RETURNING id INTO temp_booking_id;

        INSERT INTO booking_events (booking_id, seat_id, user_id, event, created_at)
        VALUES 
            (temp_booking_id, temp_seat_id, student_ids[s_idx], 'booked', NOW() - ((s_idx * 6) || ' hours')::INTERVAL),
            (temp_booking_id, temp_seat_id, student_ids[s_idx], 'break_started', NOW() - ((s_idx * 6) - 2 || ' hours')::INTERVAL),
            (temp_booking_id, temp_seat_id, student_ids[s_idx], 'released', NOW() - ((s_idx * 6) - 2 || ' hours')::INTERVAL + INTERVAL '20 minutes');
    END LOOP;

END $$;
