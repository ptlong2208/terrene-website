import Image from 'next/image';

import StarRating from '@/app/components/ui/StarRating';
import type { ProductReview } from '@/lib/types';
import { getAvatarColor } from '@/lib/utils';

interface ReviewItemProps {
  review: ProductReview;
}

export default function ReviewItem({ review }: ReviewItemProps) {
  return (
    <article className="border-line border-b py-5 first:pt-0 last:border-b-0 last:pb-0">
      <div className="mb-2.5 flex items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold text-white"
          style={{ backgroundColor: getAvatarColor(review.reviewerName) }}
        >
          {review.reviewerName.charAt(0).toUpperCase()}
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="text-[14px] font-bold text-(--green-deep)">{review.reviewerName}</span>
          <StarRating value={review.rating} size={12} />
        </div>
      </div>
      <p className="text-ink-soft text-[13px] leading-[1.65]">{review.comment}</p>
      {review.photos && review.photos.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {review.photos.map((src, i) => (
            // unoptimized: blob/Supabase Storage URL, domain not known upfront for next.config remotePatterns
            <Image
              key={i}
              src={src}
              alt=""
              width={74}
              height={74}
              unoptimized
              className="h-[74px] w-[74px] object-cover"
            />
          ))}
        </div>
      )}
    </article>
  );
}
