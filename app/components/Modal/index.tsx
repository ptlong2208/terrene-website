'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { useTranslations } from 'next-intl';
import SlotText from '@/app/components/SlotText';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  dialogClassName?: string;
  ariaLabel?: string;
}

export default function Modal({ isOpen, onClose, children, dialogClassName = '', ariaLabel }: ModalProps) {
  const tCommon = useTranslations('common');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
useEffect(() => {
    if (!isOpen || !wrapperRef.current || !dialogRef.current) return;
    document.body.classList.add('is-locked');
    gsap.fromTo(wrapperRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power1.out' });
    gsap.fromTo(dialogRef.current, { y: 16 }, { y: 0, duration: 0.35, ease: 'power2.out' });
    return () => { document.body.classList.remove('is-locked'); };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleClose = () => {
    if (!wrapperRef.current || !dialogRef.current) return;
    gsap.to(dialogRef.current, { y: 16, duration: 0.3, ease: 'power2.in' });
    gsap.to(wrapperRef.current, { opacity: 0, duration: 0.3, ease: 'power1.in', onComplete: onClose });
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={wrapperRef}
      className="fixed inset-0 z-1200 flex items-center justify-center p-gutter max-md:p-0"
      style={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--green-deep)_55%,transparent)] cursor-pointer"
        onClick={handleClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={`relative z-10 bg-cream shadow-[0_30px_80px_rgba(15,40,37,0.3)] ${dialogClassName}`}
      >
        {/* Close bar — mobile sticky header */}
        <div className="hidden max-md:flex items-center justify-end px-4 h-11 shrink-0 bg-cream border-b border-line">
          <button
            type="button"
            onClick={handleClose}
            className="group bg-transparent border-0 p-0 cursor-pointer text-[11px] font-normal tracking-[0.12em] uppercase text-(--brown) leading-none"
          >
            <SlotText text={tCommon('close')} />
          </button>
        </div>

        {/* Close button — desktop only */}
        <button
          type="button"
          onClick={handleClose}
          className="group max-md:hidden absolute top-3.5 right-4 z-10 bg-transparent border-0 p-0 cursor-pointer text-[11px] font-normal tracking-[0.12em] uppercase text-(--brown) leading-none"
        >
          <SlotText text={tCommon('close')} />
        </button>

        {children}
      </div>
    </div>,
    document.body
  );
}
