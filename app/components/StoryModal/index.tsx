'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { strapiMediaUrl } from '@/lib/strapi';
import type { ProductStory } from '@/lib/types';
import Modal from '@/app/components/Modal';
import SlotText from '@/app/components/SlotText';

interface StoryModalProps {
  story: ProductStory;
}

export default function StoryModal({ story }: StoryModalProps) {
  const { button_label, title, content, images } = story;
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopSlides = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const startSlides = useCallback(() => {
    if (images.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % images.length);
    }, 3500);
  }, [images.length]);

  const open = () => { setIsOpen(true); setActiveIdx(0); startSlides(); };
  const close = useCallback(() => { stopSlides(); setIsOpen(false); }, []);

  const paragraphs = content.split('\n').filter(Boolean);
  const hasImages = images.length > 0;

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="group inline-flex items-center text-[11px] font-bold tracking-[0.08em] uppercase text-(--green-deep) border-b border-(--green-deep) pb-0.5 bg-transparent cursor-pointer"
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
          <div className="relative overflow-hidden bg-card shrink-0 h-60 md:h-full">
            {images.map((img, i) => (
              <Image
                key={img.id ?? i}
                src={strapiMediaUrl(img.url)}
                alt={img.alternativeText ?? title}
                fill
                className={`object-cover transition-opacity duration-700 ${i === activeIdx ? 'opacity-100' : 'opacity-0'}`}
                sizes="(max-width: 860px) 100vw, 460px"
                priority={i === 0}
              />
            ))}
            {images.length > 1 && (
              <div className="absolute bottom-3.5 left-0 right-0 flex justify-center gap-1.75 z-10">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { stopSlides(); setActiveIdx(i); }}
                    className={`h-1.75 rounded-full transition-all duration-250 cursor-pointer border-0 p-0 ${
                      i === activeIdx ? 'bg-white w-4.5' : 'bg-white/55 w-1.75'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto p-[clamp(24px,3vw,44px)]">
          <h3 className="text-[clamp(20px,2.2vw,30px)] font-semibold text-(--green-deep) mb-4 tracking-[-0.01em] leading-tight">
            {title}
          </h3>
          {paragraphs.map((p, i) => (
            <p key={i} className="text-[14px] leading-[1.65] text-ink mb-3.5 last:mb-0">
              {p}
            </p>
          ))}
        </div>
      </Modal>
    </>
  );
}
