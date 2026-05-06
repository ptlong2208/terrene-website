"use client";

import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Image from "next/image";
import type { StrapiMedia, TimelineStep } from "@/lib/types";
import { strapiMediaUrl } from "@/lib/strapi";

interface Props {
  steps: TimelineStep[];
  logo?: StrapiMedia | null;
  siteName?: string | null;
}

const LAYER_COLORS = [
  { bg: "#DFDDD1", color: "#1A1A1A" },
  { bg: "#9FB878", color: "#1A1A1A" },
  { bg: "#799851", color: "#ffffff" },
  { bg: "#47622A", color: "#ffffff" },
  { bg: "#374426", color: "#ffffff" },
];

export default function TimelineSection({ steps, logo, siteName }: Props) {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!sectionRef.current || steps.length === 0) return;

    const ctx = gsap.context(() => {
      const layers = gsap.utils.toArray<HTMLDivElement>(".step-layer");
      if (!layers.length) return;

      const firstLayerQ = gsap.utils.selector(layers[0]);
      const firstChars = firstLayerQ<HTMLElement>(".split-char");
      const firstWords = firstLayerQ<HTMLElement>(".split-word");
      gsap.set(firstChars, { opacity: 1, y: 0 });
      gsap.set(firstWords, { opacity: 1, y: 0 });

      layers.forEach((layer, i) => {
        const layerQ = gsap.utils.selector(layer);
        const chars = layerQ<HTMLElement>(".split-char");
        const words = layerQ<HTMLElement>(".split-word");
        const img = layerQ<HTMLElement>(".media-image")[0] ?? null;

        if (i > 0) {
          gsap.set(chars, { opacity: 0, y: 30 });
          gsap.set(words, { opacity: 0, y: 15 });
          if (img) gsap.set(img, { scale: 1.2 });

          ScrollTrigger.create({
            trigger: layer,
            start: "top 60%",
            onEnter: () => {
              gsap.to(chars, { opacity: 1, y: 0, duration: 0.6, stagger: 0.02, ease: "power3.out" });
              gsap.to(words, { opacity: 1, y: 0, duration: 0.6, stagger: 0.02, ease: "power3.out" });
              if (img) gsap.to(img, { scale: 1, duration: 1.2, ease: "power2.out" });
            },
            onLeaveBack: () => {
              gsap.to(chars, { opacity: 0, y: 30, duration: 0.3 });
              gsap.to(words, { opacity: 0, y: 15, duration: 0.3 });
              if (img) gsap.to(img, { scale: 1.2, duration: 0.5 });
            },
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [steps]);

  return (
    <section ref={sectionRef} className="timeline-wrapper relative w-full" style={{ zIndex: 5 }}>
      <div className="timeline-sticky relative w-full">
        {steps.map((step, i) => {
          const layerColor = LAYER_COLORS[i % LAYER_COLORS.length];
          const title = step.title ?? "";
          const description = step.description ?? "";
          const descWords = description.split(" ");

          return (
            <div
              key={step.id}
              className="step-layer sticky top-0 h-screen w-full flex flex-col-reverse lg:flex-row p-3 sm:p-4 gap-3 sm:gap-4 box-border overflow-hidden"
              style={{ backgroundColor: layerColor.bg, color: layerColor.color, zIndex: i + 1 }}
            >
              {/* Left: info panel */}
              <div className="info relative flex-1 min-h-0 lg:h-full">
                {/* Brand logo */}
                <div className="step-logo absolute top-0 left-0 flex items-center gap-2">
                  {logo && (
                    <Image
                      src={strapiMediaUrl(logo.url)}
                      alt={siteName ?? ""}
                      height={0}
                      width={0}
                      className="h-8.5 w-auto object-contain"
                      style={{ width: "auto", filter: layerColor.color === "#ffffff" ? "brightness(0) invert(1)" : "none" }}
                    />
                  )}
                  {siteName && (
                    <span className="font-display text-[24px] font-normal tracking-[-0.01em] leading-none">
                      {siteName}
                    </span>
                  )}
                </div>

                {/* Text block */}
                <div className="step-text absolute inset-0 lg:pr-8 flex items-center">
                  <p className="text-[15px] sm:text-[18px] leading-normal lg:max-w-112.5 opacity-80 m-0">
                    {descWords.map((word, wi) => (
                      <React.Fragment key={`${i}-w-${wi}`}>
                        <span className="split-word inline-block" style={{ opacity: 0 }}>
                          {word}
                        </span>
                        {wi < descWords.length - 1 && "\u00A0"}
                      </React.Fragment>
                    ))}
                  </p>

                  {/* Title - absolute bottom */}
                  <h3
                    className="absolute bottom-0 left-0 leading-none uppercase m-0 tracking-[-0.02em] text-[10vw] lg:text-[5vw] font-extrabold"
                  >
                    {title.split(" ").map((word, wi, wArr) => (
                      <React.Fragment key={`${i}-tw-${wi}`}>
                        <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
                          {word.split("").map((char, ci) => (
                            <span
                              key={`${i}-c-${wi}-${ci}`}
                              className="split-char inline-block"
                              style={{ opacity: 0 }}
                            >
                              {char}
                            </span>
                          ))}
                        </span>
                        {wi < wArr.length - 1 && "\u00A0"}
                      </React.Fragment>
                    ))}
                  </h3>
                </div>
              </div>

              {/* Right: media panel */}
              <div
                className="media relative w-full aspect-square shrink-0 lg:aspect-auto lg:flex-1 lg:h-full lg:w-auto rounded-sm overflow-hidden"
                style={{ backgroundColor: step.image ? undefined : layerColor.bg }}
              >
                {!step.image && (
                  <>
                    <div className="absolute inset-0 bg-current opacity-10" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-current opacity-70 text-sm tracking-[0.2em] uppercase">
                        No image
                      </span>
                    </div>
                  </>
                )}
                {step.image ? (
                  <Image
                    src={strapiMediaUrl(step.image.url)}
                    alt={step.title}
                    fill
                    className="media-image object-cover"
                  />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
