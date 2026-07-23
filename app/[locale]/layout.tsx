import '@fontsource-variable/mona-sans/index.css';
import '../globals.css';

import type { Metadata } from 'next';
import { Faculty_Glyphic } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import CookieConsent from '@/app/components/CookieConsent';
import SmoothScroll from '@/app/components/ui/SmoothScroll';
import { routing } from '@/i18n/routing';
import { fetchStrapiSingle } from '@/lib/strapi';
import type { GlobalData } from '@/lib/types';

const facultyGlyphic = Faculty_Glyphic({
  variable: '--font-faculty-glyphic',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const global = await fetchStrapiSingle<GlobalData>('/api/global', { locale });
  return {
    title: global.site_name,
    description: global.site_description ?? undefined,
  };
}

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
          <CookieConsent gaId={process.env.NEXT_PUBLIC_GA_ID ?? ''} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
