import { getTranslations } from 'next-intl/server';
import { fetchStrapiSingle, strapiMediaUrl } from '@/lib/strapi';
import type { GlobalData, HomepageData } from '@/lib/types';
import Header from '@/app/components/Header';
import HeroSection from '@/app/components/HeroSection';
import StorySection from '@/app/components/StorySection';
import FeaturedProductsSection from '@/app/components/FeaturedProductsSection';
import BenefitsSection from '@/app/components/BenefitsSection';
import ProcessSection from '@/app/components/ProcessSection';
import QuoteSection from '@/app/components/QuoteSection';
import PartnersSection from '@/app/components/PartnersSection';
import TestimonialsSection from '@/app/components/TestimonialsSection';
import Preloader from '@/app/components/Preloader';

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const [t, global, homepage] = await Promise.all([
    getTranslations({ locale, namespace: 'preloader' }),
    fetchStrapiSingle<GlobalData>('/api/global', { populate: '*', locale }),
    fetchStrapiSingle<HomepageData>('/api/homepage', {
      'populate[hero_background_video]': 'true',
      'populate[hero_video_poster]': 'true',
      'populate[story_header]': 'true',
      'populate[story_image]': 'true',
      'populate[story_cta]': 'true',
      'populate[shop_header]': 'true',
      'populate[shop_products][populate][image]': 'true',
      'populate[shop_products][populate][tags]': 'true',
      'populate[shop_products][populate][category]': 'true',
      'populate[benefits_header]': 'true',
      'populate[benefits_items]': 'true',
      'populate[process_header]': 'true',
      'populate[process_steps][populate][image]': 'true',
      'populate[process_cta]': 'true',
      'populate[partners_header]': 'true',
      'populate[partners_items][populate][image]': 'true',
      'populate[testimonials_header]': 'true',
      'populate[testimonials_items][populate][image]': 'true',
      locale,
    }),
  ]);

  return (
    <>
      <Preloader siteName={global.site_name} quote={global.loader_quote ?? t('quote')} />
      <main className="bg-cream text-ink-soft font-sans overflow-x-clip">
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
        <div className="relative z-1 bg-cream">
          <StorySection
            header={homepage.story_header}
            image={homepage.story_image}
            sideLabel={homepage.story_side_label}
            body={homepage.story_body}
            cta={homepage.story_cta}
          />
          <FeaturedProductsSection
            header={homepage.shop_header}
            products={homepage.shop_products.slice(0, 6)}
          />
          <BenefitsSection
            header={homepage.benefits_header}
            items={homepage.benefits_items}
          />
          <ProcessSection
            header={homepage.process_header}
            steps={homepage.process_steps}
            cta={homepage.process_cta}
          />
          <QuoteSection
            quote={homepage.quote_text}
            attribution={homepage.quote_attribution}
          />
          <PartnersSection
            header={homepage.partners_header}
            partners={homepage.partners_items}
          />
          <TestimonialsSection
            header={homepage.testimonials_header}
            testimonials={homepage.testimonials_items}
          />
        </div>
      </main>
    </>
  );
}
