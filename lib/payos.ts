import { createHmac, timingSafeEqual } from 'crypto';

export interface PayOSWebhookData {
  orderCode: number;
  amount: number;
  description: string;
  accountNumber: string;
  reference: string;
  transactionDateTime: string;
  currency: string;
  paymentLinkId: string;
  code: string;
  desc: string;
  counterAccountBankId?: string;
  counterAccountBankName?: string;
  counterAccountName?: string;
  counterAccountNumber?: string;
  virtualAccountName?: string;
  virtualAccountNumber?: string;
}

export function verifySignature(
  data: PayOSWebhookData,
  signature: string,
  checksumKey: string
): boolean {
  // Sort ALL data fields alphabetically and format as key=value pairs
  const sorted = Object.keys(data)
    .sort((a, b) => a.localeCompare(b))
    .map((k) => `${k}=${data[k as keyof PayOSWebhookData] ?? ''}`)
    .join('&');

  const expected = createHmac('sha256', checksumKey).update(sorted).digest();
  const received = Buffer.from(signature, 'hex');
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}
