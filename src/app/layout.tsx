import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'SeatSync - Smart Library Seat Booking',
  description: 'Real-time library seat reservation system with concurrency control and anti-hogging detection.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased">
        <Navigation />
        <main className="flex-1 pb-20 sm:pb-8 max-w-5xl mx-auto w-full px-4 pt-4">
          {children}
        </main>
      </body>
    </html>
  );
}
