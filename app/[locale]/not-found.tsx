import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'notFound' });

  return (
    <main className="min-h-screen bg-cream text-dark font-sans flex flex-col items-center justify-center px-6 text-center">
      <h1
        className="font-sans leading-none tracking-[-0.04em] text-matcha select-none"
        style={{ fontSize: 'clamp(120px, 22vw, 320px)' }}
      >
        404
      </h1>

      <div className="w-12 h-px bg-dark opacity-20 my-8" />

      <p className="text-[18px] sm:text-[20px] text-muted leading-relaxed max-w-sm mb-10">
        {t('message')}
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-dark/20 text-[14px] tracking-[0.08em] uppercase font-medium hover:bg-dark hover:text-cream transition-colors duration-300"
      >
        <span>←</span>
        <span>{t('backHome')}</span>
      </Link>
    </main>
  );
}
