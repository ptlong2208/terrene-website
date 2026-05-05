"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface HeroVideoProps {
  src: string;
}

export default function HeroVideo({ src }: HeroVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!containerRef.current || !videoRef.current) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(max-width: 767px)", () => {
        gsap.set(videoRef.current, { height: "120vh" });
        gsap.to(videoRef.current, {
          y: "20vh",
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      mm.add("(min-width: 768px) and (max-width: 1023px)", () => {
        gsap.set(videoRef.current, { height: "124vh" });
        gsap.to(videoRef.current, {
          y: "24vh",
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      mm.add("(min-width: 1024px)", () => {
        gsap.set(videoRef.current, { height: "130vh" });
        gsap.to(videoRef.current, {
          y: "30vh",
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      return () => mm.revert();
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="hero-media-scroll relative h-screen w-full mt-4 overflow-hidden bg-[#D9D9D9] z-2"
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="hero-video w-full object-cover object-center absolute bottom-0 left-0 will-change-transform"
        src={src}
      />
    </div>
  );
}
