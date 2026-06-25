'use client';

import { type RefObject, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePreloaderDone } from '@/app/hooks/usePreloaderDone';

// Splits an element's text into visual lines by measuring offsetTop of each
// word, grouping consecutive words within 4px (matches reference tolerance).
// Wraps each line in overflow:hidden + will-change:transform span pair so
// GSAP yPercent slides lines up without clipping neighbours.
function splitIntoLines(
  element: HTMLElement,
  restoreFns: Array<() => void>,
): HTMLElement[] {
  const originalText = element.textContent?.trim().replace(/\s+/g, ' ');
  if (!originalText) return [];

  const originalAriaLabel = element.getAttribute('aria-label');
  element.setAttribute('aria-label', originalText);
  element.textContent = '';

  const wordSpans: HTMLSpanElement[] = originalText.split(' ').map((word) => {
    const span = document.createElement('span');
    span.textContent = word;
    span.style.display = 'inline-block';
    return span;
  });

  wordSpans.forEach((span, i) => {
    element.appendChild(span);
    if (i < wordSpans.length - 1) element.appendChild(document.createTextNode(' '));
  });

  const lines: string[][] = [];
  let currentLine: string[] = [];
  let currentTop: number | null = null;

  wordSpans.forEach((span) => {
    const top = span.offsetTop;
    if (currentTop === null || Math.abs(top - currentTop) < 4) {
      currentLine.push(span.textContent ?? '');
      if (currentTop === null) currentTop = top;
    } else {
      lines.push(currentLine);
      currentLine = [span.textContent ?? ''];
      currentTop = top;
    }
  });
  if (currentLine.length) lines.push(currentLine);

  element.textContent = '';
  const lineElements: HTMLElement[] = [];

  lines.forEach((lineWords) => {
    const lineWrap = document.createElement('span');
    lineWrap.style.display = 'block';
    lineWrap.style.overflow = 'hidden';
    lineWrap.setAttribute('aria-hidden', 'true');

    const line = document.createElement('span');
    line.style.display = 'block';
    line.style.willChange = 'transform';
    line.textContent = lineWords.join(' ');

    lineWrap.appendChild(line);
    element.appendChild(lineWrap);
    lineElements.push(line);
  });

  restoreFns.push(() => {
    element.textContent = originalText;
    if (originalAriaLabel === null) {
      element.removeAttribute('aria-label');
    } else {
      element.setAttribute('aria-label', originalAriaLabel);
    }
  });

  return lineElements;
}

interface HeroAnimationRefs {
  sectionRef: RefObject<HTMLElement | null>;
  titleRef: RefObject<HTMLHeadingElement | null>;
  descRef: RefObject<HTMLParagraphElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
}

export function useHeroAnimation({
  sectionRef,
  titleRef,
  descRef,
  videoRef,
}: HeroAnimationRefs): void {
  const preloaderDone = usePreloaderDone();

  useEffect(() => {
    if (!preloaderDone || !sectionRef.current) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const restoreFns: Array<() => void> = [];
    let isActive = true;
    let introTl: gsap.core.Timeline | null = null;
    let videoTween: gsap.core.Tween | null = null;


    if (videoRef.current) {
      videoTween = gsap.fromTo(
        videoRef.current,
        { yPercent: 0 },
        {
          yPercent: -8,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        },
      );
    }

    const runAnimation = () => {
      const titleLines = titleRef.current ? splitIntoLines(titleRef.current, restoreFns) : [];
      const descLines = descRef.current ? splitIntoLines(descRef.current, restoreFns) : [];

      // Make elements visible — lines are already clipped to yPercent 110 so
      // nothing shows until the timeline plays
      if (titleRef.current) gsap.set(titleRef.current, { opacity: 1 });
      if (descRef.current) gsap.set(descRef.current, { opacity: 1 });

      if (titleLines.length) gsap.set(titleLines, { yPercent: 110 });
      if (descLines.length) gsap.set(descLines, { yPercent: 110 });

      introTl = gsap.timeline();

      if (titleLines.length) {
        introTl.to(titleLines, {
          yPercent: 0,
          duration: 1.1,
          stagger: 0.08,
          ease: 'power3.out',
        });
      }

      if (descLines.length) {
        introTl.to(
          descLines,
          { yPercent: 0, duration: 0.95, stagger: 0.055, ease: 'power3.out' },
          '-=0.72',
        );
      }
    };

    if (document.fonts?.ready) {
      void document.fonts.ready.then(() => {
        if (!isActive) return;
        runAnimation();
      });
    } else {
      runAnimation();
    }

    return () => {
      isActive = false;
      introTl?.kill();
      videoTween?.scrollTrigger?.kill();
      videoTween?.kill();
      restoreFns.forEach((fn) => fn());
    };
  }, [sectionRef, titleRef, descRef, videoRef, preloaderDone]);
}
