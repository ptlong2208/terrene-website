import { getTranslations } from 'next-intl/server';

import CartClearer from '@/app/components/CartClearer';
import PurchaseTracker from '@/app/components/PurchaseTracker';
import TerreneLogo from '@/app/components/TerreneLogo';
import CtaLink from '@/app/components/ui/CtaLink';
import Section from '@/app/components/ui/Section';

export default async function CheckoutSuccessPage() {
  const t = await getTranslations('checkout');

  return (
    <Section>
      <CartClearer />
      <PurchaseTracker />
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6 py-16 text-center">
        <TerreneLogo className="size-12 shrink-0 text-(--green-deep)" />
        <h1 className="text-[clamp(24px,2.8vw,34px)] leading-[1.05] font-semibold tracking-[-0.02em] text-(--green-deep)">
          {t('successTitle')}
        </h1>
        <p className="text-ink-soft text-[clamp(14px,1.15vw,17px)] leading-normal font-normal">
          {t('successMessage')}
        </p>
        <CtaLink href="/shop" label={t('successCta')} className="mt-[clamp(28px,3.5vh,44px)]" />
      </div>
    </Section>
  );
}
