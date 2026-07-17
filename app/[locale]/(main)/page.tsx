import BenefitsSection from '@/app/components/BenefitsSection';
import FeaturedProductsSection from '@/app/components/FeaturedProductsSection';
import HeroSection from '@/app/components/HeroSection';
import JournalSection from '@/app/components/JournalSection';
import PartnersSection from '@/app/components/PartnersSection';
import ProcessSection from '@/app/components/ProcessSection';
import QuoteSection from '@/app/components/QuoteSection';
import StorySection from '@/app/components/StorySection';
import TestimonialsSection from '@/app/components/TestimonialsSection';
import { fetchProductPricesBySlugs } from '@/lib/haravan';
import { fetchStrapiSingle, strapiMediaUrl } from '@/lib/strapi';
import type { HomepageData } from '@/lib/types';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const homepage = await fetchStrapiSingle<HomepageData>('/api/homepage', {
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
    'populate[partners_items]': 'true',
    'populate[testimonials_header]': 'true',
    'populate[testimonials_items][populate][image]': 'true',
    'populate[journal_header]': 'true',
    'populate[journal_view_all]': 'true',
    'populate[journal_posts][populate][cover_image]': 'true',
    'populate[journal_posts][populate][category]': 'true',
    locale,
  });

  const featuredProducts = homepage.shop_products.slice(0, 6);
  const productPrices = await fetchProductPricesBySlugs(featuredProducts.map((p) => p.slug));

  return (
    <>
      <HeroSection
        title={homepage.hero_title ?? undefined}
        description={homepage.hero_description ?? undefined}
        videoUrl={strapiMediaUrl(homepage.hero_background_video?.url)}
        posterUrl={strapiMediaUrl(homepage.hero_video_poster?.url)}
        posterAlt={homepage.hero_title ?? undefined}
      />
      <div className="bg-cream relative z-1">
        <StorySection
          header={homepage.story_header}
          image={homepage.story_image}
          sideLabel={homepage.story_side_label}
          body={homepage.story_body}
          cta={homepage.story_cta}
        />
        <FeaturedProductsSection
          header={homepage.shop_header}
          products={featuredProducts}
          productPrices={productPrices}
        />
        <BenefitsSection header={homepage.benefits_header} items={homepage.benefits_items} />
        <ProcessSection
          header={homepage.process_header}
          steps={homepage.process_steps}
          cta={homepage.process_cta}
        />
        <QuoteSection quote={homepage.quote_text} attribution={homepage.quote_attribution} />
        <PartnersSection header={homepage.partners_header} partners={homepage.partners_items} />
        <TestimonialsSection
          header={homepage.testimonials_header}
          testimonials={homepage.testimonials_items}
        />
        <JournalSection
          header={homepage.journal_header}
          viewAll={homepage.journal_view_all}
          posts={homepage.journal_posts}
        />
      </div>
    </>
  );
}
