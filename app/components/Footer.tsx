import Link from 'next/link';
import type { NavLink } from '@/lib/types';

interface FooterProps {
  siteName: string;
  legalLinks?: NavLink[];
}

export default function Footer({ siteName, legalLinks = [] }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-(--green-deep) text-cream px-gutter">
      <div className="flex justify-between items-center pt-[18px] pb-[22px] border-t border-cream/10 font-display text-[10px] font-normal tracking-[0.06em] uppercase text-cream/30 max-md:flex-col max-md:gap-3">
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
