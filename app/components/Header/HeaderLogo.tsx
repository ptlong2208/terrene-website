'use client';

import Link from 'next/link';

import TerreneLogo from '@/app/components/TerreneLogo';

interface HeaderLogoProps {
  siteName: string;
}

export default function HeaderLogo({ siteName }: HeaderLogoProps) {
  return (
    <Link href="/" className="justify-self-center hover:opacity-100!" aria-label={siteName}>
      <TerreneLogo className="h-8.5 w-8.5 md:h-8 md:w-8" />
    </Link>
  );
}
