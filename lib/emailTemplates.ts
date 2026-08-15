import type { CheckoutCustomer } from '@/lib/checkout';

interface PaymentFailureAlertParams {
  orderCode: number;
  haravanOrderId: number;
  customer: CheckoutCustomer;
  amount: number;
  error: unknown;
}

export function paymentFailureTemplate({
  orderCode,
  haravanOrderId,
  customer,
  amount,
  error,
}: PaymentFailureAlertParams): { subject: string; html: string } {
  const subject = `[Terrene] Lỗi cập nhật đơn hàng #${orderCode} sau khi thanh toán`;
  const errorMessage = error instanceof Error ? error.message : String(error);
  const timestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  const html = `
    <h2>Khách đã thanh toán nhưng cập nhật đơn hàng Haravan thất bại</h2>
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
      <tr><td>Mã đơn PayOS</td><td>${orderCode}</td></tr>
      <tr><td>Haravan Order ID</td><td>${haravanOrderId}</td></tr>
      <tr><td>Khách hàng</td><td>${customer.name} — ${customer.phone} — ${customer.email}</td></tr>
      <tr><td>Số tiền</td><td>${amount.toLocaleString('vi-VN')} VND</td></tr>
      <tr><td>Thời gian</td><td>${timestamp}</td></tr>
      <tr><td>Lỗi</td><td>${errorMessage}</td></tr>
    </table>
    <p><b>Cần làm:</b> vào Haravan, kiểm tra đơn hàng Haravan ID ${haravanOrderId}, cập nhật thủ công trạng thái thanh toán nếu chưa đúng.</p>
  `;

  return { subject, html };
}
