import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Library Seat Finder | Code Fuzion 2026',
  description: 'Smart Library Seat Management with Autonomous QR Check-ins, 20-min Break Tracking, and Ghost Desk Auto-Release.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navigation />

        <div className="app-container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 20px 48px' }}>
          <main>{children}</main>

          <footer
            style={{
              marginTop: '48px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(226, 232, 240, 0.9)',
              fontSize: '13px',
              color: '#64748b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              <strong>Library Seat Finder (SeatSync)</strong> — Code Fuzion 2026 (Problem M4)
            </div>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <span>15m QR Hold</span>
              <span>•</span>
              <span>20m Break Timeout</span>
              <span>•</span>
              <span>5 Floors (500 Desks)</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
