import { createHmac, timingSafeEqual } from 'crypto';

const PAYOS_BASE_URL = 'https://api-merchant.payos.vn';

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

export interface PayOSPaymentInfo {
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED';
  amount: number;
}

export async function getPaymentStatus(orderCode: number): Promise<PayOSPaymentInfo> {
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  if (!clientId || !apiKey) {
    throw new Error('PayOS credentials are not configured');
  }

  const res = await fetch(`${PAYOS_BASE_URL}/v2/payment-requests/${orderCode}`, {
    headers: { 'x-client-id': clientId, 'x-api-key': apiKey },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`PayOS get payment status failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  if (data.code !== '00') {
    throw new Error(`PayOS error ${data.code}: ${data.desc}`);
  }

  return { status: data.data.status, amount: data.data.amount };
}
