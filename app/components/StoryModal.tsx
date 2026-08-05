'use client';

import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';

import Modal from '@/app/components/ui/Modal';
import SlotText from '@/app/components/ui/SlotText';
import type { ProductStory } from '@/lib/types';

interface StoryModalProps {
  story: ProductStory;
}

export default function StoryModal({ story }: StoryModalProps) {
  const { button_label, title, content, images } = story;
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopSlides = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startSlides = useCallback(() => {
    if (images.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % images.length);
    }, 3500);
  }, [images.length]);

  const open = () => {
    setIsOpen(true);
    setActiveIdx(0);
    startSlides();
  };
  const close = useCallback(() => {
    stopSlides();
    setIsOpen(false);
  }, []);

  const paragraphs = content.split('\n').filter(Boolean);
  const hasImages = images.length > 0;

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="group inline-flex cursor-pointer items-center border-b border-(--green-deep) bg-transparent pb-0.5 text-[11px] font-bold tracking-[0.08em] text-(--green-deep) uppercase"
      >
        <SlotText text={button_label} />
      </button>

      <Modal
        isOpen={isOpen}
        onClose={close}
        ariaLabel={title}
        dialogClassName={
          hasImages
            ? 'w-full h-dvh flex flex-col md:grid md:grid-cols-2 md:h-[min(74vh,600px)] md:max-w-[920px] overflow-hidden'
            : 'w-full h-dvh flex flex-col md:h-[min(74vh,600px)] md:max-w-[560px] overflow-hidden'
        }
      >
        {hasImages && (
          <div className="bg-card relative h-60 shrink-0 overflow-hidden md:h-full">
            {images.map((img, i) => (
              <Image
                key={i}
                src={img.url}
                alt={img.alternativeText ?? title}
                fill
                className={`object-cover transition-opacity duration-700 ${i === activeIdx ? 'opacity-100' : 'opacity-0'}`}
                sizes="(max-width: 860px) 100vw, 460px"
                priority={i === 0}
              />
            ))}
            {images.length > 1 && (
              <div className="absolute right-0 bottom-3.5 left-0 z-10 flex justify-center gap-1.75">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      stopSlides();
                      setActiveIdx(i);
                    }}
                    className={`h-1.75 cursor-pointer rounded-full border-0 p-0 transition-all duration-250 ${
                      i === activeIdx ? 'w-4.5 bg-white' : 'w-1.75 bg-white/55'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto p-[clamp(24px,3vw,44px)]">
          <h3 className="mb-4 text-[clamp(20px,2.2vw,30px)] leading-tight font-semibold tracking-[-0.01em] text-(--green-deep)">
            {title}
          </h3>
          {paragraphs.map((p, i) => (
            <p key={i} className="text-ink mb-3.5 text-[14px] leading-[1.65] last:mb-0">
              {p}
            </p>
          ))}
        </div>
      </Modal>
    </>
  );
}
