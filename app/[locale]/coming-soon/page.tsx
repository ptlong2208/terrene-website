import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import ComingSoonContent from '@/app/components/ComingSoonContent';
import Preloader from '@/app/components/Preloader';
import { getComingSoon, getGlobalMinimal } from '@/lib/sanity-queries';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'comingSoon' });
  try {
    const data = await getComingSoon(locale);
    if (!data) throw new Error('Coming soon data not found');
    return {
      title: data.seo_title ?? t('seoTitle'),
      description: data.seo_description ?? t('seoDescription'),
    };
  } catch {
    return { title: t('seoTitle'), description: t('seoDescription') };
  }
}

export default async function ComingSoonPage({ params }: Props) {
  const { locale } = await params;

  const [t, global, comingSoon] = await Promise.all([
    getTranslations({ locale, namespace: 'preloader' }),
    getGlobalMinimal(locale),
    getComingSoon(locale).catch(() => null),
  ]);

  return (
    <>
      <Preloader siteName={global.site_name} quote={global.loader_quote ?? t('quote')} />
      <ComingSoonContent siteName={global.site_name} data={comingSoon} />
    </>
  );
}
