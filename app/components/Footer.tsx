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
    <footer className="text-cream px-gutter bg-(--green-deep)">
      <div className="border-cream/14 grid grid-cols-[1fr_1.1fr] items-start gap-[clamp(40px,7vw,120px)] border-b py-[clamp(20px,3vh,36px)] max-md:grid-cols-1 max-md:gap-9">
        <div className="flex flex-col gap-[clamp(28px,4.5vh,52px)]">
          <div className="flex items-center gap-4">
            <TerreneLogo
              className="text-cream h-[clamp(40px,4vw,56px)] w-auto"
              aria-label={siteName}
            />
            <span className="font-display text-cream text-[clamp(34px,3.6vw,56px)] leading-[0.9] font-normal tracking-[-0.02em] lowercase">
              {siteName}
            </span>
          </div>
          <FooterNewsletter label={newsletterLabel} placeholder={newsletterPlaceholder} />
        </div>
        <div />
      </div>

      <div className="font-display text-cream/30 flex items-center justify-between pt-[18px] pb-[22px] text-[10px] font-normal tracking-[0.06em] uppercase max-md:flex-col max-md:gap-3">
        <p>
          © {siteName} {year}
        </p>
        {legalLinks.length > 0 && (
          <div className="flex gap-5">
            {legalLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className="text-cream/30 hover:text-cream/65 no-underline transition-colors duration-200"
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
