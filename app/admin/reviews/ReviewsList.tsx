'use client';

import { useState } from 'react';

import ReviewCard, { type PendingReview } from './ReviewCard';

export default function ReviewsList({ initialReviews }: { initialReviews: PendingReview[] }) {
  const [reviews, setReviews] = useState(initialReviews);

  function handleResolved(id: string) {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  if (reviews.length === 0) {
    return (
      <p className="text-[13px] text-(--green-deep) opacity-60">
        Không có review nào đang chờ duyệt.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} onResolved={handleResolved} />
      ))}
    </div>
  );
}
