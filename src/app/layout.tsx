import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'SeatSync - Smart Library Seat Booking',
  description: 'Real-time university library seat booking and anti-hogging engine with concurrency safety.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased">
        <Navigation />
        <main className="flex-1 pb-20 sm:pb-10 max-w-5xl mx-auto w-full px-4 pt-6">
          {children}
        </main>
      </body>
    </html>
  );
}
