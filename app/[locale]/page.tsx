import { fetchStrapiSingle, strapiMediaUrl } from '@/lib/strapi';
import type { GlobalData, HomepageData } from '@/lib/types';
import Header from '@/app/components/Header';
import HeroSection from '@/app/components/HeroSection';

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const [global, homepage] = await Promise.all([
    fetchStrapiSingle<GlobalData>('/api/global', { populate: '*', locale }),
    fetchStrapiSingle<HomepageData>('/api/homepage', {
      'populate[hero_background_video]': 'true',
      'populate[hero_video_poster]': 'true',
      locale,
    }),
  ]);

  return (
    <main className="bg-cream text-dark font-sans overflow-x-clip">
      <Header
        siteName={global.site_name}
        logo={global.logo ?? undefined}
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
  );
}
