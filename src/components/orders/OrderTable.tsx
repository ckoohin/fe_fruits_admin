import React from 'react';
import { Eye, Package } from 'lucide-react';
import OrderStatus from './OrderStatus';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  order_status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
  shipping_address: string;
}

interface OrderTableProps {
  orders: Order[];
  loading?: boolean;
  onViewDetail: (orderId: number) => void;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: 'COD',
  bank_transfer: 'Chuyển khoản',
  momo: 'MoMo',
  vnpay: 'VNPay',
};

const OrderTable: React.FC<OrderTableProps> = ({ orders, loading, onViewDetail }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 border-t"></div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Không có đơn hàng</h3>
        <p className="text-gray-500">Chưa có đơn hàng nào phù hợp với tiêu chí tìm kiếm.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã đơn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khách hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tổng tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thanh toán
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày đặt
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{order.order_number}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{order.customer_name}</div>
                  <div className="text-sm text-gray-500">{order.customer_phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatCurrency(order.total_amount)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <OrderStatus status={order.order_status as any} type="order" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <OrderStatus status={order.payment_status as any} type="payment" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(order.created_at)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onViewDetail(order.id)}
                    className="inline-flex items-center gap-1 text-green-600 hover:text-green-900 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderTable;