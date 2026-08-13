'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import ReviewFormModal from '@/app/components/ReviewFormModal';
import ReviewItem from '@/app/components/ReviewItem';
import Card from '@/app/components/ui/Card';
import PrimaryButton from '@/app/components/ui/PrimaryButton';
import SlotText from '@/app/components/ui/SlotText';
import StarRating from '@/app/components/ui/StarRating';
import type { ProductReview } from '@/lib/types';

interface ReviewsSectionProps {
  productSlug: string;
  productTitle: string;
}

interface ReviewsResponse {
  reviews: ProductReview[];
  total: number;
  averageRating: number;
}

const PAGE_SIZE = 5;

async function fetchReviews(slug: string, offset: number): Promise<ReviewsResponse | null> {
  try {
    const res = await fetch(
      `/api/reviews?slug=${encodeURIComponent(slug)}&offset=${offset}&limit=${PAGE_SIZE}`
    );
    if (!res.ok) return null;
    return (await res.json()) as ReviewsResponse;
  } catch {
    return null;
  }
}

export default function ReviewsSection({ productSlug, productTitle }: ReviewsSectionProps) {
  const t = useTranslations('reviews');
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [total, setTotal] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchReviews(productSlug, 0).then((data) => {
      if (cancelled) return;
      setReviews(data?.reviews ?? []);
      setTotal(data?.total ?? 0);
      setAverageRating(data?.averageRating ?? 0);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [productSlug]);

  async function handleLoadMore() {
    setLoadingMore(true);
    const data = await fetchReviews(productSlug, reviews.length);
    if (data) setReviews((prev) => [...prev, ...data.reviews]);
    setLoadingMore(false);
  }

  function handleSubmitted() {
    setModalOpen(false);
    setSubmitted(true);
  }

  return (
    <Card>
      <div className="border-line mb-5.5 flex flex-wrap items-start justify-between gap-4 border-b pb-5">
        <div>
          <h2 className="text-[clamp(20px,2vw,26px)] font-semibold tracking-[-0.02em] text-(--green-deep)">
            {t('title')}
          </h2>
          {!loading && total > 0 ? (
            <div className="mt-2 flex items-center gap-2.5">
              <StarRating value={averageRating} size={15} label={t('title')} />
              <span className="text-ink-soft text-[13px]">
                {averageRating.toFixed(1)} · {t('count', { count: total })}
              </span>
            </div>
          ) : (
            !loading && <p className="text-ink-soft mt-2 text-[13px]">{t('empty')}</p>
          )}
        </div>
        <PrimaryButton
          type="button"
          onClick={() => setModalOpen(true)}
          fullWidth={false}
          size="compact"
        >
          {t('writeReview')}
        </PrimaryButton>
      </div>

      {submitted && (
        <p className="mb-5 bg-[#E2E892]/25 px-4 py-3 text-[13px] text-(--green-deep)">
          {t('submittedPending')}
        </p>
      )}

      <div className="flex flex-col">
        {reviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </div>

      {reviews.length < total && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => void handleLoadMore()}
            disabled={loadingMore}
            className="group inline-flex cursor-pointer items-center border-b border-current pb-0.75 text-[14px] font-semibold text-(--green-deep) disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SlotText text={loadingMore ? t('loading') : t('loadMore')} />
          </button>
        </div>
      )}

      <ReviewFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        productSlug={productSlug}
        productTitle={productTitle}
        onSubmitted={handleSubmitted}
      />
    </Card>
  );
}
