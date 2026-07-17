import { getTranslations } from 'next-intl/server';

import CartDrawer from '@/app/components/CartDrawer';
import CtaSection from '@/app/components/CtaSection';
import Footer from '@/app/components/Footer';
import Header from '@/app/components/Header';
import Preloader from '@/app/components/Preloader';
import { fetchStrapiSingle } from '@/lib/strapi';
import type { GlobalData } from '@/lib/types';

export default async function MainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [t, global] = await Promise.all([
    getTranslations({ locale, namespace: 'preloader' }),
    fetchStrapiSingle<GlobalData>('/api/global', { populate: '*', locale }),
  ]);

  return (
    <>
      <Preloader siteName={global.site_name} quote={global.loader_quote ?? t('quote')} />
      <main className="bg-cream text-ink-soft overflow-x-clip font-sans">
        <Header
          siteName={global.site_name}
          ambientAudio={global.ambient_audio ?? undefined}
          navLinks={global.nav_links}
          navShopLink={global.nav_shop_link ?? undefined}
          navCartLabel={global.nav_cart_label ?? undefined}
          navOverlayImage={global.nav_overlay_image}
          musicConsentText={global.music_consent_text}
          musicConsentAccept={global.music_consent_accept}
          musicConsentDecline={global.music_consent_decline}
        />
        {children}
        <div className="bg-cream relative z-1">
          <CtaSection header={global.cta_header} link={global.cta_link} />
          <Footer
            siteName={global.site_name}
            legalLinks={global.footer_legal_links}
            newsletterLabel={global.footer_newsletter_label}
            newsletterPlaceholder={global.footer_newsletter_placeholder}
          />
        </div>
      </main>
      <CartDrawer />
    </>
  );
}
