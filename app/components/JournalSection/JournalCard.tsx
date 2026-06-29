import Link from 'next/link';
import Image from 'next/image';
import { strapiMediaUrl } from '@/lib/strapi';
import type { JournalPost } from '@/lib/types';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${String(d.getMonth() + 1).padStart(2, '0')} . ${d.getFullYear()}`;
}

interface JournalCardProps {
  post: JournalPost;
  href: string;
}

export default function JournalCard({ post, href }: JournalCardProps) {
  const hasTags = post.category || post.published_date;

  return (
    <article className="group cursor-pointer">
      <Link href={href} className="block no-underline">
        <div
          data-media
          className="relative aspect-4/3 overflow-hidden [clip-path:inset(100%_0_0_0)]"
        >
          {post.cover_image ? (
            <Image
              src={strapiMediaUrl(post.cover_image.url)}
              alt={post.cover_image.alternativeText ?? post.title}
              fill
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-(--green-deep)/10" />
          )}
        </div>

        {hasTags && (
          <div className="flex gap-3.5 mt-4.5 mb-2.5 text-[11px] tracking-widest uppercase text-ink-faint">
            {post.category && <span>{post.category.name}</span>}
            {post.published_date && <span>{formatDate(post.published_date)}</span>}
          </div>
        )}

        <h3 className="text-[clamp(16px,1.5vw,21px)] font-[450] leading-[1.35] tracking-[-0.02em] max-w-[30ch] text-(--green-deep)">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="mt-2 text-sm leading-relaxed text-ink-faint line-clamp-2">
            {post.excerpt}
          </p>
        )}
      </Link>
    </article>
  );
}
