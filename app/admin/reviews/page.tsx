import { FORM_ERROR_CLASS } from '@/app/components/ui/formStyles';
import { supabaseServerClient } from '@/lib/supabase-server';
import { getProductTitlesBySlugs } from '@/sanity/lib/queries';

import AdminHeader from '../AdminHeader';
import type { PendingReview } from './ReviewCard';
import ReviewsList from './ReviewsList';

export default async function AdminReviewsPage() {
  const supabase = await supabaseServerClient();
  const { data, error } = await supabase
    .from('reviews')
    .select(
      'id, product_slug, rating, reviewer_name, reviewer_email, comment, photo_urls, created_at'
    )
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(50);

  const slugs = [...new Set((data ?? []).map((r) => r.product_slug as string))];
  const titlesBySlug = await getProductTitlesBySlugs(slugs);

  const reviews: PendingReview[] = (data ?? []).map((r) => ({
    id: r.id as string,
    productSlug: r.product_slug as string,
    productTitle: titlesBySlug[r.product_slug as string] ?? (r.product_slug as string),
    rating: r.rating as number,
    reviewerName: r.reviewer_name as string,
    reviewerEmail: r.reviewer_email as string,
    comment: r.comment as string,
    photoUrls: r.photo_urls as string[],
    createdAt: r.created_at as string,
  }));

  return (
    <main className="mx-auto max-w-2xl p-6">
      <AdminHeader />
      <h1 className="mb-6 text-[15px] font-semibold tracking-[0.06em] text-(--green-deep) uppercase">
        Reviews chờ duyệt
      </h1>
      {error ? (
        <p className={FORM_ERROR_CLASS}>Không tải được danh sách review.</p>
      ) : (
        <>
          {reviews.length === 50 && (
            <p className="mb-4 text-[12px] text-(--green-deep) opacity-60">
              Đang hiện 50 review cũ nhất
            </p>
          )}
          <ReviewsList initialReviews={reviews} />
        </>
      )}
    </main>
  );
}
