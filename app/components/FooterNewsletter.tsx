'use client';

import { useTranslations } from 'next-intl';
import { useActionState } from 'react';

import { subscribeToWishlist } from '@/app/actions/wishlist';
import SlotText from '@/app/components/ui/SlotText';

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
        <span className="text-cream/40 text-[10px] font-normal tracking-[0.08em] uppercase">
          {label}
        </span>
      )}

      {!submitted ? (
        <>
          <form action={action} noValidate>
            <div className="border-cream/20 focus-within:border-cream/60 flex items-center border-b pb-2 transition-[border-color] duration-250">
              <input
                name="email"
                type="email"
                placeholder={placeholder ?? undefined}
                autoComplete="email"
                disabled={isPending}
                className="text-cream placeholder:text-cream/35 flex-1 border-none bg-transparent text-[13px] font-normal tracking-[-0.02em] outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isPending}
                aria-label="Subscribe"
                className="group text-cream/55 hover:text-cream cursor-pointer text-[15px] leading-none transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
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
        <p className="text-cream/40 text-[11px] tracking-[-0.01em]">{t('subscribeSuccess')}</p>
      )}
    </div>
  );
}
