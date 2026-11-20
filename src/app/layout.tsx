import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'SeatSync',
  description: 'Library seat booking',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ background: '#ffffff', color: '#000000', margin: 0, padding: 0 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px' }}>
          <Navigation />
          <main style={{ marginTop: '16px' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
