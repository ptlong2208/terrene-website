import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'notFound' });

  return (
    <main className="bg-cream text-dark flex min-h-screen flex-col items-center justify-center px-6 text-center font-sans">
      <h1
        className="text-matcha font-sans leading-none tracking-[-0.04em] select-none"
        style={{ fontSize: 'clamp(120px, 22vw, 320px)' }}
      >
        404
      </h1>

      <div className="bg-dark my-8 h-px w-12 opacity-20" />

      <p className="text-muted mb-10 max-w-sm text-[18px] leading-relaxed sm:text-[20px]">
        {t('message')}
      </p>

      <Link
        href="/"
        className="border-dark/20 hover:bg-dark hover:text-cream inline-flex items-center gap-2 rounded-full border px-7 py-3 text-[14px] font-medium tracking-[0.08em] uppercase transition-colors duration-300"
      >
        <span>←</span>
        <span>{t('backHome')}</span>
      </Link>
    </main>
  );
}
