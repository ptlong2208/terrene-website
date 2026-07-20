import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import TerreneLogo from '@/app/components/TerreneLogo';
import CtaLink from '@/app/components/ui/CtaLink';
import Section from '@/app/components/ui/Section';
import SlotText from '@/app/components/ui/SlotText';

export default async function CheckoutCancelPage() {
  const t = await getTranslations('checkout');

  return (
    <Section>
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6 py-16 text-center">
        <TerreneLogo className="size-12 shrink-0 text-(--green-deep)" />
        <h1 className="text-[clamp(24px,2.8vw,34px)] leading-[1.05] font-semibold tracking-[-0.02em] text-(--green-deep)">
          {t('cancelTitle')}
        </h1>
        <p className="text-ink-soft text-[clamp(14px,1.15vw,17px)] leading-normal font-normal">
          {t('cancelMessage')}
        </p>
        <div className="mt-[clamp(28px,3.5vh,44px)] flex flex-wrap items-center justify-center gap-6">
          <Link
            href="/checkout"
            className="group text-cream inline-flex items-center justify-center overflow-hidden bg-(--green-deep) px-8 py-3 text-[16px] tracking-[-0.02em] transition-opacity hover:opacity-85"
          >
            <SlotText text={t('cancelCta')} />
          </Link>
          <CtaLink href="/shop" label={t('cancelShop')} />
        </div>
      </div>
    </Section>
  );
}
