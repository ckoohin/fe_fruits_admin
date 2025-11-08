'use client';

import React, { useState, useEffect } from 'react';
import { Package, Download, RefreshCw, LayoutGrid, Table } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { OrderTable, OrderKanban, OrderFilters, OrderDetail, FilterState } from '@/components/orders';

type ViewMode = 'table' | 'kanban';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    order_status: '',
    payment_status: '',
    payment_method: '',
    start_date: '',
    end_date: '',
  });
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    delivered: 0,
    cancelled: 0,
  });

  useEffect(() => {
    loadOrders();
    loadStats();
  }, [pagination.page, filters]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getOrders({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });

      if (response) {
        setOrders(response.data || []);
        setPagination((prev) => ({
          ...prev,
          total: response.total || 0,
          totalPages: response.totalPages || 0,
        }));
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await adminApi.getOrders({ limit: 1000 });
      if (response?.data) {
        const allOrders = response.data;
        setStats({
          total: allOrders.length,
          pending: allOrders.filter((o: any) => o.order_status === 'pending').length,
          processing: allOrders.filter((o: any) => 
            ['confirmed', 'processing', 'shipping'].includes(o.order_status)
          ).length,
          delivered: allOrders.filter((o: any) => o.order_status === 'delivered').length,
          cancelled: allOrders.filter((o: any) => o.order_status === 'cancelled').length,
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleViewDetail = (orderId: number) => {
    setSelectedOrderId(orderId);
  };

  const handleCloseDetail = () => {
    setSelectedOrderId(null);
  };

  const handleOrderUpdate = () => {
    loadOrders();
    loadStats();
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const response = await adminApi.updateOrderStatus(orderId, {
        order_status: newStatus,
      });
      
      if (response.success) {
        loadOrders();
        loadStats();
      }
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const handleExport = async () => {
    try {
      const response = await adminApi.getOrders({ ...filters, limit: 10000 });
      if (response?.data) {
        const csv = convertToCSV(response.data);
        downloadCSV(csv, 'orders.csv');
      }
    } catch (error) {
      console.error('Error exporting orders:', error);
    }
  };

  const convertToCSV = (data: any[]) => {
    const headers = [
      'Mã đơn',
      'Khách hàng',
      'Số điện thoại',
      'Tổng tiền',
      'Trạng thái đơn',
      'Trạng thái thanh toán',
      'Phương thức thanh toán',
      'Ngày đặt',
    ];

    const rows = data.map((order) => [
      order.order_number,
      order.customer_name,
      order.customer_phone,
      order.total_amount,
      order.order_status,
      order.payment_status,
      order.payment_method,
      new Date(order.created_at).toLocaleString('vi-VN'),
    ]);

    return [headers, ...rows].map((row) => row.join(',')).join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-gray-600 mt-1">Theo dõi và xử lý đơn hàng của khách hàng</p>
        </div>
        <div className="flex gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Table className="w-4 h-4" />
              Bảng
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Kanban
            </button>
          </div>
          
          <button
            onClick={loadOrders}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng đơn</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <Package className="w-10 h-10 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Chờ xác nhận</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
            <Package className="w-10 h-10 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đang xử lý</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.processing}</p>
            </div>
            <Package className="w-10 h-10 text-blue-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đã giao</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.delivered}</p>
            </div>
            <Package className="w-10 h-10 text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đã hủy</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.cancelled}</p>
            </div>
            <Package className="w-10 h-10 text-red-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <OrderFilters onFilterChange={handleFilterChange} initialFilters={filters} />

      {/* Orders View - Table or Kanban */}
      {viewMode === 'table' ? (
        <OrderTable orders={orders} loading={loading} onViewDetail={handleViewDetail} />
      ) : (
        <OrderKanban 
          orders={orders} 
          loading={loading} 
          onViewDetail={handleViewDetail}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Pagination - Only show for table view */}
      {viewMode === 'table' && !loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-lg shadow">
          <div className="text-sm text-gray-700">
            Hiển thị <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> đến{' '}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            trong tổng số <span className="font-medium">{pagination.total}</span> đơn hàng
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            {[...Array(pagination.totalPages)].map((_, i) => {
              const page = i + 1;
              if (
                page === 1 ||
                page === pagination.totalPages ||
                (page >= pagination.page - 2 && page <= pagination.page + 2)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg ${
                      page === pagination.page
                        ? 'bg-green-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (page === pagination.page - 3 || page === pagination.page + 3) {
                return <span key={page} className="px-2">...</span>;
              }
              return null;
            })}
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrderId && (
        <OrderDetail
          orderId={selectedOrderId}
          onClose={handleCloseDetail}
          onUpdate={handleOrderUpdate}
        />
      )}
    </div>
  );
}