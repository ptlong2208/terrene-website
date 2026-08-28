import { describe, expect, it } from 'vitest';

import { containsVietnameseProfanity } from '@/lib/profanityFilter';

describe('containsVietnameseProfanity', () => {
  it.each([
    ['sản phẩm này đụ má quá tệ, không đáng mua', true],
    ['sản phẩm rất tốt, đóng gói cẩn thận, sẽ ủng hộ tiếp', false],
    ['dm shop lừa đảo', true],
    ['cửa hàng này giao hàng chậm quá', false],
    ['thang cho ban hang', true],
    // "cua" (crab) contains "cu" as a substring — must not false-positive on word-boundary match
    ['con cua rất ngon', false],
    ['sản phẩm dùng ổn, giá hơi cao', false],
    ['vl shop này bán hàng dỏm', true],
    ['sản phẩm cực kì tuyệt vời', false],
  ])('%s -> %s', (text, expected) => {
    expect(containsVietnameseProfanity(text)).toBe(expected);
  });
});
