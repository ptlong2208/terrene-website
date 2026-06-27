export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US').format(price) + ' VNĐ';
}
