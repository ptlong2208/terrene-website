import type { CheckoutCustomer } from '@/lib/checkout';
import { paymentFailureTemplate, reviewPendingTemplate } from '@/lib/emailTemplates';
import logger from '@/lib/logger';

const log = logger.child({ module: 'alert' });

async function sendAlertEmail(params: {
  senderName: string;
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const toEmail = process.env.ALERT_TO_EMAIL;
  const fromEmail = process.env.ALERT_FROM_EMAIL;
  if (!apiKey || !toEmail || !fromEmail) {
    log.warn(
      'Alert email not configured (missing BREVO_API_KEY/ALERT_TO_EMAIL/ALERT_FROM_EMAIL), skipping'
    );
    return;
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: params.senderName, email: fromEmail },
      to: [{ email: toEmail }],
      subject: params.subject,
      htmlContent: params.html,
    }),
  });

  if (!res.ok) {
    throw new Error(`Brevo alert email failed: ${res.status} ${await res.text()}`);
  }
}

interface SendPaymentFailureAlertParams {
  orderCode: number;
  haravanOrderId: number;
  orderName: string;
  customer: CheckoutCustomer;
  amount: number;
  error: unknown;
}

export async function sendPaymentFailureAlert(
  params: SendPaymentFailureAlertParams
): Promise<void> {
  const { subject, html } = paymentFailureTemplate(params);
  await sendAlertEmail({ senderName: 'Terrene Alerts', subject, html });
}

interface SendReviewPendingAlertParams {
  productSlug: string;
  productTitle: string;
  rating: number;
  reviewerName: string;
  reviewerEmail: string;
  comment: string;
  photoCount: number;
}

export async function sendReviewPendingAlert(params: SendReviewPendingAlertParams): Promise<void> {
  const { subject, html } = reviewPendingTemplate(params);
  await sendAlertEmail({ senderName: 'Terrene Reviews', subject, html });
}
