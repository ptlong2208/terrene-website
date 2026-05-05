"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface SplitTypographySectionProps {
  leftText: string;
  rightText: string;
}

export default function SplitTypographySection({
  leftText,
  rightText,
}: SplitTypographySectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLHeadingElement>(null);
  const rightRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !leftRef.current || !rightRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        leftRef.current,
        { x: "-50vw" },
        {
          x: "50vw",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        }
      );

      gsap.fromTo(
        rightRef.current,
        { x: "50vw" },
        {
          x: "-50vw",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="split-text-container relative z-12 flex w-full flex-col gap-6 overflow-hidden bg-cream px-16 py-40"
    >
      <h2
        ref={leftRef}
        className="split-left text-[7.5vw] font-normal tracking-[-0.04em] leading-none whitespace-nowrap text-dark uppercase m-0 text-left"
      >
        {leftText}
      </h2>
      <h2
        ref={rightRef}
        className="split-right text-[7.5vw] font-normal tracking-[-0.04em] leading-none whitespace-nowrap text-dark uppercase m-0 text-right"
      >
        {rightText}
      </h2>
    </section>
  );
}
