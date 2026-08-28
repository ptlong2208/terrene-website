'use client';

import Image from 'next/image';
import { useState } from 'react';

import Card from '@/app/components/ui/Card';
import { FORM_ERROR_CLASS } from '@/app/components/ui/formStyles';
import PrimaryButton from '@/app/components/ui/PrimaryButton';
import StarRating from '@/app/components/ui/StarRating';

export interface PendingReview {
  id: string;
  productSlug: string;
  productTitle: string;
  rating: number;
  reviewerName: string;
  reviewerEmail: string;
  comment: string;
  photoUrls: string[];
  createdAt: string;
}

interface ReviewCardProps {
  review: PendingReview;
  onResolved: (id: string) => void;
}

export default function ReviewCard({ review, onResolved }: ReviewCardProps) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handle(action: 'approve' | 'reject') {
    setLoading(action);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: action === 'approve' ? 'PATCH' : 'DELETE',
      });
      if (!res.ok) throw new Error('request failed');
      onResolved(review.id);
    } catch {
      setError('Có lỗi xảy ra, thử lại.');
      setLoading(null);
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-(--green-deep)">{review.productTitle}</p>
          <p className="text-[12px] text-(--green-deep) opacity-60">
            {review.reviewerName} —{' '}
            <a
              href={`mailto:${review.reviewerEmail}?subject=${encodeURIComponent(`Về đánh giá của bạn cho ${review.productTitle}`)}`}
              className="underline"
            >
              {review.reviewerEmail}
            </a>
          </p>
          <p className="text-[11px] text-(--green-deep) opacity-40">
            {new Date(review.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
          </p>
        </div>
        <div className="shrink-0">
          <StarRating value={review.rating} size={14} />
        </div>
      </div>

      <p className="text-ink-soft text-[13px] leading-[1.65]">{review.comment}</p>

      {review.photoUrls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {review.photoUrls.map((url) => (
            <Image
              key={url}
              src={url}
              alt=""
              width={96}
              height={96}
              className="h-24 w-24 rounded object-cover"
            />
          ))}
        </div>
      )}

      {error && <p className={FORM_ERROR_CLASS}>{error}</p>}

      <div className="flex gap-3">
        <PrimaryButton
          onClick={() => handle('approve')}
          disabled={loading !== null}
          loading={loading === 'approve'}
          loadingText="Đang duyệt..."
          size="compact"
          fullWidth={false}
        >
          Duyệt
        </PrimaryButton>
        <PrimaryButton
          onClick={() => handle('reject')}
          disabled={loading !== null}
          loading={loading === 'reject'}
          loadingText="Đang từ chối..."
          size="compact"
          fullWidth={false}
          className="bg-red-700"
        >
          Từ chối
        </PrimaryButton>
      </div>
    </Card>
  );
}
