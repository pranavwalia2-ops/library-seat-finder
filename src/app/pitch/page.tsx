'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PitchDeckPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "SeatSync: Problem Statement",
      content: (
        <div>
          <p>During exams, students walk across 5 library floors searching for open seats.</p>
          <p>Seats are frequently blocked by bags left for hours without anyone studying.</p>
          <p>IoT sensors and hardware are too expensive for 1,000+ library seats.</p>
        </div>
      )
    },
    {
      title: "Our Solution",
      content: (
        <div>
          <p>1. Live floor map of seats updating every 3 seconds.</p>
          <p>2. QR check-in using phone camera or manual code entry.</p>
          <p>3. 20-minute break timer with automatic seat release.</p>
          <p>4. No extra hardware required.</p>
        </div>
      )
    },
    {
      title: "Concurrency: Preventing Double Bookings",
      content: (
        <div>
          <p>We use a PostgreSQL partial unique index:</p>
          <pre style={{ background: '#f3f4f6', padding: '8px', border: '1px solid #ccc', fontSize: '14px' }}>
{`CREATE UNIQUE INDEX idx_seats_single_active_booking 
ON bookings(seat_id) 
WHERE status IN ('booked', 'checked_in', 'on_break');`}
          </pre>
          <p>
            When 100 concurrent booking requests fire for the same seat, Postgres takes an index-level lock. Exactly 1 transaction succeeds and 99 fail with error code 23505.
          </p>
        </div>
      )
    },
    {
      title: "Anti-Hogging & Auto-Release",
      content: (
        <div>
          <p>1. 15-minute hold for QR check-in.</p>
          <p>2. 20-minute break limit.</p>
          <p>3. Automatic release evaluated lazily on each map read and on cron.</p>
          <p>4. Admin view tracks top 10 hogged seats based on break ratio and timeouts.</p>
        </div>
      )
    }
  ];

  return (
    <div>
      <h1>Presentation notes</h1>
      <p style={{ margin: '4px 0 16px 0' }}>Slide {currentSlide + 1} of {slides.length}</p>

      <div style={{ border: '1px solid #000000', padding: '16px', maxWidth: '640px', minHeight: '220px' }}>
        <h2>{slides[currentSlide].title}</h2>
        {slides[currentSlide].content}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button
          onClick={() => setCurrentSlide((p) => Math.max(0, p - 1))}
          disabled={currentSlide === 0}
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentSlide((p) => Math.min(slides.length - 1, p + 1))}
          disabled={currentSlide === slides.length - 1}
          className="primary"
        >
          Next
        </button>
        <span style={{ marginLeft: 'auto' }}>
          <Link href="/map">Go to Map</Link>
        </span>
      </div>
    </div>
  );
}
