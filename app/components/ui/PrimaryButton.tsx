import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, Ref } from 'react';
import { forwardRef } from 'react';

import SlotText from '@/app/components/ui/SlotText';

type PrimaryButtonSize = 'default' | 'compact' | 'hero' | 'small';

const SIZE_CLASS: Record<PrimaryButtonSize, string> = {
  default: 'py-3.75 text-[16px]',
  compact: 'px-4.5 py-3 text-[16px]',
  hero: 'p-[clamp(13px,1.6vh,15px)] text-[16px]',
  small: 'px-3 py-2 text-[13px]',
};

const BASE_CLASS =
  'text-cream flex cursor-pointer items-center justify-center overflow-hidden border-0 bg-(--green-deep) tracking-[-0.02em] no-underline transition-opacity enabled:hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40';

interface CommonProps {
  children: string;
  loading?: boolean;
  /** Shown instead of `children` while `loading` — plain text, no SlotText animation. */
  loadingText?: string;
  fullWidth?: boolean;
  size?: PrimaryButtonSize;
  /** Escape hatch for layout only (margin, positioning) — not for color/padding/typography. */
  className?: string;
}

type PrimaryButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & { href?: undefined };

type PrimaryButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children' | 'href'> & {
    href: string;
  };

type PrimaryButtonProps = PrimaryButtonAsButton | PrimaryButtonAsLink;

const PrimaryButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, PrimaryButtonProps>(
  (
    {
      children,
      loading,
      loadingText,
      fullWidth = true,
      size = 'default',
      className,
      href,
      ...rest
    },
    ref
  ) => {
    const isDisabled =
      href === undefined && Boolean((rest as ButtonHTMLAttributes<HTMLButtonElement>).disabled);
    const classes = `${isDisabled ? '' : 'group '}${BASE_CLASS} ${SIZE_CLASS[size]} ${fullWidth ? 'w-full' : 'shrink-0'}${className ? ` ${className}` : ''}`;
    const content = loading && loadingText ? loadingText : <SlotText text={children} />;

    if (href !== undefined) {
      return (
        <Link
          ref={ref as Ref<HTMLAnchorElement>}
          href={href}
          className={classes}
          {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        type="button"
        className={classes}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }
);
PrimaryButton.displayName = 'PrimaryButton';

export default PrimaryButton;
