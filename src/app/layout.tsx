import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Library Seat Finder',
  description: 'Code Fuzion 2026 | LPU - Problem M4',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ background: '#ffffff', color: '#000000', margin: 0, padding: 0 }}>
        {/* Full width header and tab bar */}
        <Navigation />

        {/* Content area: max-width 1000px, centered, padding 20px */}
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
          <main>
            {children}
          </main>

          {/* Footer: small grey text with a 1px top border */}
          <footer style={{ marginTop: '40px', paddingTop: '12px', borderTop: '1px solid #d1d5db', fontSize: '12px', color: '#6b7280' }}>
            Library Seat Finder - problem M4
          </footer>
        </div>
      </body>
    </html>
  );
}
