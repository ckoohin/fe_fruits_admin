'use client';
import React from 'react';
import { Order, OrderStatus } from '@/types/order';
import { KANBAN_COLUMNS } from '@/hooks/useOrders';
import { useOrders } from '@/hooks/useOrders';

interface OrderKanbanBoardProps {
  onCardClick: (order: Order) => void;
}

export default function OrderKanbanBoard({ onCardClick }: OrderKanbanBoardProps) {
  const { orders, loading, getOrdersByStatus } = useOrders();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            orders={getOrdersByStatus(column.id as OrderStatus)}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </div>
  );
}

interface KanbanColumnProps {
  column: { id: string; title: string; color: string; bgColor: string; borderColor: string };
  orders: Order[];
  onCardClick: (order: Order) => void;
}

function KanbanColumn({ column, orders, onCardClick }: KanbanColumnProps) {
  const getColumnStyle = (id: string) => {
    const styles: Record<string, { headerBg: string; headerText: string; badgeBg: string; cardAccent: string }> = {
      pending: {
        headerBg: 'bg-yellow-500',
        headerText: 'text-white',
        badgeBg: 'bg-white/20',
        cardAccent: 'border-l-yellow-400'
      },
      confirmed: {
        headerBg: 'bg-blue-500',
        headerText: 'text-white',
        badgeBg: 'bg-white/20',
        cardAccent: 'border-l-blue-400'
      },
      processing: {
        headerBg: 'bg-indigo-500',
        headerText: 'text-white',
        badgeBg: 'bg-white/20',
        cardAccent: 'border-l-indigo-400'
      },
      shipped: {
        headerBg: 'bg-purple-500',
        headerText: 'text-white',
        badgeBg: 'bg-white/20',
        cardAccent: 'border-l-purple-400'
      },
      completed: {
        headerBg: 'bg-green-500',
        headerText: 'text-white',
        badgeBg: 'bg-white/20',
        cardAccent: 'border-l-green-400'
      },
      cancelled: {
        headerBg: 'bg-gray-400',
        headerText: 'text-white',
        badgeBg: 'bg-white/20',
        cardAccent: 'border-l-gray-400'
      }
    };
    return styles[id] || styles.pending;
  };

  const style = getColumnStyle(column.id);

  return (
    <div className="flex flex-col h-full">
      <div className={`${style.headerBg} rounded-t-lg px-3 py-2.5`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold ${style.headerText} text-sm`}>
            {column.title}
          </h3>
          <span className={`${style.badgeBg} ${style.headerText} px-2 py-0.5 rounded-full text-xs font-bold`}>
            {orders.length}
          </span>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-b-lg p-2 flex-1 overflow-y-auto min-h-[500px] max-h-[calc(100vh-250px)] space-y-2">
        {orders.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-400 text-xs">
            Không có đơn hàng
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => onCardClick(order)}
              cardAccent={style.cardAccent}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  onClick: () => void;
  cardAccent: string;
}

function OrderCard({ order, onClick, cardAccent }: OrderCardProps) {
  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Number(amount));
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Chưa có ngày';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 ${cardAccent} hover:scale-[1.02]`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-sm text-gray-900 mb-0.5">
            {order.order_number || order.order_code || `ĐH #${order.id}`}
          </h4>
          <p className="text-xs text-gray-500">
            {formatDate(order.order_date)}
          </p>
        </div>
        <span className="text-xs text-gray-400">#{order.id}</span>
      </div>

      {order.customer_name && (
        <div className="flex items-center gap-1 mb-2 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="truncate font-medium">{order.customer_name}</span>
        </div>
      )}

      {order.customer_phone && (
        <div className="flex items-center gap-1 mb-2 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className="truncate">{order.customer_phone}</span>
        </div>
      )}

      <div className="bg-blue-50 rounded px-2 py-1.5 mb-2">
        <p className="text-xs text-gray-600 mb-0.5">Tổng tiền</p>
        <p className="font-bold text-sm text-blue-700">
          {formatCurrency(order.total_amount)}
        </p>
      </div>

      {order.payment_method && (
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-gray-500">Thanh toán:</span>
          <span className="font-medium text-gray-700 bg-purple-50 px-2 py-0.5 rounded">
            {order.payment_method}
          </span>
        </div>
      )}

      {order.notes && (
        <p className="text-xs text-gray-600 line-clamp-2 mb-2 italic bg-amber-50 p-1.5 rounded">
          "{order.notes}"
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
        <span className="truncate">{order.created_by || 'Hệ thống'}</span>
        {order.items && order.items.length > 0 && (
          <span className="font-medium text-blue-600 ml-2">
            {order.items.length} SP
          </span>
        )}
      </div>
    </div>
  );
}