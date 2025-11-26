'use client';

import React, { useState, useEffect } from 'react';
import { Package, Download, RefreshCw, LayoutGrid, Table } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { Order } from '@/types/order';
import OrderTable from '@/components/orders/OrderTable';
import OrderKanban from '@/components/orders/OrderKanban';
import OrderDetailModal from '@/components/orders/OrderDetailModal';

type ViewMode = 'table' | 'kanban';

export default function OrdersPage() {
  const {
    orders,
    loading,
    showDetailModal,
    selectedOrder: orderFromHook,        
    fetchOrders,
    openDetailModal,
    closeDetailModal,
    updateOrderStatus,
  } = useOrders();

  const [localSelectedOrder, setLocalSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  useEffect(() => {
    if (showDetailModal && orderFromHook) {
      setLocalSelectedOrder(orderFromHook);
    }
  }, [showDetailModal, orderFromHook]);

  useEffect(() => {
    fetchOrders(); 
  }, [fetchOrders]);
 
  const handleCardClick = (order: Order) => {
    setLocalSelectedOrder(order);
    openDetailModal(order); 
  };

  const handleCloseModal = () => {
    setLocalSelectedOrder(null);
    closeDetailModal();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w mx-auto px-4 sm:px-6 lg:px-5 py-3 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="w-9 h-9 text-emerald-600" />
              Quản lý đơn hàng
            </h1>
            <p className="text-gray-600 mt-1">Theo dõi và xử lý đơn hàng của khách hàng</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-5 py-2.5 transition-all font-medium ${
                  viewMode === 'table'
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Table className="w-4 h-4" />
                Bảng
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-2 px-5 py-2.5 transition-all font-medium ${
                  viewMode === 'kanban'
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Kanban
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading && orders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center gap-3 text-gray-500">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span className="text-lg">Đang tải đơn hàng...</span>
              </div>
            </div>
          ) : (
            <>
              {viewMode === 'table' ? (
                <OrderTable />
              ) : (
                <OrderKanban onCardClick={handleCardClick} />
              )}
            </>
          )}
        </div>

        {(localSelectedOrder || showDetailModal) && (
          <OrderDetailModal
            show={true}
            order={localSelectedOrder || orderFromHook!}
            onClose={handleCloseModal}
            permissions={{ canUpdateStatus: true }}
            onStatusUpdate={(newStatus) => {
            updateOrderStatus(localSelectedOrder?.id || orderFromHook?.id!, newStatus);
            }}
          />
        )}
      </div>
    </div>
  );
}