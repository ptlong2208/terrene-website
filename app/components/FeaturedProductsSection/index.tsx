'use client';

import { useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Section from '@/app/components/Section';
import ProductCard from './ProductCard';
import CtaLink from '@/app/components/CtaLink';
import { usePreloaderDone } from '@/app/hooks/usePreloaderDone';
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
  const marqueeRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const preloaderDone = usePreloaderDone();

  useEffect(() => {
    if (!preloaderDone || !marqueeRef.current || !ctaRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const marquee = marqueeRef.current;
    const cta = ctaRef.current;
    const cards = marquee.querySelectorAll('a');

    gsap.set(cards, { y: 46, opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: marquee, start: 'top 78%', once: true },
    })
      .to(marquee, { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' })
      .to(cards, { y: 0, opacity: 1, duration: 0.85, stagger: 0.045, ease: 'power3.out' }, '-=0.35')
      .to(cta, { y: 0, opacity: 1, duration: 0.55, ease: 'power2.out' }, '-=0.45');

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      gsap.set([marquee, cta, ...Array.from(cards)], { clearProps: 'all' });
    };
  }, [preloaderDone]);

  if (!products.length) return null;

  return (
    <Section
      kicker={header?.kicker}
      title={header?.title}
      titleClassName="mb-[clamp(18px,2.5vw,32px)]"
      className="overflow-hidden"
    >
      <div
        ref={marqueeRef}
        className="-mx-gutter overflow-hidden group/marquee opacity-0 translate-y-6"
      >
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

      <div
        ref={ctaRef}
        className="flex justify-center mt-[clamp(14px,1.8vw,22px)] pt-[clamp(14px,1.8vw,24px)] opacity-0 translate-y-4.5"
      >
        <CtaLink href={viewAllHref} label={t('viewAll')} />
      </div>
    </Section>
  );
}
