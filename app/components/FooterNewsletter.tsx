'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import SlotText from '@/app/components/SlotText';
import { subscribeToWishlist } from '@/app/actions/wishlist';

interface FooterNewsletterProps {
  label?: string | null;
  placeholder?: string | null;
}

export default function FooterNewsletter({ label, placeholder }: FooterNewsletterProps) {
  const t = useTranslations('validation');
  const [state, action, isPending] = useActionState(subscribeToWishlist, null);
  const submitted = !!state && 'success' in state;

  return (
    <div className="flex flex-col gap-4">
      {label && (
        <span className="text-[10px] font-normal tracking-[0.08em] uppercase text-cream/40">
          {label}
        </span>
      )}

      {!submitted ? (
        <>
          <form action={action} noValidate>
            <div className="flex items-center border-b border-cream/20 pb-2 transition-[border-color] duration-250 focus-within:border-cream/60">
              <input
                name="email"
                type="email"
                placeholder={placeholder ?? undefined}
                autoComplete="email"
                disabled={isPending}
                className="flex-1 bg-transparent border-none outline-none text-[13px] font-normal text-cream tracking-[-0.02em] placeholder:text-cream/35 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isPending}
                aria-label="Subscribe"
                className="cursor-pointer group text-cream/55 text-[15px] leading-none transition-colors duration-200 hover:text-cream disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SlotText text="→" />
              </button>
            </div>
          </form>
          {state && 'error' in state && (
            <p className="text-[11px] tracking-[-0.01em] text-red-400/80">
              {t(state.error as Parameters<typeof t>[0])}
            </p>
          )}
        </>
      ) : (
        <p className="text-[11px] tracking-[-0.01em] text-cream/40">
          {t('subscribeSuccess')}
        </p>
      )}
    </div>
  );
}
