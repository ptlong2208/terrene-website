'use client';

import gsap from 'gsap';
import { useTranslations } from 'next-intl';
import { Fragment, useActionState, useEffect, useRef } from 'react';

import { subscribeToWishlist } from '@/app/actions/wishlist';
import TerreneLogo from '@/app/components/TerreneLogo';
import PrimaryButton from '@/app/components/ui/PrimaryButton';
import RotatingText from '@/app/components/ui/RotatingText';
import { isPreloaderDone } from '@/app/hooks/usePreloaderDone';
import type { ComingSoonData } from '@/lib/types';

interface ComingSoonContentProps {
  siteName: string;
  data: ComingSoonData | null;
}

export default function ComingSoonContent({ siteName, data }: ComingSoonContentProps) {
  const {
    quote,
    label,
    form_heading: formHeading,
    submit_label: submitLabel,
    success_message: successMessage,
    email_placeholder: emailPlaceholder,
    words: wordItems,
  } = data ?? {};

  const words = wordItems?.map((w) => w.text) ?? [];

  const t = useTranslations('validation');
  const rootRef = useRef<HTMLDivElement>(null);
  const [state, action, isPending] = useActionState(subscribeToWishlist, null);
  const submitted = !!state && 'success' in state;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const items = root.querySelectorAll('[data-reveal]');
    if (isPreloaderDone()) {
      gsap.set(items, { opacity: 1, y: 0 });
      return;
    }
    const tl = gsap.timeline({ delay: 0.1 });
    tl.from(items, { opacity: 0, y: 24, duration: 0.9, stagger: 0.13, ease: 'power3.out' });
    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="px-gutter flex min-h-svh flex-col items-center justify-center gap-[clamp(56px,8.5vh,96px)] pt-[clamp(72px,11vh,120px)] pb-[clamp(72px,11vh,120px)]"
    >
      <div data-reveal="" className="flex flex-col items-center gap-[clamp(8px,1.2vh,12px)]">
        <TerreneLogo className="h-6.5 w-auto text-(--green-deep)" aria-label={siteName} />
        <span className="font-display text-[clamp(16px,2.6vw,34px)] leading-none font-normal tracking-[-0.03em] text-(--green-deep) lowercase">
          {siteName}
        </span>
      </div>

      {(quote || words.length > 0) && (
        <div data-reveal="" className="flex flex-col items-center">
          <p className="text-center text-[clamp(26px,2.8vw,44px)] leading-[1.3] font-light tracking-[-0.02em] text-(--green-deep)">
            {quote?.split(', ').map((part, i, arr) => (
              <Fragment key={i}>
                {part}
                {i < arr.length - 1 ? ',' : ' '}
                {i < arr.length - 1 && (
                  <>
                    <br className="md:hidden" />{' '}
                  </>
                )}
              </Fragment>
            ))}
            {words.length > 0 && (
              <RotatingText
                texts={words}
                rotationInterval={3600}
                staggerDuration={0.05}
                mainClassName="inline-flex align-bottom italic"
                splitLevelClassName="overflow-hidden pb-[0.2em] mb-[-0.2em] px-[0.1em] mx-[-0.1em]"
              />
            )}
          </p>
        </div>
      )}

      <div
        data-reveal=""
        className="flex w-full max-w-[320px] flex-col items-center gap-[clamp(20px,3vh,32px)]"
      >
        {label && (
          <span className="text-[11px] tracking-[-0.02em] text-(--green-deep)/30">{label}</span>
        )}

        {formHeading && (
          <span className="text-[18px] tracking-[-0.02em] text-(--green-deep)">{formHeading}</span>
        )}

        {!submitted ? (
          <>
            <form
              action={action}
              noValidate
              className="flex w-full flex-col gap-[clamp(8px,1.2vh,12px)]"
            >
              <div className="border-b border-(--green-deep)/15 pb-[clamp(8px,1.2vh,12px)] transition-[border-color] duration-250 focus-within:border-(--green-deep)">
                <input
                  name="email"
                  type="email"
                  placeholder={emailPlaceholder ?? undefined}
                  autoComplete="email"
                  disabled={isPending}
                  className="w-full border-none bg-transparent text-center text-[12px] font-light tracking-[-0.01em] text-(--green-deep) outline-none placeholder:text-(--green-deep)/30 disabled:opacity-50"
                />
              </div>
              {state && 'error' in state && (
                <p className="text-center text-[11px] tracking-[-0.02em] text-red-600/80">
                  {t(state.error)}
                </p>
              )}
              {submitLabel && (
                <PrimaryButton type="submit" size="hero" disabled={isPending}>
                  {submitLabel}
                </PrimaryButton>
              )}
            </form>
          </>
        ) : (
          <p className="text-[11px] tracking-[-0.02em] text-(--green-deep)/30">{successMessage}</p>
        )}
      </div>

      <footer data-reveal="" className="text-[11px] tracking-[-0.02em] text-(--green-deep)/30">
        © {siteName} {new Date().getFullYear()}
      </footer>
    </div>
  );
}
