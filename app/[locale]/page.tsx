import { getTranslations } from 'next-intl/server';
import { fetchStrapiSingle, strapiMediaUrl } from '@/lib/strapi';
import type { GlobalData, HomepageData } from '@/lib/types';
import Header from '@/app/components/Header';
import HeroSection from '@/app/components/HeroSection';
import Preloader from '@/app/components/Preloader';
import { redirect } from 'next/navigation';

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/coming-soon`);

  const [t, global, homepage] = await Promise.all([
    getTranslations({ locale, namespace: 'preloader' }),
    fetchStrapiSingle<GlobalData>('/api/global', { populate: '*', locale }),
    fetchStrapiSingle<HomepageData>('/api/homepage', {
      'populate[hero_background_video]': 'true',
      'populate[hero_video_poster]': 'true',
      locale,
    }),
  ]);

  return (
    <>
      <Preloader siteName={global.site_name} quote={global.loader_quote ?? t('quote')} />
      <main className="bg-cream text-dark font-sans overflow-x-clip">
        <Header
          siteName={global.site_name}
          ambientAudio={global.ambient_audio ?? undefined}
          navLinks={global.nav_links}
          navShopLink={global.nav_shop_link ?? undefined}
          navCartLabel={global.nav_cart_label ?? undefined}
          cartCount={0}
          musicConsentText={global.music_consent_text}
          musicConsentAccept={global.music_consent_accept}
          musicConsentDecline={global.music_consent_decline}
        />
        <HeroSection
          title={homepage.hero_title ?? undefined}
          description={homepage.hero_description ?? undefined}
          videoUrl={strapiMediaUrl(homepage.hero_background_video?.url)}
          posterUrl={strapiMediaUrl(homepage.hero_video_poster?.url)}
          posterAlt={homepage.hero_title ?? undefined}
        />
      </main>
    </>
  );
}
