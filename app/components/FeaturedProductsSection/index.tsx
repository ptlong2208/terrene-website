'use client';

import { useTranslations } from 'next-intl';
import Section from '@/app/components/Section';
import ProductCard from './ProductCard';
import CtaLink from '@/app/components/CtaLink';
import type { ShopProduct, SectionHeaderData } from '@/lib/types';
import styles from './index.module.css';

interface FeaturedProductsSectionProps {
  header?: SectionHeaderData | null;
  products?: ShopProduct[];
  viewAllHref?: string;
}

export default function FeaturedProductsSection({
  header,
  products = [],
  viewAllHref = '/shop',
}: FeaturedProductsSectionProps) {
  const t = useTranslations('shop');

  if (!products.length) return null;

  return (
    <Section
      kicker={header?.kicker}
      title={header?.title}
      titleClassName="mb-[clamp(18px,2.5vw,32px)]"
      className="overflow-hidden"
    >
      <div className="-mx-gutter overflow-hidden group/marquee">
        <div className={`flex w-max motion-reduce:animate-none group-hover/marquee:[animation-play-state:paused] ${styles.track}`}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} href={`/shop/${product.slug}`} viewProductLabel={t('viewProduct')} />
          ))}
          {products.map((product) => (
            <ProductCard
              key={`dup-${product.id}`}
              product={product}
              href={`/shop/${product.slug}`}
              tabIndex={-1}
              ariaHidden={true}
              viewProductLabel={t('viewProduct')}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-[clamp(14px,1.8vw,22px)] pt-[clamp(14px,1.8vw,24px)]">
        <CtaLink href={viewAllHref} label={t('viewAll')} />
      </div>
    </Section>
  );
}
