import { createHmac } from 'crypto';
import { describe, expect, it } from 'vitest';

import { type PayOSWebhookData, verifySignature } from '@/lib/payos';

const CHECKSUM_KEY = 'test-checksum-key';

const data: PayOSWebhookData = {
  orderCode: 12345,
  amount: 100000,
  description: 'Test order',
  accountNumber: '0123456789',
  reference: 'REF123',
  transactionDateTime: '2026-08-15 10:00:00',
  currency: 'VND',
  paymentLinkId: 'link-id',
  code: '00',
  desc: 'success',
};

function signWith(payload: PayOSWebhookData, key: string): string {
  const sorted = Object.keys(payload)
    .sort((a, b) => a.localeCompare(b))
    .map((k) => `${k}=${payload[k as keyof PayOSWebhookData] ?? ''}`)
    .join('&');
  return createHmac('sha256', key).update(sorted).digest('hex');
}

describe('verifySignature', () => {
  it('accepts a correctly signed payload', () => {
    const signature = signWith(data, CHECKSUM_KEY);
    expect(verifySignature(data, signature, CHECKSUM_KEY)).toBe(true);
  });

  it('rejects a payload where a field was tampered with after signing', () => {
    const signature = signWith(data, CHECKSUM_KEY);
    const tampered = { ...data, amount: 999999999 };
    expect(verifySignature(tampered, signature, CHECKSUM_KEY)).toBe(false);
  });

  it('rejects a signature produced with the wrong checksum key', () => {
    const signature = signWith(data, 'wrong-key');
    expect(verifySignature(data, signature, CHECKSUM_KEY)).toBe(false);
  });

  it('rejects a malformed (non-hex) signature', () => {
    expect(verifySignature(data, 'not-a-valid-hex-signature', CHECKSUM_KEY)).toBe(false);
  });

  it('rejects an empty signature', () => {
    expect(verifySignature(data, '', CHECKSUM_KEY)).toBe(false);
  });
});
