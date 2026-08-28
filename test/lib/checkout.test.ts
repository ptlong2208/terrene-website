import { describe, expect, it } from 'vitest';

import { checkoutCustomerSchema } from '@/lib/checkout';

const validCustomer = {
  name: 'Nguyễn Văn A',
  phone: '0901234567',
  email: 'customer@example.com',
  province: 'TP Hồ Chí Minh',
  ward: 'Phường Bến Nghé',
  wardCode: '26740',
  street: '12 Nguyễn Huệ',
};

describe('checkoutCustomerSchema', () => {
  it('accepts a fully valid customer', () => {
    expect(checkoutCustomerSchema.safeParse(validCustomer).success).toBe(true);
  });

  it.each([
    ['0901234567', true], // 0 + 9 digits — matches both mobile and landline (both 10 digits total)
    ['090123456', false], // 0 + 8 digits — too short for any current VN number format
    ['+84901234567', true], // +84 + 9 digits
    ['090123456789', false], // too many digits
    ['0901234', false], // too few digits
    ['84901234567', false], // missing leading 0/+84
    ['not-a-phone', false],
  ])('phone %s -> valid: %s', (phone, expected) => {
    expect(checkoutCustomerSchema.safeParse({ ...validCustomer, phone }).success).toBe(expected);
  });

  it('rejects a street under the 5-character minimum', () => {
    expect(checkoutCustomerSchema.safeParse({ ...validCustomer, street: 'Abc' }).success).toBe(
      false
    );
  });

  it('rejects an empty province', () => {
    expect(checkoutCustomerSchema.safeParse({ ...validCustomer, province: '' }).success).toBe(
      false
    );
  });

  it('rejects a malformed wardCode', () => {
    expect(
      checkoutCustomerSchema.safeParse({ ...validCustomer, wardCode: 'not-a-code' }).success
    ).toBe(false);
  });

  it('accepts an optional note, and accepts its absence', () => {
    expect(
      checkoutCustomerSchema.safeParse({ ...validCustomer, note: 'Giao giờ hành chính' }).success
    ).toBe(true);
    expect(checkoutCustomerSchema.safeParse(validCustomer).success).toBe(true);
  });
});
