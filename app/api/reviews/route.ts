import * as Sentry from '@sentry/nextjs';
import { type Ratelimit } from '@upstash/ratelimit';
import { randomUUID } from 'crypto';
import { type NextRequest } from 'next/server';

import { sendReviewPendingAlert } from '@/lib/alert';
import { SLUG_PATTERN } from '@/lib/checkout';
import { checkOrigin, errResponse, makeRatelimit } from '@/lib/checkoutHelpers';
import logger from '@/lib/logger';
import { isImageFlagged, isTextFlagged } from '@/lib/moderation';
import { containsVietnameseProfanity } from '@/lib/profanityFilter';
import { reviewSubmitSchema } from '@/lib/reviews';
import { supabasePublic } from '@/lib/supabase';

const log = logger.child({ module: 'reviews' });

let _ratelimit: Ratelimit | null = null;
function getRatelimit() {
  if (!_ratelimit) _ratelimit = makeRatelimit('ratelimit:reviews');
  return _ratelimit;
}

const BUCKET = 'review-photos';
const MAX_PHOTOS = 5;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const DEFAULT_PAGE_SIZE = 5;
const MAX_PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug') ?? '';
  if (!SLUG_PATTERN.test(slug)) {
    return errResponse(400, 'invalid_slug');
  }

  const offset = Math.max(Number(searchParams.get('offset')) || 0, 0);
  const limit = Math.min(
    Math.max(Number(searchParams.get('limit')) || DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE
  );

  try {
    const supabase = supabasePublic();

    const [page, allRatings] = await Promise.all([
      supabase
        .from('reviews')
        .select('id, reviewer_name, rating, comment, photo_urls, created_at', { count: 'exact' })
        .eq('product_slug', slug)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1),
      supabase.from('reviews').select('rating').eq('product_slug', slug).eq('status', 'approved'),
    ]);

    if (page.error || allRatings.error) {
      log.error({ error: page.error ?? allRatings.error, slug }, 'Failed to fetch reviews');
      return errResponse(500, 'server_error');
    }

    const ratings = (allRatings.data ?? []).map((r) => r.rating as number);
    const averageRating = ratings.length
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0;

    return Response.json({
      reviews: (page.data ?? []).map((r) => ({
        id: r.id as string,
        reviewerName: r.reviewer_name as string,
        rating: r.rating as number,
        comment: r.comment as string,
        photos: r.photo_urls as string[],
        createdAt: r.created_at as string,
      })),
      total: page.count ?? 0,
      averageRating,
    });
  } catch (err) {
    log.error({ err, slug }, 'Unexpected error fetching reviews');
    Sentry.captureException(err);
    return errResponse(500, 'server_error');
  }
}

export async function POST(req: NextRequest) {
  const originResult = checkOrigin(req);
  if (originResult instanceof Response) return originResult;

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'anonymous';
  const { success } = await getRatelimit().limit(ip);
  if (!success) {
    log.warn({ ip }, 'Rate limit exceeded');
    return errResponse(429, 'server_error');
  }

  const formData = await req.formData().catch(() => null);
  if (!formData) return errResponse(400, 'invalid_request');

  const parsed = reviewSubmitSchema.safeParse({
    productSlug: formData.get('productSlug'),
    rating: formData.get('rating'),
    reviewerName: formData.get('reviewerName'),
    reviewerEmail: formData.get('reviewerEmail'),
    comment: formData.get('comment'),
  });
  if (!parsed.success) {
    log.warn({ issues: parsed.error.issues }, 'Invalid review submission');
    return errResponse(400, 'invalid_request');
  }
  const { productSlug, rating, reviewerName, reviewerEmail, comment } = parsed.data;

  const photoFiles = formData
    .getAll('photos')
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, MAX_PHOTOS);

  try {
    const [openAiFlagged, photoFlags] = await Promise.all([
      isTextFlagged(comment),
      Promise.all(photoFiles.map((file) => isImageFlagged(file))),
    ]);
    const textFlagged = openAiFlagged || containsVietnameseProfanity(comment);
    if (textFlagged || photoFlags.some(Boolean)) {
      log.warn({ productSlug }, 'Review content flagged by moderation, rejected');
      return Response.json(
        {
          error: 'content_flagged',
          textFlagged,
          flaggedPhotoIndexes: photoFlags.flatMap((flagged, i) => (flagged ? [i] : [])),
        },
        { status: 400 }
      );
    }

    const supabase = supabasePublic();
    const photoUrls: string[] = [];

    for (const file of photoFiles) {
      if (file.size > MAX_PHOTO_BYTES) continue;
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${productSlug}/${randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type });
      if (uploadError) {
        log.error({ uploadError, productSlug }, 'Photo upload failed');
        continue;
      }
      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(path);
      photoUrls.push(publicUrl);
    }

    const { error: insertError } = await supabase.from('reviews').insert({
      product_slug: productSlug,
      rating,
      reviewer_name: reviewerName,
      reviewer_email: reviewerEmail,
      comment,
      photo_urls: photoUrls,
      status: 'pending',
    });

    if (insertError) {
      log.error({ insertError, productSlug }, 'Failed to insert review');
      Sentry.captureException(insertError);
      return errResponse(500, 'server_error');
    }

    log.info({ productSlug, reviewerEmail }, 'Review submitted, pending moderation');

    try {
      await sendReviewPendingAlert({
        productSlug,
        rating,
        reviewerName,
        reviewerEmail,
        comment,
        photoCount: photoUrls.length,
      });
    } catch (alertErr) {
      log.error({ alertErr, productSlug }, 'Failed to send review pending alert');
      Sentry.captureException(alertErr, { tags: { productSlug, alertFailed: true } });
    }

    return Response.json({ success: true });
  } catch (err) {
    log.error({ err, productSlug }, 'Unexpected error submitting review');
    Sentry.captureException(err);
    return errResponse(500, 'server_error');
  }
}
