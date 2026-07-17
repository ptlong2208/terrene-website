'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProductCard from '@/app/components/FeaturedProductsSection/ProductCard';
import type { ShopProduct, ShopCategory } from '@/lib/types';
import { CategoryFilter, SortMode } from './constants';
import CategoryBar from './CategoryBar';
import Dropdown from '@/app/components/Dropdown';

export { CategoryFilter, SortMode } from './constants';

interface ShopCatalogProps {
  products: ShopProduct[];
  categories: ShopCategory[];
  prices: Record<string, number>;
  locale: string;
}

export default function ShopCatalog({ products, categories, prices, locale }: ShopCatalogProps) {
  const t = useTranslations('shop');
  const [activeCategory, setActiveCategory] = useState<string>(CategoryFilter.All);
  const [sortMode, setSortMode] = useState<SortMode>(SortMode.Default);

  const barRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) {
      const id = p.category?.documentId;
      if (id) counts[id] = (counts[id] ?? 0) + 1;
    }
    return counts;
  }, [products]);

  const filtered = useMemo(() => {
    let list =
      activeCategory === CategoryFilter.All
        ? products
        : products.filter(p => p.category?.documentId === activeCategory);

    if (sortMode === SortMode.PriceAsc) {
      list = [...list].sort((a, b) => (prices[a.slug] ?? 0) - (prices[b.slug] ?? 0));
    } else if (sortMode === SortMode.PriceDesc) {
      list = [...list].sort((a, b) => (prices[b.slug] ?? 0) - (prices[a.slug] ?? 0));
    }

    return list;
  }, [products, prices, activeCategory, sortMode]);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    gsap.from(Array.from(bar.children), {
      opacity: 0, y: 18, duration: 0.8, stagger: 0.08, ease: 'power3.out', delay: 0.1,
    });
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      gsap.registerPlugin(ScrollTrigger);
      const cards = grid.querySelectorAll('article');
      gsap.set(cards, { opacity: 0, y: 30 });
      ScrollTrigger.create({
        trigger: grid,
        start: 'top 85%',
        once: true,
        onEnter: () =>
          gsap.to(cards, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out' }),
      });
    } else {
      gsap.fromTo(grid, { opacity: 0.5 }, { opacity: 1, duration: 0.35, ease: 'power2.out' });
    }
  }, [filtered]);

  const sortOptions = [
    { value: SortMode.Default, label: t('sortDefault') },
    { value: SortMode.PriceAsc, label: t('sortPriceAsc') },
    { value: SortMode.PriceDesc, label: t('sortPriceDesc') },
  ] as const satisfies { value: SortMode; label: string }[];

  return (
    <div className="pt-16">
      <div
        ref={barRef}
        className="relative z-10 flex items-center justify-between flex-wrap gap-4 px-gutter pt-[clamp(48px,8vh,100px)] pb-[clamp(32px,5vh,56px)]"
      >
        <CategoryBar
          categories={categories}
          categoryCounts={categoryCounts}
          totalCount={products.length}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
          allProductsLabel={t('allProducts')}
        />
        <Dropdown
          label={t('sort')}
          value={sortMode}
          options={sortOptions}
          onChange={setSortMode}
        />
      </div>

      <div
        ref={gridRef}
        className="grid grid-cols-2 max-[520px]:grid-cols-1 gap-x-[clamp(20px,2.4vw,40px)] gap-y-[clamp(28px,3.5vh,48px)] px-gutter pb-[clamp(80px,12vh,160px)] max-w-365 mx-auto"
      >
        {filtered.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            href={`/${locale}/shop/${product.slug}`}
            minPrice={prices[product.slug]}
            className="flex flex-col"
            sizes="(max-width: 520px) 100vw, 50vw"
          />
        ))}
      </div>
    </div>
  );
}
