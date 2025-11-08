import React, { useState } from 'react';
import { Eye, Phone, MapPin, GripVertical, Package } from 'lucide-react';
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

interface OrderKanbanProps {
  orders: Order[];
  loading?: boolean;
  onViewDetail: (orderId: number) => void;
  onStatusChange?: (orderId: number, newStatus: string) => void;
}

const COLUMNS = [
  { id: 'pending', label: 'Chờ xác nhận', color: 'bg-yellow-50 border-yellow-200', badge: 'bg-yellow-500' },
  { id: 'confirmed', label: 'Đã xác nhận', color: 'bg-blue-50 border-blue-200', badge: 'bg-blue-500' },
  { id: 'processing', label: 'Đang xử lý', color: 'bg-indigo-50 border-indigo-200', badge: 'bg-indigo-500' },
  { id: 'shipping', label: 'Đang giao', color: 'bg-purple-50 border-purple-200', badge: 'bg-purple-500' },
  { id: 'delivered', label: 'Đã giao', color: 'bg-green-50 border-green-200', badge: 'bg-green-500' },
  { id: 'cancelled', label: 'Đã hủy', color: 'bg-red-50 border-red-200', badge: 'bg-red-500' },
];

const OrderKanban: React.FC<OrderKanbanProps> = ({ 
  orders, 
  loading, 
  onViewDetail,
  onStatusChange 
}) => {
  const [draggedOrderId, setDraggedOrderId] = useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const getOrdersByStatus = (status: string) =>
    orders.filter(order => order.order_status === status);

  const handleDragStart = (e: React.DragEvent, orderId: number) => {
    setDraggedOrderId(orderId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('orderId', orderId.toString());
  };

  const handleDragEnd = () => {
    setDraggedOrderId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (columnId: string) => setDragOverColumn(columnId);
  const handleDragLeave = () => setDragOverColumn(null);

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const orderId = parseInt(e.dataTransfer.getData('orderId'));
    if (onStatusChange && orderId) {
      const order = orders.find(o => o.id === orderId);
      if (order && order.order_status !== status) {
        onStatusChange(orderId, status);
      }
    }
    setDragOverColumn(null);
    setDraggedOrderId(null);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {COLUMNS.map((column) => (
          <div key={column.id} className={`rounded-lg border-2 ${column.color} p-4`}>
            <div className="animate-pulse">
              <div className="h-6 bg-gray-300 rounded mb-4"></div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded mb-3"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {COLUMNS.map((column) => {
        const columnOrders = getOrdersByStatus(column.id);
        const isOver = dragOverColumn === column.id;

        return (
          <div
            key={column.id}
            className={`rounded-lg border-2 p-4 min-h-[600px] transition-all ${column.color} ${
              isOver ? 'ring-2 ring-green-500 ring-opacity-50 scale-105' : ''
            }`}
            onDragOver={handleDragOver}
            onDragEnter={() => handleDragEnter(column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-300">
              <h3 className="font-semibold text-gray-900">{column.label}</h3>
              <span className={`${column.badge} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>
                {columnOrders.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-3">
              {columnOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  Không có đơn hàng
                </div>
              ) : (
                columnOrders.map((order) => (
                  <div
                    key={order.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, order.id)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 cursor-move hover:shadow-lg transition-all ${
                      draggedOrderId === order.id ? 'opacity-50 scale-95' : 'hover:scale-102'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900">
                          {order.order_number}
                        </span>
                      </div>
                      <OrderStatus status={order.payment_status as any} type="payment" />
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-start gap-2">
                        <Phone className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {order.customer_name}
                          </p>
                          <p className="text-xs text-gray-500">{order.customer_phone}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {order.shipping_address}
                        </p>
                      </div>
                    </div>

                    {/* Amount & Date */}
                    <div className="flex items-center justify-between mb-3 pt-3 border-t border-gray-100">
                      <span className="text-sm font-bold text-green-600">
                        {formatCurrency(order.total_amount)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(order.created_at)}
                      </span>
                    </div>

                    {/* View Detail Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetail(order.id);
                      }}
                      className="w-full flex items-center justify-center gap-1 px-3 py-2 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      Xem chi tiết
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Drop Zone Indicator */}
            {isOver && (
              <div className="mt-3 p-4 border-2 border-dashed border-green-500 rounded-lg bg-green-50 text-center text-sm text-green-700 font-medium">
                Thả đơn hàng vào đây
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrderKanban;