import '@fontsource-variable/mona-sans/index.css';
import '../globals.css';

import type { Metadata } from 'next';
import { Faculty_Glyphic } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import SmoothScroll from '@/app/components/ui/SmoothScroll';
import { routing } from '@/i18n/routing';

const facultyGlyphic = Faculty_Glyphic({
  variable: '--font-faculty-glyphic',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Terrene | The Ritual of Matcha',
  description: 'The Ritual of Matcha',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }
  const messages = await getMessages();
  return (
    <html lang={locale} className={`${facultyGlyphic.variable} antialiased`}>
      <body className="min-h-screen">
        <NextIntlClientProvider messages={messages}>
          <SmoothScroll />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
