import Link from 'next/link';
import TerreneLogo from '@/app/components/TerreneLogo';
import FooterNewsletter from '@/app/components/FooterNewsletter';
import type { NavLink } from '@/lib/types';

interface FooterProps {
  siteName: string;
  legalLinks?: NavLink[];
  newsletterLabel?: string | null;
  newsletterPlaceholder?: string | null;
}

export default function Footer({
  siteName,
  legalLinks = [],
  newsletterLabel,
  newsletterPlaceholder,
}: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-(--green-deep) text-cream px-gutter">
      <div className="grid grid-cols-[1fr_1.1fr] gap-[clamp(40px,7vw,120px)] items-start py-[clamp(20px,3vh,36px)] border-b border-cream/14 max-md:grid-cols-1 max-md:gap-9">
        <div className="flex flex-col gap-[clamp(28px,4.5vh,52px)]">
          <div className="flex items-center gap-4">
            <TerreneLogo className="h-[clamp(40px,4vw,56px)] w-auto text-cream" aria-label={siteName} />
            <span className="font-display text-[clamp(34px,3.6vw,56px)] font-normal text-cream lowercase tracking-[-0.02em] leading-[0.9]">
              {siteName}
            </span>
          </div>
          <FooterNewsletter label={newsletterLabel} placeholder={newsletterPlaceholder} />
        </div>
        <div />
      </div>

      <div className="flex justify-between items-center pt-[18px] pb-[22px] font-display text-[10px] font-normal tracking-[0.06em] uppercase text-cream/30 max-md:flex-col max-md:gap-3">
        <p>© {siteName} {year}</p>
        {legalLinks.length > 0 && (
          <div className="flex gap-5">
            {legalLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className="text-cream/30 no-underline transition-colors duration-200 hover:text-cream/65"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}
