"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import type { ShopProduct } from "@/lib/types";
import ProductCard from "@/app/components/ProductCard";
import Link from "next/link";

interface Props {
  kicker?: string | null;
  title?: string | null;
  description?: string | null;
  viewAllUrl?: string | null;
  viewAllLabel?: string | null;
  products: ShopProduct[];
}

export default function ShopSection({ kicker, title, description, viewAllUrl, viewAllLabel, products }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!sectionRef.current || !trackRef.current || !viewportRef.current) return;

    const track = trackRef.current;
    const viewport = viewportRef.current;

    const getScrollAmount = () => -(track.scrollWidth - viewport.clientWidth);
    const tween = gsap.to(track, { x: getScrollAmount, ease: "none" });

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: () => `+=${getScrollAmount() * -1}`,
        pin: true,
        animation: tween,
        scrub: 1,
        anticipatePin: 1,
        refreshPriority: 2,
        invalidateOnRefresh: true,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [products]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-cream z-20 h-screen flex flex-col box-border py-6 pl-5 md:py-8 md:pl-8"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 pr-5 mb-6 md:flex-row md:justify-between md:pr-8 md:mb-8 md:gap-16 lg:gap-32">
        {/* Left */}
        <div className="flex flex-col max-w-full md:max-w-lg justify-between gap-1.25">
          {kicker && (
            <span className="leading-5.5">
              {kicker}
            </span>
          )}
          {title && 
            <h2
              className="text-[clamp(40px,5.5vw,80px)] font-extrabold uppercase leading-[0.95] tracking-[-0.035em]"
            >
              {title}
            </h2>}
        </div>

        {/* Right */}
        <div className="flex flex-col justify-between items-start gap-4 md:items-end md:gap-12 md:max-w-94">
          {viewAllUrl && viewAllLabel && (
            <Link
              href={viewAllUrl}
              className="order-last md:order-first flex items-center gap-2 text-[14px] font-extrabold uppercase tracking-[0.05em] text-dark leading-none"
            >
              {viewAllLabel}{" "}
              <span className="text-[18px] font-normal transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                ↗
              </span>
            </Link>
          )}
          {description && (
            <p className="order-first md:order-last text-[14px] leading-[1.6] opacity-[0.72]">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Track viewport */}
      <div
        ref={viewportRef}
        className="flex-1 min-h-0 flex items-center overflow-hidden border-t border-b border-dark/15"
      >
        <div ref={trackRef} className="flex h-full pr-16 w-max">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
