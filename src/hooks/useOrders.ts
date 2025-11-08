'use client';
import { useState, useEffect } from 'react';
import { Order, OrderStatus } from '@/types/order'; 
import { OrderService } from '@/services/orderService';
import { AuthUtils } from '@/utils/auth';

export const KANBAN_COLUMNS = [
  { id: 'pending', title: 'Chờ xử lý', color: 'text-yellow-700', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
  { id: 'confirmed', title: 'Đã xác nhận', color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  { id: 'processing', title: 'Đang xử lý', color: 'text-indigo-700', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' },
  { id: 'shipped', title: 'Đã giao hàng', color: 'text-purple-700', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  { id: 'completed', title: 'Hoàn tất', color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  { id: 'cancelled', title: 'Đã hủy', color: 'text-gray-700', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
];

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchOrders = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      if (!AuthUtils.isAuthenticated()) {
        alert('Vui lòng đăng nhập');
        window.location.href = '/login';
        return;
      }
      const response = await OrderService.getAllOrders(page, limit);
      if (response.success && response.data) {
        // Đảm bảo dữ liệu từ API có order_status
        const normalizedOrders = response.data.map(order => ({
          ...order,
          order_status: order.order_status || 'pending', // Giá trị mặc định nếu thiếu
        }));
        setOrders(normalizedOrders);
      } else {
        alert(response.message || 'Không thể tải danh sách đơn hàng');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Lỗi khi tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const getOrderById = async (id: string) => {
    try {
      const response = await OrderService.getOrderById(id);
      if (response.success && response.data) {
        return response.data as Order; // Ép kiểu rõ ràng
      }
      return null;
    } catch (error) {
      console.error('Error fetching order detail:', error);
      return null;
    }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    try {
      const response = await OrderService.updateOrderStatus(id, status);
      if (response.success) {
        alert(response.message || 'Cập nhật trạng thái thành công!');
        fetchOrders();
        return true;
      }
      alert('Lỗi: ' + (response.message || 'Không thể cập nhật trạng thái'));
      return false;
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Lỗi khi cập nhật trạng thái');
      return false;
    }
  };

  const openDetailModal = async (order: Order) => {
    const detailData = await getOrderById(order.id);
    if (detailData) {
      setSelectedOrder(detailData);
      setShowDetailModal(true);
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
  };

  const getOrdersByStatus = (status: OrderStatus): Order[] => {
    return orders.filter(order => order.order_status === status); // Sử dụng order_status
  };

  useEffect(() => {
    fetchOrders(1, 10);
  }, []);

  return {
    orders,
    loading,
    selectedOrder,
    showDetailModal,
    fetchOrders,
    updateOrderStatus,
    openDetailModal,
    closeDetailModal,
    getOrdersByStatus,
  };
}