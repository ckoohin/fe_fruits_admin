import React from 'react';

export type OrderStatusType = 'pending' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled';
export type PaymentStatusType = 'pending' | 'paid' | 'failed' | 'refunded';

interface OrderStatusProps {
  status: OrderStatusType;
  type?: 'order' | 'payment';
}

const ORDER_STATUS_CONFIG: Record<OrderStatusType, { label: string; className: string }> = {
  pending: { label: 'Chờ xác nhận', className: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Đã xác nhận', className: 'bg-blue-100 text-blue-800' },
  processing: { label: 'Đang xử lý', className: 'bg-indigo-100 text-indigo-800' },
  shipping: { label: 'Đang giao', className: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Đã giao', className: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Đã hủy', className: 'bg-red-100 text-red-800' },
};

const PAYMENT_STATUS_CONFIG: Record<PaymentStatusType, { label: string; className: string }> = {
  pending: { label: 'Chờ thanh toán', className: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Đã thanh toán', className: 'bg-green-100 text-green-800' },
  failed: { label: 'Thất bại', className: 'bg-red-100 text-red-800' },
  refunded: { label: 'Đã hoàn tiền', className: 'bg-gray-100 text-gray-800' },
};

const OrderStatus: React.FC<OrderStatusProps> = ({ status, type = 'order' }) => {
  const config = type === 'order' 
    ? ORDER_STATUS_CONFIG[status as OrderStatusType]
    : PAYMENT_STATUS_CONFIG[status as PaymentStatusType];

  if (!config) return null;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

export default OrderStatus;