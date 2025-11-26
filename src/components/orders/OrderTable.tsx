'use client';

import React, { useState } from 'react';
import { Eye, Package, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import OrderStatus from './OrderStatus';
import { useOrders } from '@/hooks/useOrders';
import OrderDetailModal from './OrderDetailModal';
import { Order } from '@/types/order';

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: 'COD',
  bank_transfer: 'Chuyển khoản',
  momo: 'MoMo',
  vnpay: 'VNPay',
  zalo_pay: 'ZaloPay',
};

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

const OrderTable: React.FC = () => {
  const {
    orders,
    loading,
    selectedOrder,
    showDetailModal,
    totalOrders,
    fetchOrders,
    openDetailModal,
    closeDetailModal,
    updateOrderStatus,
  } = useOrders();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalPages = totalOrders > 0 ? Math.ceil(totalOrders / itemsPerPage) : 1;
  const startItem = totalOrders === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalOrders);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || loading) return;
    setCurrentPage(page);
    fetchOrders();
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
    fetchOrders();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
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

  if (loading && orders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-12 text-center">
          <RefreshCw className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-16 text-center">
        <Package className="w-20 h-20 text-gray-400 mx-auto mb-5" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có đơn hàng</h3>
        <p className="text-gray-500">Khi có đơn hàng mới, chúng sẽ hiển thị tại đây.</p>
        <button
          onClick={() => fetchOrders()}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium shadow-md"
        >
          <RefreshCw className="w-5 h-5" />
          Tải lại
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border-gray-400 overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Danh sách đơn hàng 
          </h3>
          <button
            onClick={() => fetchOrders()}
            disabled={loading}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 disabled:opacity-50 transition font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Mã đơn</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Khách hàng</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Tổng tiền</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Trạng thái đơn</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Thanh toán</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Ngày đặt</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-emerald-50 transition-all duration-200 cursor-pointer group"
                  onClick={() => openDetailModal(order)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-emerald-700">#{order.order_number}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{order.customer_name || 'Khách lẻ'}</div>
                    <div className="text-xs text-gray-500">{order.customer_phone || 'Không có SĐT'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{formatCurrency(Number(order.total_amount))}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {PAYMENT_METHOD_LABELS[order.payment_method ?? ''] || order.payment_method}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <OrderStatus status={order.order_status} type="order" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <OrderStatus
                      status={(order.payment_status || 'pending') as any}
                      type="payment"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{order.order_date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetailModal(order);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-md"
                    >
                      <Eye className="w-4 h-4" />
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm">

          <div className="flex items-center gap-4">
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {ITEMS_PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} / trang
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="px-4 py-2 font-medium text-gray-700">
                Trang {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDetailModal && selectedOrder && (
        <OrderDetailModal
          show={showDetailModal}
          order={selectedOrder}
          onClose={closeDetailModal}
          permissions={{ canUpdateStatus: true }}
          onStatusUpdate={(newStatus) => {
            updateOrderStatus(selectedOrder.id, newStatus);
            setTimeout(() => fetchOrders(), 300);
          }}
        />
      )}
    </>
  );
};

export default OrderTable;