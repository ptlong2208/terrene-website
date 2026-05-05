"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface QuoteRevealProps {
  text: string;
  backgroundUrl?: string;
}

export default function QuoteReveal({ text, backgroundUrl }: QuoteRevealProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !quoteRef.current) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(max-width: 767px)", () => {
        if (!backgroundRef.current) return;

        gsap.fromTo(
          backgroundRef.current,
          { y: "-8%" },
          {
            y: "8%",
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });

      gsap.fromTo(
        quoteRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            end: "bottom 75%",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      return () => mm.revert();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="section-three relative z-11 mt-[calc(300vh+64px)]">
      <div ref={sectionRef} className="relative flex h-screen items-center justify-center overflow-hidden">
        {backgroundUrl ? (
          <>
            <div
              className="absolute inset-0 hidden md:block bg-cover bg-center bg-fixed"
              style={{ backgroundImage: `url(${backgroundUrl})` }}
            />
            <div ref={backgroundRef} className="absolute inset-0 md:hidden scale-[1.12] will-change-transform">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${backgroundUrl})` }}
              />
            </div>
          </>
        ) : (
          <div className="absolute inset-0 bg-[#D9D9D9]" />
        )}

        <div className="quote-container relative z-2 px-6 sm:px-8 md:px-12 lg:px-16 text-center text-white mix-blend-difference">
          <h2
            ref={quoteRef}
            id="quote-reveal"
            className="mx-auto max-w-250 text-balance text-[clamp(1.5rem,3.5vw,3rem)] font-medium leading-[1.2] tracking-[-0.03em] opacity-0"
          >
            {text}
          </h2>
        </div>
      </div>
    </section>
  );
}
