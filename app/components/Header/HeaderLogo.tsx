'use client';

import Link from 'next/link';
import Image from 'next/image';
import { strapiMediaUrl } from '@/lib/strapi';
import type { StrapiMedia } from '@/lib/types';

interface HeaderLogoProps {
  siteName: string;
  logo?: StrapiMedia;
  hasBg: boolean;
}

export default function HeaderLogo({ siteName, logo, hasBg }: HeaderLogoProps) {
  return (
    <Link href="/" className="justify-self-center hover:opacity-100!">
      {logo ? (
        <Image
          src={strapiMediaUrl(logo.url)}
          alt={siteName}
          width={34}
          height={34}
          className={`w-8.5 h-8.5 md:w-8 md:h-8 object-contain transition-[filter] duration-300 ${
            hasBg ? '' : 'brightness-0 invert'
          }`}
          priority
        />
      ) : (
        <span className="text-sm font-bold tracking-widest uppercase">{siteName}</span>
      )}
    </Link>
  );
}
