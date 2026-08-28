import '@fontsource-variable/mona-sans/index.css';
import '../globals.css';

import type { Metadata } from 'next';
import { Faculty_Glyphic } from 'next/font/google';

const facultyGlyphic = Faculty_Glyphic({
  variable: '--font-faculty-glyphic',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Terrene Admin',
  description: 'Internal admin tools for Terrene.',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${facultyGlyphic.variable} antialiased`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
