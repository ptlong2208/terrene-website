import { describe, expect, it } from 'vitest';

import { personEmailSchema, personNameSchema } from '@/lib/validation';

describe('personNameSchema', () => {
  it.each([
    ['A', false], // below min (1 char)
    ['An', true], // at min (2 chars)
    ['Nguyễn Văn A', true],
    ['A'.repeat(100), true], // at max
    ['A'.repeat(101), false], // above max
  ])('%s -> valid: %s', (name, expected) => {
    expect(personNameSchema.safeParse(name).success).toBe(expected);
  });
});

describe('personEmailSchema', () => {
  it.each([
    ['user@example.com', true],
    ['not-an-email', false],
    ['user@', false],
    ['@example.com', false],
    ['', false],
  ])('%s -> valid: %s', (email, expected) => {
    expect(personEmailSchema.safeParse(email).success).toBe(expected);
  });

  it('rejects an email over the 254-character max', () => {
    const longEmail = `${'a'.repeat(250)}@b.co`;
    expect(personEmailSchema.safeParse(longEmail).success).toBe(false);
  });
});
