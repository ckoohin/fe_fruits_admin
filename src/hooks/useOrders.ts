'use client';
import { useState, useEffect, useCallback } from 'react';
import { Order, OrderStatus } from '@/types/order';
import { OrderService } from '@/services/orderService';
import { AuthUtils } from '@/utils/auth';
import toast from 'react-hot-toast';

export const KANBAN_COLUMNS = [
  { id: 'pending',    title: 'Chờ xử lý',     color: 'text-yellow-700',  bgColor: 'bg-yellow-50',   borderColor: 'border-yellow-200' },
  { id: 'confirmed',  title: 'Đã xác nhận',   color: 'text-blue-700',    bgColor: 'bg-blue-50',     borderColor: 'border-blue-200' },
  { id: 'processing', title: 'Đang xử lý',    color: 'text-indigo-700',  bgColor: 'bg-indigo-50',   borderColor: 'border-indigo-200' },
  { id: 'shipped',    title: 'Đã giao hàng',  color: 'text-purple-700',  bgColor: 'bg-purple-50',   borderColor: 'border-purple-200' },
  { id: 'completed',  title: 'Hoàn tất',      color: 'text-green-700',   bgColor: 'bg-green-50',    borderColor: 'border-green-200' },
  { id: 'cancelled',  title: 'Đã hủy',        color: 'text-red-700',     bgColor: 'bg-red-50',      borderColor: 'border-red-200' },
];

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [totalOrders, setTotalOrders] = useState(0);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      if (!AuthUtils.isAuthenticated()) {
        toast.error('Vui lòng đăng nhập');
        window.location.href = '/login';
        return;
      }

      const response = await OrderService.getAllOrders({
        page: currentPage,
        limit: 15,
      });

      if (response.success && response.data) {
        const normalizedOrders: Order[] = response.data.items.map((item: any) => ({
          id: item.id || item._id,
          order_number: item.order_number || item.code || `DH${item.id || ''}`,
          customer_name: item.recipient_name || item.shipping_name || item.customer_name || 'Khách lẻ',
          customer_phone: item.recipient_phone || item.shipping_phone || item.customer_phone || 'Không có SĐT',
          total_amount: Number(item.total_amount || item.total || 0),
          order_status: (item.order_status || 'pending') as OrderStatus,
          payment_status: (item.payment_status || 'pending') as OrderStatus,
          payment_method: item.payment_method || 'cod',
          created_at: item.order_date || item.created_at || new Date().toISOString(),
          shipping_address: item.shipping_address || item.address || '',
          recipient_name: item.recipient_name,
          recipient_phone: item.recipient_phone,
        }));

        setOrders(normalizedOrders);
      } else {
        toast.error(response.message || 'Không thể tải danh sách đơn hàng');
        setOrders([]);
      }
    } catch (error: any) {
      console.error('Lỗi khi tải đơn hàng:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage]); 

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const getOrderById = async (id: string | number): Promise<Order | null> => {
    try {
      const response = await OrderService.getOrderById(String(id));
      if (response.success && response.data) {
        const item = response.data;
        return {
          ...item,
          customer_name: item.recipient_name || item.customer_name || 'Khách lẻ',
          customer_phone: item.recipient_phone || item.customer_phone || 'Không có SĐT',
        } as Order;
      }
      return null;
    } catch (error) {
      console.error('Lỗi lấy chi tiết đơn:', error);
      return null;
    }
  };

  const updateOrderStatus = async (id: string | number, status: OrderStatus) => {
    try {
      const response = await OrderService.updateOrderStatus(String(id), status);
      if (response.success) {
        toast.success('Cập nhật trạng thái thành công!');
        setOrders(prev => prev.map(o => o.id === id ? { ...o, order_status: status } : o));
        fetchOrders();
        if (selectedOrder?.id === id) {
          setSelectedOrder(prev => prev ? { ...prev, order_status: status } : null);
        }
        return true;
      }
      toast.error(response.message || 'Cập nhật thất bại');
      return false;
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái');
      return false;
    }
  };

  const openDetailModal = async (order: Order) => {
    const detail = await getOrderById(order.id);
    if (detail) {
      setSelectedOrder(detail);
      setShowDetailModal(true);
    } else {
      toast.error('Không thể tải chi tiết đơn hàng');
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
  };

  const getOrdersByStatus = useCallback((status: OrderStatus): Order[] => {
    return orders.filter(o => o.order_status === status);
  }, [orders]);

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  return {
    orders,
    loading,
    selectedOrder,
    showDetailModal,
    totalOrders,
    fetchOrders,
    updateOrderStatus,
    openDetailModal,
    closeDetailModal,
    getOrdersByStatus,
  };
}