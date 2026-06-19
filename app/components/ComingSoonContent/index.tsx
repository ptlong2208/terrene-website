'use client';

import { useEffect, useRef, useState, useActionState, Fragment } from 'react';
import { useTranslations } from 'next-intl';
import gsap from 'gsap';
import TerreneLogo from '@/app/components/TerreneLogo';
import SlotText from '@/app/components/SlotText';
import { subscribeToWishlist } from '@/app/actions/wishlist';
import type { ComingSoonData } from '@/lib/types';

interface ComingSoonContentProps {
  siteName: string;
  data: ComingSoonData | null;
}

export default function ComingSoonContent({
  siteName,
  data,
}: ComingSoonContentProps) {
  const {
    quote,
    label,
    form_heading: formHeading,
    submit_label: submitLabel,
    success_message: successMessage,
    email_placeholder: emailPlaceholder,
    words: wordItems,
  } = data ?? {};

  const words = wordItems?.map(w => w.text) ?? [];

  const t = useTranslations('validation');
  const rootRef = useRef<HTMLDivElement>(null);
  const [wordIdx, setWordIdx] = useState(0);
  const [state, action, isPending] = useActionState(subscribeToWishlist, null);
  const submitted = !!state && 'success' in state;

  useEffect(() => {
    if (!words.length) return;
    const id = setInterval(
      () => setWordIdx(prev => (prev + 1) % words.length),
      2600,
    );
    return () => clearInterval(id);
  }, [words.length]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const items = root.querySelectorAll('[data-reveal]');
    const tl = gsap.timeline({ delay: 0.1 });
    tl.from(items, { opacity: 0, y: 24, duration: 0.9, stagger: 0.13, ease: 'power3.out' });
    return () => { tl.kill(); };
  }, []);

  return (
    <div
      ref={rootRef}
      className="flex flex-col items-center justify-center min-h-svh px-gutter"
      style={{ gap: 'clamp(56px,8.5vh,96px)', paddingTop: 'clamp(72px,11vh,120px)', paddingBottom: 'clamp(72px,11vh,120px)' }}
    >
      <div
        data-reveal=""
        className="flex flex-col items-center"
        style={{ gap: 'clamp(8px,1.2vh,12px)' }}
      >
        <TerreneLogo
          className="h-6.5 w-auto text-(--green-deep)"
          aria-label={siteName}
        />
        <span
          className="font-display text-[clamp(16px,2.6vw,34px)] font-normal leading-none tracking-[-0.03em] lowercase text-(--green-deep)"
        >
          {siteName}
        </span>
      </div>

      {(quote || words.length > 0) && (
        <div data-reveal="" className="flex flex-col items-center">
          <p className="text-[clamp(26px,2.8vw,44px)] font-light leading-[1.3] tracking-[-0.02em] text-(--green-deep) text-center">
            {quote?.split(', ').map((part, i, arr) => (
              <Fragment key={i}>
                {part}{i < arr.length - 1 ? ',' : ' '}
                {i < arr.length - 1 && <><br className="md:hidden" />{' '}</>}
              </Fragment>
            ))}
            {words.length > 0 && (
              <span
                className="overflow-hidden h-[1.4em] w-[4.8em] inline-block align-bottom"
              >
                <span
                  className="flex flex-col transition-[transform] duration-550 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ transform: `translateY(${-wordIdx * 1.4}em)` }}
                >
                  {words.map(w => (
                    <span key={w} className="block h-[1.4em] leading-[1.4] italic font-light text-left">
                      {w}
                    </span>
                  ))}
                </span>
              </span>
            )}
          </p>
        </div>
      )}

      <div
        data-reveal=""
        className="flex flex-col items-center w-full max-w-[320px]"
        style={{ gap: 'clamp(20px,3vh,32px)' }}
      >
        {label && (
          <span className="text-[11px] tracking-[-0.02em] text-(--green-deep)/30">
            {label}
          </span>
        )}

        {formHeading && (
          <span className="text-[18px] tracking-[-0.02em] text-(--green-deep)">
            {formHeading}
          </span>
        )}

        {!submitted ? (
          <>
            <form
              action={action}
              noValidate
              className="flex flex-col w-full"
              style={{ gap: 'clamp(8px,1.2vh,12px)' }}
            >
              <div
                className="border-b border-(--green-deep)/15 transition-[border-color] duration-250 focus-within:border-(--green-deep)"
                style={{ paddingBottom: 'clamp(8px,1.2vh,12px)' }}
              >
                <input
                  name="email"
                  type="email"
                  placeholder={emailPlaceholder ?? undefined}
                  autoComplete="email"
                  disabled={isPending}
                  className="w-full bg-transparent border-none outline-none text-[12px] font-light text-(--green-deep) tracking-[-0.01em] text-center placeholder:text-(--green-deep)/30 disabled:opacity-50"
                />
              </div>
              {state && 'error' in state && (
                <p className="text-[11px] tracking-[-0.02em] text-red-600/80 text-center">
                  {t(state.error as Parameters<typeof t>[0])}
                </p>
              )}
              {submitLabel && (
                <button
                  type="submit"
                  disabled={isPending}
                  className="group w-full flex justify-center items-center overflow-hidden bg-(--green-deep) text-cream border-0 cursor-pointer text-[16px] tracking-[-0.02em] transition-opacity duration-200 hover:opacity-85 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ padding: 'clamp(13px,1.6vh,15px)' }}
                >
                  <SlotText text={submitLabel} />
                </button>
              )}
            </form>
          </>
        ) : (
          <p className="text-[11px] tracking-[-0.02em] text-(--green-deep)/30">
            {successMessage}
          </p>
        )}
      </div>

      <footer data-reveal="" className="text-[11px] tracking-[-0.02em] text-(--green-deep)/30">
        © {siteName} {new Date().getFullYear()}
      </footer>
    </div>
  );
}
