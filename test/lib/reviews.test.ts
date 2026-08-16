import { describe, expect, it } from 'vitest';

import { reviewFieldsSchema, reviewSubmitSchema } from '@/lib/reviews';

const validFields = {
  reviewerName: 'Nguyễn Văn A',
  reviewerEmail: 'reviewer@example.com',
  comment: 'Sản phẩm rất tốt, đóng gói cẩn thận.',
};

describe('reviewFieldsSchema', () => {
  it('accepts fully valid fields', () => {
    expect(reviewFieldsSchema.safeParse(validFields).success).toBe(true);
  });

  it('rejects a comment under the 10-character minimum', () => {
    expect(reviewFieldsSchema.safeParse({ ...validFields, comment: 'Tốt' }).success).toBe(false);
  });

  it('rejects a comment over the 1000-character maximum', () => {
    expect(
      reviewFieldsSchema.safeParse({ ...validFields, comment: 'a'.repeat(1001) }).success
    ).toBe(false);
  });
});

describe('reviewSubmitSchema', () => {
  const validSubmit = { ...validFields, productSlug: 'bat-katakuchi-den', rating: 5 };

  it('accepts a fully valid submission', () => {
    expect(reviewSubmitSchema.safeParse(validSubmit).success).toBe(true);
  });

  it.each([
    [0, false],
    [1, true],
    [5, true],
    [6, false],
    [3.5, false], // must be an integer
  ])('rating %s -> valid: %s', (rating, expected) => {
    expect(reviewSubmitSchema.safeParse({ ...validSubmit, rating }).success).toBe(expected);
  });

  it('coerces a string rating from FormData into a number', () => {
    const result = reviewSubmitSchema.safeParse({ ...validSubmit, rating: '5' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.rating).toBe(5);
  });

  it('rejects a productSlug with uppercase letters or spaces', () => {
    expect(
      reviewSubmitSchema.safeParse({ ...validSubmit, productSlug: 'Bat Katakuchi' }).success
    ).toBe(false);
  });
});
