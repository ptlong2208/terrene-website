import { notFound } from 'next/navigation';

import BenefitsSection from '@/app/components/BenefitsSection';
import FeaturedProductsSection from '@/app/components/FeaturedProductsSection';
import HeroSection from '@/app/components/HeroSection';
import JournalSection from '@/app/components/JournalSection';
import PartnersSection from '@/app/components/PartnersSection';
import ProcessSection from '@/app/components/ProcessSection';
import QuoteSection from '@/app/components/QuoteSection';
import StorySection from '@/app/components/StorySection';
import TestimonialsSection from '@/app/components/TestimonialsSection';
import { SITE_URL } from '@/lib/config';
import { fetchProductPricesBySlugs } from '@/lib/haravan';
import { getGlobal, getHomepage } from '@/lib/sanity-queries';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const [homepage, global] = await Promise.all([getHomepage(locale), getGlobal(locale)]);

  if (!homepage) notFound();

  const featuredProducts = homepage.shop_products.slice(0, 6);
  const productPrices = await fetchProductPricesBySlugs(featuredProducts.map((p) => p.slug));

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: global.site_name,
      url: SITE_URL,
      email: global.email ?? undefined,
      sameAs: global.social_links.map((l) => l.url),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: global.site_name,
      url: SITE_URL,
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection
        title={homepage.hero_title ?? undefined}
        description={homepage.hero_description ?? undefined}
        videoUrl={homepage.hero_background_video?.url}
        posterUrl={homepage.hero_video_poster?.url}
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
