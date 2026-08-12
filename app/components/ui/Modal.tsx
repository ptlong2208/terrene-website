'use client';

import * as Dialog from '@radix-ui/react-dialog';
import gsap from 'gsap';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ReactNode, useEffect, useRef } from 'react';

import SlotText from '@/app/components/ui/SlotText';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
  dialogClassName?: string;
  ariaLabel?: string;
  // Confirm-dialog mode — activated when title is provided
  title?: string;
  description?: string;
  primaryText?: string;
  secondaryText?: string;
  onPrimary?: () => void;
  loading?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  dialogClassName = '',
  ariaLabel,
  title,
  description,
  primaryText,
  secondaryText,
  onPrimary,
  loading = false,
}: ModalProps) {
  const tCommon = useTranslations('common');
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isConfirm = !!title;

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
        gsap.fromTo(
          contentRef.current,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }
        );
    });
    return () => {
      cancelAnimationFrame(frame);
      lenis?.start();
    };
  }, [isOpen]);

  function handleClose() {
    if (!overlayRef.current || !contentRef.current) return;
    gsap.to(contentRef.current, { y: 16, opacity: 0, duration: 0.3, ease: 'power2.in' });
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
          className={
            isConfirm
              ? 'fixed inset-0 z-1200 bg-(--green-deep)/25 backdrop-blur-sm'
              : 'fixed inset-0 z-1200 cursor-pointer bg-[color-mix(in_srgb,var(--green-deep)_55%,transparent)]'
          }
          style={{ opacity: 0 }}
          onClick={isConfirm ? undefined : handleClose}
        />
        <div
          className={
            isConfirm
              ? 'p-gutter pointer-events-none fixed inset-0 z-1200 flex items-center justify-center max-sm:items-end max-sm:p-0'
              : 'p-gutter pointer-events-none fixed inset-0 z-1200 flex items-center justify-center max-md:p-0'
          }
        >
          <Dialog.Content
            ref={contentRef}
            data-lenis-prevent
            aria-label={isConfirm ? undefined : ariaLabel}
            onEscapeKeyDown={(e) => {
              e.preventDefault();
              handleClose();
            }}
            onInteractOutside={(e) => e.preventDefault()}
            className={
              isConfirm
                ? `pointer-events-auto w-full max-w-md rounded-xl border border-(--green-deep)/10 bg-(--bg-cream) p-6 shadow-xl focus:outline-none max-sm:rounded-b-none max-sm:pb-8 ${dialogClassName}`
                : `bg-cream pointer-events-auto relative shadow-[0_30px_80px_rgba(15,40,37,0.3)] ${dialogClassName}`
            }
            style={{ opacity: 0 }}
          >
            {isConfirm ? (
              <>
                <Dialog.Title className="sr-only">{title}</Dialog.Title>

                {/* Visible header */}
                <div className="mb-1 flex items-start justify-between gap-4">
                  <p
                    className="text-[18px] leading-snug font-semibold tracking-[-0.02em] text-(--green-deep)"
                    aria-hidden
                  >
                    {title}
                  </p>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="shrink-0 cursor-pointer rounded p-0.5 text-(--green-deep) opacity-40 transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-(--green-deep)/40 focus-visible:outline-none"
                  >
                    <X size={18} strokeWidth={1.5} />
                    <span className="sr-only">{secondaryText ?? tCommon('close')}</span>
                  </button>
                </div>

                {description && (
                  <Dialog.Description className="mb-5 text-[13px] leading-relaxed text-(--green-deep) opacity-60">
                    {description}
                  </Dialog.Description>
                )}

                {children}

                <div className="flex flex-col gap-3">
                  {primaryText && (
                    <button
                      type="button"
                      onClick={onPrimary}
                      disabled={loading}
                      className="group w-full cursor-pointer bg-(--green-deep) py-3.5 text-[15px] font-medium tracking-[-0.02em] text-white transition-opacity hover:opacity-85 disabled:opacity-40"
                    >
                      <SlotText text={primaryText} />
                    </button>
                  )}
                  {secondaryText && (
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={loading}
                      className="group inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[13px] font-semibold tracking-[-0.02em] text-(--green-deep) disabled:opacity-30"
                    >
                      <span className="border-b border-current pb-0.5">
                        <SlotText text={secondaryText} />
                      </span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <Dialog.Title className="sr-only">{ariaLabel}</Dialog.Title>

                <div className="bg-cream border-line hidden h-11 shrink-0 items-center justify-end border-b px-4 max-md:mb-4 max-md:flex">
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
              </>
            )}
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
