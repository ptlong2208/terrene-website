import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import ComingSoonContent from '@/app/components/ComingSoonContent';
import { fetchStrapiSingle } from '@/lib/strapi';
import type { ComingSoonData, GlobalData } from '@/lib/types';

type Props = { params: Promise<{ locale: string }> };

async function fetchComingSoonData(locale: string) {
  return fetchStrapiSingle<ComingSoonData>('/api/coming-soon', {
    populate: '*',
    locale,
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'comingSoon' });
  try {
    const data = await fetchComingSoonData(locale);
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

  const [global, comingSoon] = await Promise.all([
    fetchStrapiSingle<Pick<GlobalData, 'site_name'>>(
      '/api/global',
      { 'fields[0]': 'site_name', locale },
    ),
    fetchComingSoonData(locale).catch(() => null),
  ]);

  return (
    <ComingSoonContent
      siteName={global.site_name}
      data={comingSoon}
    />
  );
}
