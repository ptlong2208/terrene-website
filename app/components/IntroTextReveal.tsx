"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface IntroTextRevealProps {
  text: string;
}

export default function IntroTextReveal({ text }: IntroTextRevealProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyTextRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !stickyTextRef.current) return;

    const textEl = stickyTextRef.current;
    const words = text
      .replace(/\r\n/g, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .split(/(\n|\s+)/);
    textEl.innerHTML = "";

    words.forEach((word) => {
      if (word === "\n") {
        textEl.appendChild(document.createElement("br"));
      } else if (word.trim() !== "") {
        const span = document.createElement("span");
        span.className = "scrub-word inline-block opacity-[0.05]";
        span.textContent = word;
        textEl.appendChild(span);
        textEl.appendChild(document.createTextNode(" "));
      }
    });

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=500%",
        pin: true,
        pinSpacing: false,
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=350%",
          scrub: true,
        },
      });

      timeline.to(
        textEl.querySelectorAll(".scrub-word"),
        {
          opacity: 1,
          fontWeight: 600,
          stagger: { amount: 0.4 },
          duration: 0.1,
          ease: "none",
        },
        0
      );

      timeline.to(
        stickyTextRef.current,
        {
          top: "15%",
          duration: 0.1,
          ease: "power2.inOut",
        },
        0.6
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [text]);

  return (
    <section
      ref={sectionRef}
      className="scroll-section relative h-screen overflow-hidden bg-cream z-3"
    >
      <div className="sticky-container relative h-screen w-full">
        <p
          ref={stickyTextRef}
          id="reveal-text"
          className="sticky-text absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-212.5 px-6 sm:px-8 lg:px-0 text-center text-[clamp(1.375rem,3.2vw,2rem)] font-normal leading-[1.3] tracking-[-0.04em] z-2"
        />
      </div>
    </section>
  );
}
