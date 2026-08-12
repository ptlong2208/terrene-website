'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

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

// TEMP: mock data cho tới khi nối Supabase — thay bằng fetch GET /api/reviews?slug=... khi có API thật.
const MOCK_REVIEWS: ProductReview[] = [
  {
    id: '1',
    reviewerName: 'Linh Trần',
    rating: 5,
    comment: 'Matcha thơm, vị thanh và umami rõ. Pha latte cực hợp, đóng gói đẹp. Sẽ ủng hộ tiếp!',
    createdAt: '2026-07-20',
  },
  {
    id: '2',
    reviewerName: 'Minh Phạm',
    rating: 4,
    comment: 'Chất lượng tốt so với giá, vị cân bằng dễ uống mỗi ngày. Giao hàng nhanh.',
    createdAt: '2026-07-12',
  },
  {
    id: '3',
    reviewerName: 'Hà Nguyễn',
    rating: 5,
    comment: 'Freeship nội thành rất tiện. Bột mịn, màu xanh đẹp, đánh lên bọt nhanh.',
    createdAt: '2026-06-30',
  },
  {
    id: '4',
    reviewerName: 'Quốc Bảo',
    rating: 4,
    comment: 'Vị hơi nhạt hơn mình mong đợi nhưng đóng gói kỹ, giao đúng hẹn.',
    createdAt: '2026-06-18',
  },
  {
    id: '5',
    reviewerName: 'Thảo Vy',
    rating: 5,
    comment: 'Pha usucha ngon, bọt mịn lên nhanh. Sẽ mua lại chắc chắn.',
    createdAt: '2026-06-05',
  },
  {
    id: '6',
    reviewerName: 'Đức Anh',
    rating: 3,
    comment: 'Ổn trong tầm giá, nhưng mình thích vị đậm hơn nên chưa quá ấn tượng.',
    createdAt: '2026-05-22',
  },
  {
    id: '7',
    reviewerName: 'Ngọc Mai',
    rating: 5,
    comment: 'Đây là lần thứ 3 mình mua rồi, chất lượng ổn định, nhân viên tư vấn nhiệt tình.',
    createdAt: '2026-05-10',
  },
];

const PAGE_SIZE = 5;

export default function ReviewsSection({ productSlug, productTitle }: ReviewsSectionProps) {
  const t = useTranslations('reviews');
  const [reviews, setReviews] = useState<ProductReview[]>(MOCK_REVIEWS);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [modalOpen, setModalOpen] = useState(false);

  const average = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  function handleSubmitted(review: ProductReview) {
    setReviews((prev) => [review, ...prev]);
  }

  return (
    <Card>
      <div className="border-line mb-5.5 flex flex-wrap items-start justify-between gap-4 border-b pb-5">
        <div>
          <h2 className="text-[clamp(20px,2vw,26px)] font-semibold tracking-[-0.02em] text-(--green-deep)">
            {t('title')}
          </h2>
          {reviews.length > 0 ? (
            <div className="mt-2 flex items-center gap-2.5">
              <StarRating value={average} size={15} label={t('title')} />
              <span className="text-ink-soft text-[13px]">
                {average.toFixed(1)} · {t('count', { count: reviews.length })}
              </span>
            </div>
          ) : (
            <p className="text-ink-soft mt-2 text-[13px]">{t('empty')}</p>
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

      <div className="flex flex-col">
        {reviews.slice(0, visibleCount).map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </div>

      {visibleCount < reviews.length && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="group inline-flex cursor-pointer items-center border-b border-current pb-0.75 text-[14px] font-semibold text-(--green-deep)"
          >
            <SlotText text={t('loadMore')} />
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
