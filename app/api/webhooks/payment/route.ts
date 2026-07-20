import { createHmac } from 'crypto';
import { type NextRequest } from 'next/server';

import { createHaravanOrder } from '@/lib/haravan';
import { takePendingOrder } from '@/lib/orderStore';

interface PayOSWebhookData {
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

interface PayOSWebhookBody {
  code: string;
  desc: string;
  success: boolean;
  data: PayOSWebhookData;
  signature: string;
}

function verifySignature(data: PayOSWebhookData, signature: string, checksumKey: string): boolean {
  // Sort ALL data fields alphabetically and format as key=value pairs
  const sorted = Object.keys(data)
    .sort()
    .map((k) => `${k}=${data[k as keyof PayOSWebhookData] ?? ''}`)
    .join('&');

  const expected = createHmac('sha256', checksumKey).update(sorted).digest('hex');
  return expected === signature;
}

export async function POST(req: NextRequest) {
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
  if (!checksumKey) return Response.json({ error: 'Server misconfiguration.' }, { status: 500 });

  let body: PayOSWebhookBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const { code, success, data, signature } = body;

  if (!verifySignature(data, signature, checksumKey)) {
    return Response.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  // Only process successful payments (code '00')
  if (!success || code !== '00') {
    return Response.json({ message: 'Ignored non-success event.' }, { status: 200 });
  }

  const order = takePendingOrder(data.orderCode);
  if (!order) {
    // Already processed or expired — acknowledge to stop retries
    return Response.json({ message: 'Order already processed or expired.' }, { status: 200 });
  }

  try {
    await createHaravanOrder(order.customer, order.items, data.orderCode);
  } catch (err) {
    console.error('[webhook] Haravan order creation failed:', err);
    // Return 500 so PayOS retries the webhook
    return Response.json({ error: 'Order creation failed.' }, { status: 500 });
  }

  return Response.json({ message: 'OK' }, { status: 200 });
}
