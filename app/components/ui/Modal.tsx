'use client';

import * as Dialog from '@radix-ui/react-dialog';
import gsap from 'gsap';
import { useTranslations } from 'next-intl';
import { ReactNode, useEffect, useRef } from 'react';

import SlotText from '@/app/components/ui/SlotText';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  dialogClassName?: string;
  ariaLabel?: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  dialogClassName = '',
  ariaLabel,
}: ModalProps) {
  const tCommon = useTranslations('common');
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const lenis = (window as unknown as Record<string, unknown>).lenis as
      { stop: () => void; start: () => void } | undefined;
    lenis?.stop();
    // rAF gives Radix Presence one frame to mount portal elements before GSAP reads refs
    const frame = requestAnimationFrame(() => {
      if (overlayRef.current)
        gsap.fromTo(
          overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.35, ease: 'power1.out' }
        );
      if (contentRef.current)
        gsap.fromTo(contentRef.current, { y: 16 }, { y: 0, duration: 0.35, ease: 'power2.out' });
    });
    return () => {
      cancelAnimationFrame(frame);
      lenis?.start();
    };
  }, [isOpen]);

  function handleClose() {
    if (!overlayRef.current || !contentRef.current) return;
    gsap.to(contentRef.current, { y: 16, duration: 0.3, ease: 'power2.in' });
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: 'power1.in',
      onComplete: () => {
        const lenis = (window as unknown as Record<string, unknown>).lenis as
          { start: () => void } | undefined;
        lenis?.start();
        onClose();
      },
    });
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={() => {}}>
      <Dialog.Portal>
        <Dialog.Overlay
          ref={overlayRef}
          className="fixed inset-0 z-1200 cursor-pointer bg-[color-mix(in_srgb,var(--green-deep)_55%,transparent)]"
          style={{ opacity: 0 }}
          onClick={handleClose}
        />
        <div className="p-gutter pointer-events-none fixed inset-0 z-1200 flex items-center justify-center max-md:p-0">
          <Dialog.Content
            ref={contentRef}
            aria-label={ariaLabel}
            onEscapeKeyDown={(e) => {
              e.preventDefault();
              handleClose();
            }}
            onInteractOutside={(e) => e.preventDefault()}
            className={`bg-cream pointer-events-auto relative shadow-[0_30px_80px_rgba(15,40,37,0.3)] ${dialogClassName}`}
          >
            <Dialog.Title className="sr-only">{ariaLabel}</Dialog.Title>

            <div className="bg-cream border-line hidden h-11 shrink-0 items-center justify-end border-b px-4 max-md:flex">
              <button
                type="button"
                onClick={handleClose}
                className="group cursor-pointer border-0 bg-transparent p-0 text-[11px] leading-none font-normal tracking-[0.12em] text-(--brown) uppercase"
              >
                <SlotText text={tCommon('close')} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="group absolute top-3.5 right-4 z-10 cursor-pointer border-0 bg-transparent p-0 text-[11px] leading-none font-normal tracking-[0.12em] text-(--brown) uppercase max-md:hidden"
            >
              <SlotText text={tCommon('close')} />
            </button>

            {children}
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
