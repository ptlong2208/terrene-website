import type { CheckoutCustomer } from '@/lib/checkout';
import { SITE_URL } from '@/lib/config';

interface PaymentFailureAlertParams {
  orderCode: number;
  haravanOrderId: number;
  orderName: string;
  customer: CheckoutCustomer;
  amount: number;
  error: unknown;
}

export function paymentFailureTemplate({
  orderCode,
  haravanOrderId,
  orderName,
  customer,
  amount,
  error,
}: PaymentFailureAlertParams): { subject: string; html: string } {
  const subject = `[Terrene] Lỗi cập nhật đơn hàng ${orderName} sau khi thanh toán`;
  const errorMessage = error instanceof Error ? error.message : String(error);
  const timestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  const html = `
    <h2>Khách đã thanh toán nhưng cập nhật đơn hàng Haravan thất bại</h2>
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
      <tr><td>Mã đơn Haravan</td><td>${orderName}</td></tr>
      <tr><td>Mã đơn PayOS</td><td>${orderCode}</td></tr>
      <tr><td>Haravan Order ID (nội bộ)</td><td>${haravanOrderId}</td></tr>
      <tr><td>Khách hàng</td><td>${customer.name} — ${customer.phone} — ${customer.email}</td></tr>
      <tr><td>Số tiền</td><td>${amount.toLocaleString('vi-VN')} VND</td></tr>
      <tr><td>Thời gian</td><td>${timestamp}</td></tr>
      <tr><td>Lỗi</td><td>${errorMessage}</td></tr>
    </table>
    <p><b>Cần làm:</b> vào Haravan, tìm đơn hàng ${orderName}, cập nhật thủ công trạng thái thanh toán nếu chưa đúng.</p>
  `;

  return { subject, html };
}

interface ReviewPendingAlertParams {
  productSlug: string;
  rating: number;
  reviewerName: string;
  reviewerEmail: string;
  comment: string;
  photoCount: number;
}

export function reviewPendingTemplate({
  productSlug,
  rating,
  reviewerName,
  reviewerEmail,
  comment,
  photoCount,
}: ReviewPendingAlertParams): { subject: string; html: string } {
  const subject = `[Terrene Review] Đánh giá mới cho ${productSlug} đang chờ duyệt`;
  const timestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  const productUrl = `${SITE_URL}/shop/${productSlug}`;

  const html = `
    <h2>Có đánh giá mới đang chờ duyệt</h2>
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
      <tr><td>Sản phẩm</td><td><a href="${productUrl}">${productSlug}</a></td></tr>
      <tr><td>Đánh giá</td><td>${rating}/5 sao</td></tr>
      <tr><td>Người đánh giá</td><td>${reviewerName} — ${reviewerEmail}</td></tr>
      <tr><td>Nội dung</td><td>${comment}</td></tr>
      <tr><td>Số ảnh đính kèm</td><td>${photoCount}</td></tr>
      <tr><td>Thời gian</td><td>${timestamp}</td></tr>
    </table>
    <p><b>Cần làm:</b> vào Supabase Studio, bảng <code>reviews</code>, duyệt (đổi <code>status</code> thành <code>approved</code>) hoặc xoá nếu không phù hợp.</p>
  `;

  return { subject, html };
}
