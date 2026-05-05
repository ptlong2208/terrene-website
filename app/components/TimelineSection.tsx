"use client";

import React, { useEffect, useRef } from "react";
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

// Inline SVG fallback — only used when no Strapi logo is available
function FallbackLogo() {
  return (
    <svg
      viewBox="0 0 62 83"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ height: "34px", width: "auto", display: "block" }}
    >
      <path d="M30.6685 7.16614C32.6473 7.16614 34.2516 5.56187 34.2516 3.58309C34.2516 1.6043 32.6473 3.43323e-05 30.6685 3.43323e-05C28.6897 3.43323e-05 27.0854 1.6043 27.0854 3.58309C27.0854 5.56187 28.6897 7.16614 30.6685 7.16614Z" fill="currentColor"/>
      <path d="M14.0193 55.2217C12.0408 53.4315 9.84962 51.8749 7.55486 50.5126C6.48583 49.8777 0.0940217 45.6791 0.0940217 49.2776C0.0940217 49.2785 0.0578613 66.9977 0.0578613 66.9977C0.0578613 71.5853 3.42625 75.3043 7.58126 75.3043C13.4565 75.3043 17.406 77.1523 22.3643 80.6323C22.3643 80.6323 25.2962 82.6897 25.3134 82.7018C25.9101 83.1205 26.2878 82.4219 26.276 81.8704C26.2074 78.7229 25.6234 75.7004 24.6468 72.7889C22.9176 67.6343 20.6349 62.7185 17.1586 58.4977C16.1938 57.3259 15.1405 56.2362 14.0193 55.2217Z" fill="currentColor"/>
      <path d="M0.584369 43.8443H22.0781C26.248 43.8443 29.6285 47.5097 29.6285 52.0315V55.0807V62.3834V71.1733V78.6838V80.6267C29.6285 81.2805 29.5435 82.3309 29.3105 82.6652C29.1202 82.9378 28.5947 83.102 28.3244 82.9218C27.5688 82.4187 27.5114 81.2102 27.398 80.361C27.2422 79.1932 27.1561 78.014 26.9371 76.8568C26.634 75.2557 26.2566 73.6693 25.8302 72.102C25.1104 69.4563 24.2035 66.8728 23.0484 64.4133C21.8138 61.7836 20.3077 59.3063 18.5556 57.048C16.5108 54.412 14.1394 52.086 11.5513 50.0917C8.87891 48.032 4.60393 45.7869 0.432265 44.9188C-0.138268 44.8002 0.00350402 43.8443 0.584369 43.8443Z" fill="currentColor"/>
      <path d="M0.0810547 25.9909C0.0810547 26.236 0.145053 26.4765 0.268745 26.6817C0.93255 27.782 1.18252 29.1862 0.823207 30.447C0.586441 31.2781 0.120372 32.0768 0.0810547 32.9228V33.1446C0.0836376 33.1995 0.0873684 33.2546 0.0942562 33.31C0.27592 34.8037 1.98235 35.8604 1.75248 37.3462C1.63711 38.0926 1.07518 38.596 0.515842 39.0911C0.24062 39.335 0.0810547 39.7 0.0810547 40.0855V40.1411C0.0810547 40.8503 0.611409 41.4254 1.26546 41.4254H28.4401C29.0942 41.4254 29.6245 40.8503 29.6245 40.1411V39.9727C29.6245 39.4765 29.3611 39.0248 28.9478 38.8121L1.77343 24.8306C0.987364 24.4262 0.0810547 25.0476 0.0810547 25.9909Z" fill="currentColor"/>
      <path d="M29.4097 35.3048L16.5512 18.9031C14.9128 16.6049 13.2486 14.3308 11.667 11.9853C11.0476 11.0666 10.3864 10.0788 9.38023 9.63342C7.36672 8.74232 5.23038 10.2711 3.21285 10.3876C2.0296 10.4559 0.489618 10.1991 0.171922 11.8165C0.00231131 12.6795 0.282698 13.5984 0.389458 14.4491C0.518602 15.4794 0.341818 16.3771 0.173643 17.3858C-0.0903869 18.9735 -0.226133 20.7353 1.08741 21.808C3.01167 23.3793 5.45366 24.1636 7.59517 25.3225L28.1677 36.9441C29.1219 37.4604 30.0621 36.2197 29.4097 35.3048Z" fill="currentColor"/>
      <path d="M27.5756 10.7252C27.5538 10.7341 27.5317 10.7421 27.5088 10.7496C27.0014 10.9112 26.4613 10.675 25.9932 10.4772C25.2493 10.1633 24.4856 9.8915 23.6976 9.74227C22.9198 9.59505 22.0976 9.56319 21.3322 9.80483C20.613 10.0321 19.9911 10.5286 19.2613 10.7235C17.5528 11.1798 16.0341 9.8585 14.4152 9.55085C14.4103 9.54999 14.4057 9.54913 14.4009 9.54798C13.7833 9.43376 13.3614 10.2147 13.7359 10.7594L28.3519 32.0094C28.7566 32.598 29.619 32.2875 29.619 31.5537V10.5608C29.619 10.0181 29.109 9.64441 28.6484 9.85706C28.2222 10.0536 28.0124 10.5458 27.5756 10.7252Z" fill="currentColor"/>
      <path d="M47.321 55.2217C49.2994 53.4315 51.4906 51.8749 53.7854 50.5126C54.8544 49.8777 61.2462 45.6791 61.2462 49.2776C61.2462 49.2785 61.2824 66.9977 61.2824 66.9977C61.2824 71.5853 57.914 75.3043 53.759 75.3043C47.8837 75.3043 43.9342 77.1523 38.9759 80.6323C38.9759 80.6323 36.044 82.6897 36.0268 82.7018C35.4302 83.1205 35.0522 82.4219 35.0642 81.8704C35.1328 78.7229 35.7169 75.7004 36.6935 72.7889C38.4226 67.6343 40.7053 62.7185 44.1816 58.4977C45.1464 57.3259 46.1997 56.2362 47.321 55.2217Z" fill="currentColor"/>
      <path d="M60.7499 43.8443H39.2562C35.0863 43.8443 31.7058 47.5097 31.7058 52.0315V55.0807V62.3834V71.1733V78.6838V80.6267C31.7058 81.2805 31.7908 82.3309 32.0238 82.6652C32.2141 82.9378 32.7395 83.102 33.0099 82.9218C33.7655 82.4187 33.8229 81.2102 33.9363 80.361C34.0921 79.1932 34.1782 78.014 34.3972 76.8568C34.7003 75.2557 35.0776 73.6693 35.5041 72.102C36.2239 69.4563 37.1308 66.8728 38.2859 64.4133C39.5208 61.7836 41.0266 59.3063 42.7787 57.048C44.8235 54.412 47.1949 52.086 49.7829 50.0917C52.4554 48.032 56.7303 45.7869 60.902 44.9188C61.4725 44.8002 61.3308 43.8443 60.7499 43.8443Z" fill="currentColor"/>
      <path d="M61.2493 25.9909C61.2493 26.236 61.1853 26.4765 61.0616 26.6817C60.3978 27.782 60.1478 29.1862 60.5071 30.447C60.7439 31.2781 61.21 32.0768 61.2493 32.9228V33.1446C61.2467 33.1995 61.243 33.2546 61.2361 33.31C61.0544 34.8037 59.348 35.8604 59.5779 37.3462C59.6932 38.0926 60.2551 38.596 60.8145 39.0911C61.0897 39.335 61.2493 39.7 61.2493 40.0855V40.1411C61.2493 40.8503 60.7189 41.4254 60.0649 41.4254H32.8902C32.2359 41.4254 31.7058 40.8503 31.7058 40.1411V39.9727C31.7058 39.4765 31.9693 39.0248 32.3825 38.8121L59.5569 24.8306C60.343 24.4262 61.2493 25.0476 61.2493 25.9909Z" fill="currentColor"/>
      <path d="M31.9224 35.3048L44.7809 18.9031C46.4193 16.6049 48.0836 14.3308 49.6652 11.9853C50.2845 11.0666 50.9457 10.0788 51.9519 9.63342C53.9654 8.74232 56.1018 10.2711 58.1193 10.3876C59.3025 10.4559 60.8425 10.1991 61.1602 11.8165C61.3298 12.6795 61.0494 13.5984 60.9427 14.4491C60.8135 15.4794 60.9903 16.3771 61.1585 17.3858C61.4225 18.9735 61.5583 20.7353 60.2447 21.808C58.3205 23.3793 55.8785 24.1636 53.737 25.3225L33.1645 36.9441C32.2102 37.4604 31.2701 36.2197 31.9224 35.3048Z" fill="currentColor"/>
      <path d="M33.7492 10.7252C33.771 10.7341 33.7931 10.7421 33.816 10.7496C34.3234 10.9112 34.8635 10.675 35.3316 10.4772C36.0758 10.1633 36.8392 9.8915 37.6272 9.74227C38.405 9.59505 39.2272 9.56319 39.9926 9.80483C40.7118 10.0321 41.3337 10.5286 42.0635 10.7235C43.772 11.1798 45.2907 9.8585 46.9096 9.55085C46.9145 9.54999 46.9191 9.54913 46.924 9.54798C47.5416 9.43376 47.9634 10.2147 47.5889 10.7594L32.9729 32.0094C32.5682 32.598 31.7058 32.2875 31.7058 31.5537V10.5608C31.7058 10.0181 32.2158 9.64441 32.6764 9.85706C33.1026 10.0536 33.3124 10.5458 33.7492 10.7252Z" fill="currentColor"/>
    </svg>
  );
}

type LenisInstance = { stop: () => void; start: () => void };
const getLenis = () =>
  (window as unknown as Record<string, unknown>).lenis as LenisInstance | undefined;

export default function TimelineSection({ steps, logo, siteName }: Props) {
  const wrapperRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const totalSlides = steps.length;
    if (totalSlides === 0) return;

    let currentIndex = 0;
    let isInitialized = false;
    let isAnimating = false;

    function animateTextIn(index: number) {
      const layer = layerRefs.current[index];
      if (!layer) return;
      const chars = layer.querySelectorAll<HTMLElement>(".split-char");
      const words = layer.querySelectorAll<HTMLElement>(".split-word");
      gsap.killTweensOf([chars, words]);
      if (chars.length) {
        gsap.fromTo(
          chars,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.02, ease: "power3.out", delay: 0.3 }
        );
      }
      if (words.length) {
        gsap.fromTo(
          words,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.02, ease: "power3.out", delay: 0.4 }
        );
      }
    }

    function animateTextOut(index: number) {
      const layer = layerRefs.current[index];
      if (!layer) return;
      const items = layer.querySelectorAll<HTMLElement>(".split-char, .split-word");
      gsap.killTweensOf(items);
      gsap.to(items, { opacity: 0, y: -20, duration: 0.4, stagger: 0.01, ease: "power2.in" });
    }

    function goToSlide(newIndex: number) {
      if (isAnimating || newIndex === currentIndex) return;
      isAnimating = true;
      animateTextOut(currentIndex);
      gsap.to(layerRefs.current[currentIndex], { autoAlpha: 0, duration: 0.5, ease: "power2.inOut" });
      currentIndex = newIndex;
      gsap.to(layerRefs.current[currentIndex], { autoAlpha: 1, duration: 0.5, ease: "power2.inOut" });
      animateTextIn(currentIndex);
      setTimeout(() => { isAnimating = false; }, 1200);
    }

    // All layers hidden, first layer visible
    gsap.set(layerRefs.current.filter(Boolean), { autoAlpha: 0 });
    if (layerRefs.current[0]) gsap.set(layerRefs.current[0], { autoAlpha: 1 });

    const intentObserver: ReturnType<typeof ScrollTrigger.observe> = ScrollTrigger.observe({
      type: "wheel,touch,pointer",
      target: stickyRef.current!,
      preventDefault: true,
      tolerance: 10,
      onUp: () => {
        if (isAnimating) return;
        if (currentIndex > 0) {
          goToSlide(currentIndex - 1);
        } else {
          getLenis()?.start();
          intentObserver.disable();
        }
      },
      onDown: () => {
        if (isAnimating) return;
        if (currentIndex < totalSlides - 1) {
          goToSlide(currentIndex + 1);
        } else {
          getLenis()?.start();
          intentObserver.disable();
        }
      },
    });

    intentObserver.disable();

    const trigger = ScrollTrigger.create({
      trigger: wrapperRef.current,
      start: "top top",
      end: "+=150px",
      pin: stickyRef.current,
      onEnter: () => {
        getLenis()?.stop();
        intentObserver.enable();
        if (!isInitialized) {
          animateTextIn(0);
          isInitialized = true;
        }
        isAnimating = true;
        setTimeout(() => { isAnimating = false; }, 1000);
      },
      onEnterBack: () => {
        getLenis()?.stop();
        intentObserver.enable();
        isAnimating = true;
        setTimeout(() => { isAnimating = false; }, 400);
      },
    });

    return () => {
      getLenis()?.start();
      intentObserver.kill();
      trigger.kill();
    };
  }, [steps]);

  return (
    <section ref={wrapperRef} className="relative w-full" style={{ zIndex: 5 }}>
      <div ref={stickyRef} className="relative h-screen w-full overflow-hidden">
        {steps.map((step, i) => {
          const layerColor = LAYER_COLORS[i % LAYER_COLORS.length];
          const title = step.title ?? "";
          const description = step.description ?? "";
          const descWords = description.split(" ");

          return (
            <div
              key={step.id}
              ref={(el) => { layerRefs.current[i] = el; }}
              className="absolute inset-0 flex flex-col md:flex-row p-4 gap-4 box-border"
              style={{ backgroundColor: layerColor.bg, color: layerColor.color }}
            >
              {/* Left: info panel */}
              <div className="relative w-full h-1/2 md:flex-1 md:h-full order-2 md:order-1">
                {/* Brand logo */}
                <div className="absolute top-0 left-0 flex items-center gap-2">
                  {logo ? (
                    <Image
                      src={strapiMediaUrl(logo.url)}
                      alt={siteName ?? ""}
                      height={34}
                      width={0}
                      className="h-8.5 w-auto object-contain"
                      style={{ width: "auto", filter: layerColor.color === "#ffffff" ? "brightness(0) invert(1)" : "none" }}
                    />
                  ) : (
                    <FallbackLogo />
                  )}
                  {siteName && (
                    <span className="font-display text-[24px] font-normal tracking-[-0.01em] leading-none">
                      {siteName}
                    </span>
                  )}
                </div>

                {/* Text block */}
                <div className="absolute inset-0 pr-8 flex items-center">
                  <p className="text-[18px] leading-normal max-w-112.5 opacity-80 m-0">
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
                    className="absolute bottom-0 left-0 leading-none uppercase m-0 tracking-[-0.02em]"
                    style={{ fontSize: "5vw", fontWeight: 800 }}
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
              <div className="relative w-full h-1/2 md:flex-1 md:h-full order-1 md:order-2 rounded-sm overflow-hidden bg-black/20">
                {!step.image && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-current opacity-30 text-sm tracking-widest uppercase">
                      No image
                    </span>
                  </div>
                )}
                {step.image ? (
                  <Image
                    src={strapiMediaUrl(step.image.url)}
                    alt={step.title}
                    fill
                    className="object-cover"
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
