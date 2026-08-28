import { getTranslations } from 'next-intl/server';

import Section from '@/app/components/ui/Section';

import TrackOrderForm from './TrackOrderForm';

export default async function TrackOrderPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'trackOrder' });

  return (
    <Section>
      <div className="mx-auto w-full max-w-md">
        <h1 className="mb-2 text-[clamp(24px,2.8vw,34px)] leading-[1.05] font-semibold tracking-[-0.02em] text-(--green-deep)">
          {t('title')}
        </h1>
        <p className="text-ink-soft mb-8 text-[14px] leading-relaxed">{t('subtitle')}</p>

        <TrackOrderForm />
      </div>
    </Section>
  );
}
