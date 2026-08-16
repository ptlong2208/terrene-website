import type { CheckoutCustomer } from '@/lib/checkout';
import { paymentFailureTemplate } from '@/lib/emailTemplates';
import logger from '@/lib/logger';

const log = logger.child({ module: 'alert' });

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
  const apiKey = process.env.BREVO_API_KEY;
  const toEmail = process.env.ALERT_TO_EMAIL;
  const fromEmail = process.env.ALERT_FROM_EMAIL;
  if (!apiKey || !toEmail || !fromEmail) {
    log.warn(
      'Alert email not configured (missing BREVO_API_KEY/ALERT_TO_EMAIL/ALERT_FROM_EMAIL), skipping'
    );
    return;
  }

  const { subject, html } = paymentFailureTemplate(params);

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Terrene Alerts', email: fromEmail },
      to: [{ email: toEmail }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    throw new Error(`Brevo alert email failed: ${res.status} ${await res.text()}`);
  }
}
