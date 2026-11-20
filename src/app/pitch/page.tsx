'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, ChevronRight, Presentation, ShieldCheck, Zap, 
  MapPin, Clock, QrCode, Flame, CheckCircle2, ArrowRight, Play, Award
} from 'lucide-react';

export default function PitchDeckPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    // Slide 1: Cover & Persona Hook
    {
      badge: "LPU Code Fuzion 2026 • Problem M4",
      title: "SeatSync",
      subtitle: "Smart Library Seat Reservation & Anti-Hogging System",
      author: "Built by 1st Year CSE Students • Zero-Hardware Architecture",
      content: (
        <div className="space-y-6 text-center max-w-xl mx-auto py-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center mx-auto shadow-xl shadow-blue-500/20">
            <span className="text-4xl font-black text-white">S</span>
          </div>
          <div className="space-y-2">
            <p className="text-base text-slate-700 leading-relaxed font-medium">
              Exam season library congestion solved: <br className="hidden sm:inline" />
              <strong className="text-slate-900">Zero extra hardware</strong>, <strong className="text-blue-700">zero double bookings</strong>, and <strong className="text-purple-700">automatic ghost-bag release</strong>.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-700 font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Server Ready • Next.js 14 + Supabase Realtime</span>
          </div>
        </div>
      )
    },

    // Slide 2: The Real Campus Problem
    {
      badge: "The Problem",
      title: "The 3-Floor Library Nightmare",
      subtitle: "Why library seats are always full, even when nobody is studying",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h4 className="font-extrabold text-slate-900 text-base">The 3-Floor Trek</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              During exam weeks, students carry heavy backpacks across 3 entire floors searching for an open desk, wasting 20+ minutes of study time.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h4 className="font-extrabold text-slate-900 text-base">The &ldquo;Ghost Bag&rdquo; Hog</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Students drop a notebook or bag at 9:00 AM to reserve a seat, leave for coffee or lectures for 4 hours, and block genuine students.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h4 className="font-extrabold text-slate-900 text-base">Budget Barriers</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Universities cannot afford expensive IoT pressure chairs or ceiling infrared sensors across 1,000+ library desks.
            </p>
          </div>
        </div>
      )
    },

    // Slide 3: The Zero-Hardware Solution
    {
      badge: "The Solution",
      title: "SeatSync: 100% Software-Driven",
      subtitle: "No sensors, no RFID scanners, no app installs needed",
      content: (
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-extrabold text-sm">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Live Floor Map (Updated &lt; 5s)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Check desk availability per floor before you even step into the library. Color-coded green (free), red (occupied), and amber (on break).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-purple-700 font-extrabold text-sm">
                <QrCode className="w-4 h-4 text-purple-600" />
                <span>Phone Camera QR Check-in</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scan the printable QR code sticker placed on each desk using your phone browser. 15-minute confirmation window ensures people are physically present.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-extrabold text-sm">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>20-Minute Fair Break Timer</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Need a washroom or chai break? Click &ldquo;Take Break&rdquo; in the web app. If you don&apos;t return in 20 minutes, the seat auto-releases.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-purple-700 font-extrabold text-sm">
                <Flame className="w-4 h-4 text-purple-600" />
                <span>Anti-Hogging Analytics</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Librarians see which desks are constantly abandoned or timed out, enabling smart disciplinary warnings or floor redesign.
              </p>
            </div>
          </div>
        </div>
      )
    },

    // Slide 4: Concurrency & Atomicity
    {
      badge: "Core Technical Innovation",
      title: "How We Guarantee Zero Double Bookings",
      subtitle: "What happens when 100 students click the same seat at 10:00:00 AM?",
      content: (
        <div className="space-y-4 py-2">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 font-mono text-xs text-emerald-400">
            <span className="text-slate-400">-- The Secret: PostgreSQL Partial Unique Index</span><br />
            <span className="text-blue-400 font-bold">CREATE UNIQUE INDEX</span> idx_seats_single_active_booking <br />
            &nbsp;&nbsp;<span className="text-blue-400 font-bold">ON</span> bookings(seat_id) <br />
            &nbsp;&nbsp;<span className="text-amber-300 font-bold">WHERE status IN (&apos;booked&apos;, &apos;checked_in&apos;, &apos;on_break&apos;);</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-blue-700 font-extrabold block">1. Row Index Lock</span>
              <p className="text-slate-600 text-[11px]">PostgreSQL serializes concurrent inserts on the unique index at the hardware kernel level.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-purple-700 font-extrabold block">2. Exactly 1 Winner</span>
              <p className="text-slate-600 text-[11px]">The first millisecond packet inserts the active row. All 99 others trip the unique constraint (23505).</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-blue-700 font-extrabold block">3. Historical Safety</span>
              <p className="text-slate-600 text-[11px]">Because it&apos;s a PARTIAL index, released seats are excluded, allowing endless re-bookings without deleting history.</p>
            </div>
          </div>
        </div>
      )
    },

    // Slide 5: Live Demo Checklist
    {
      badge: "Viva & Live Demo",
      title: "1-Minute Live Demo Checklist",
      subtitle: "Show this live flow directly to the judges",
      content: (
        <div className="space-y-3 py-2 text-xs">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">1</span>
            <div>
              <strong className="text-slate-900 text-sm">Open Floor Map:</strong> Show Floor 1, 2, 3 layout with live colors and 3-second auto-poll.
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="w-7 h-7 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center shrink-0">2</span>
            <div>
              <strong className="text-slate-900 text-sm">Reserve Seat:</strong> Click a green desk. Show the 15-minute countdown card appear in &ldquo;My Desk&rdquo;.
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">3</span>
            <div>
              <strong className="text-slate-900 text-sm">Check-in with QR:</strong> Scan QR code with phone camera or click auto-fill fallback code. Desk turns Red (Occupied).
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="w-7 h-7 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center shrink-0">4</span>
            <div>
              <strong className="text-slate-900 text-sm">Take a Break:</strong> Click &ldquo;Take 20-min Break&rdquo;. Desk turns Amber. Show the live ticking countdown.
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="w-7 h-7 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold flex items-center justify-center shrink-0">5</span>
            <div>
              <strong className="text-slate-900 text-sm">Fire 100 Students Test:</strong> Go to &ldquo;Demo&rdquo; tab, click &ldquo;Fire 100 Concurrent Bookings&rdquo;. Show judges 1 Winner, 99 Rejected, 0 Duplicates!
            </div>
          </div>
        </div>
      )
    }
  ];

  const slide = slides[currentSlide];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-2">
      {/* Top Slide Navigation Bar */}
      <div className="flex items-center justify-between bg-white border border-slate-200 px-5 py-3.5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <Presentation className="w-5 h-5 text-blue-600" />
          <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Judges Pitch Mode</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
            {currentSlide + 1} / {slides.length}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentSlide((p) => Math.max(0, p - 1))}
              disabled={currentSlide === 0}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 transition"
              title="Previous Slide (Left Arrow)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentSlide((p) => Math.min(slides.length - 1, p + 1))}
              disabled={currentSlide === slides.length - 1}
              className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-30 text-white transition shadow-sm"
              title="Next Slide (Right Arrow or Space)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Slide Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm min-h-[460px] flex flex-col justify-between relative overflow-hidden">
        <div className="space-y-4 relative z-10">
          <div className="inline-block px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            {slide.badge}
          </div>

          <div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {slide.title}
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              {slide.subtitle}
            </p>
          </div>

          <div className="pt-2">
            {slide.content}
          </div>
        </div>

        {/* Slide Footer */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between relative z-10">
          <div className="flex gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === idx ? 'w-8 bg-blue-600' : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/map"
              className="inline-flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 transition font-bold"
            >
              <Play className="w-3.5 h-3.5 text-emerald-600" />
              <span>Launch Live Map</span>
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-1.5 text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl transition font-bold shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Load Test</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
