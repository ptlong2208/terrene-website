import { fetchStrapiSingle, strapiMediaUrl } from "@/lib/strapi";
import type { GlobalData, HomepageData } from "@/lib/types";
import Header from "@/app/components/Header";
import GiantBrandTitle from "@/app/components/GiantBrandTitle";
import HeroVideo from "@/app/components/HeroVideo";
import IntroTextReveal from "@/app/components/IntroTextReveal";
import QuoteReveal from "@/app/components/QuoteReveal";
import SplitTypographySection from "@/app/components/SplitTypographySection";
import TimelineSection from "@/app/components/TimelineSection";
import ShopSection from "@/app/components/ShopSection";

export default async function Home() {
  const [global, homepage] = await Promise.all([
    fetchStrapiSingle<GlobalData>("/api/global", { populate: "*" }),
    fetchStrapiSingle<HomepageData>("/api/homepage", {
      "populate[quote_background]": "true",
      "populate[hero][populate][0]": "background_video",
      "populate[timeline_steps][populate][0]": "image",
      "populate[shop_products][populate][0]": "image",
      "populate[shop_products][populate][1]": "tags",
      "populate[shop_products][populate][2]": "category",
    }),
  ]);
  console.log("Homepage data:", homepage);

  return (
    <main className="bg-cream text-dark font-sans overflow-x-clip">
      <Header
        siteName={global.site_name}
        logo={global.logo}
        ambientAudio={global.ambient_audio}
        navEmail={global.nav_email ?? undefined}
        navLinks={global.nav_links}
        cartCount={0}
      />

      <section className="hero-birchmore relative pt-20 sm:pt-22 md:pt-25 bg-cream overflow-x-clip">
        <GiantBrandTitle title={homepage.hero?.brand_text ?? global.site_name ?? "TERRENE"} />

        {homepage.hero?.background_video ? (
          <HeroVideo src={strapiMediaUrl(homepage.hero.background_video.url)} />
        ) : null}
      </section>

      {homepage.intro_text ? <IntroTextReveal text={homepage.intro_text} /> : null}

      {homepage.quote_text ? (
        <QuoteReveal
          text={homepage.quote_text}
          backgroundUrl={strapiMediaUrl(homepage.quote_background?.url)}
        />
      ) : null}

      <SplitTypographySection
        leftText={homepage.timeline_heading_left ?? "OUR PROCESS"}
        rightText={homepage.timeline_heading_right ?? "THE GREATER JOURNEY"}
      />

      {homepage.timeline_steps?.length > 0 ? (
        <TimelineSection
          steps={homepage.timeline_steps}
          logo={global.logo}
          siteName={global.site_name}
        />
      ) : null}

      {homepage.shop_products?.length > 0 ? (
        <ShopSection
          kicker={homepage.shop_kicker}
          title={homepage.shop_title}
          description={homepage.shop_description}
          viewAllUrl={homepage.shop_view_all_url}
          viewAllLabel={homepage.shop_view_all_label}
          products={homepage.shop_products}
        />
      ) : null}
    </main>
  );
}
