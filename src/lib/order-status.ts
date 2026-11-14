export const ORDER_STATUSES = [
  'PENDING',
  'PROCESSING',
  'PAID',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'FULFILLED',
  'CANCELLED',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
  'FAILED',
] as const;

export type OrderStatusValue = (typeof ORDER_STATUSES)[number];

const LABELS: Record<string, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Preparing',
  PAID: 'Paid',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  FULFILLED: 'Completed',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
  PARTIALLY_REFUNDED: 'Partial refund',
  FAILED: 'Failed',
};

export const ORDER_TIMELINE = ['PENDING', 'PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'FULFILLED'] as const;

export function orderLabel(status: string) {
  return LABELS[status] || status;
}

export function paymentLabel(status: string) {
  if (status === 'PENDING' || status === 'FAILED') return 'Unpaid';
  if (status === 'REFUNDED' || status === 'PARTIALLY_REFUNDED') return orderLabel(status);
  if (status === 'CANCELLED') return '—';
  return 'Paid';
}

export function shippingLabel(status: string) {
  if (status === 'PACKED') return 'Packed';
  if (status === 'SHIPPED') return 'Shipped';
  if (status === 'DELIVERED' || status === 'FULFILLED') return 'Delivered';
  if (status === 'CANCELLED' || status === 'REFUNDED') return '—';
  return 'Not shipped';
}

export function timelineIndex(status: string) {
  if (status === 'CANCELLED' || status === 'REFUNDED' || status === 'PARTIALLY_REFUNDED' || status === 'FAILED') {
    return -1;
  }
  return ORDER_TIMELINE.indexOf(status as (typeof ORDER_TIMELINE)[number]);
}

export function quoteLabel(status: string) {
  if (status === 'NEW') return 'Pending';
  if (status === 'QUALIFIED') return 'Under review';
  if (status === 'WON') return 'Approved';
  if (status === 'LOST') return 'Rejected';
  return status;
}
