'use client';
import { useState, useEffect } from 'react';
import { Export, ExportStatus, KanbanColumn, CreateExportRequest, CancelExportRequest, ReviewBranchRequest, ReviewWarehouseRequest } from '@/types/export';
import { ExportService } from '@/services/exportService';
import { AuthUtils } from '@/utils/auth';

export const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'branch_pending',
    title: 'Chờ duyệt chi nhánh',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  {
    id: 'warehouse_pending',
    title: 'Chờ duyệt kho tổng',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  {
    id: 'processing',
    title: 'Đang xử lý',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'shipped',
    title: 'Đã gửi',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    id: 'completed',
    title: 'Đã hoàn thành',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  {
    id: 'cancelled',
    title: 'Đã hủy',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  }
];

export function useExports() {
  const [exports, setExports] = useState<Export[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExport, setSelectedExport] = useState<Export | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchExports = async () => {
    setLoading(true);
    try {
      if (!AuthUtils.isAuthenticated()) {
        alert('Vui lòng đăng nhập');
        window.location.href = '/login';
        return;
      }
      
      const response = await ExportService.getAll(1, 100);
      
      if (response.success && response.data) {
        setExports(Array.isArray(response.data) ? response.data : []);
      } else {
        alert(response.message || 'Không thể tải dữ liệu phiếu xuất');
      }
    } catch (error) {
      console.error('Error fetching exports:', error);
      alert('Lỗi khi tải phiếu xuất');
    } finally {
      setLoading(false);
    }
  };

  const getExportById = async (id: string) => {
    try {
      const response = await ExportService.getById(id);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching export detail:', error);
      return null;
    }
  };

  const requestTransfer = async (data: CreateExportRequest) => {
    try {
      const response = await ExportService.requestTransfer(data);
      if (response.success) {
        alert('Tạo yêu cầu chuyển kho thành công!');
        fetchExports();
        return true;
      }
      alert('Lỗi: ' + (response.message || 'Không thể tạo yêu cầu chuyển kho'));
      return false;
    } catch (error: any) {
      console.error('Request transfer error:', error);
      alert('Lỗi: ' + error.message);
      return false;
    }
  };

  const reviewBranch = async (id: string, data: ReviewBranchRequest) => {
    try {
      const response = await ExportService.reviewBranch(id, data);
      if (response.success) {
        alert(`Duyệt yêu cầu chi nhánh ${data.action === 'approve' ? 'thành công' : 'bị từ chối'}!`);
        fetchExports();
        return true;
      }
      alert('Lỗi: ' + (response.message || 'Không thể duyệt yêu cầu chi nhánh'));
      return false;
    } catch (error: any) {
      console.error('Review branch error:', error);
      alert('Lỗi: ' + error.message);
      return false;
    }
  };

  const reviewWarehouse = async (id: string, data: ReviewWarehouseRequest) => {
    try {
      const response = await ExportService.reviewWarehouse(id, data);
      if (response.success) {
        alert(`Duyệt kho tổng ${data.action === 'approve' ? 'thành công' : 'bị từ chối'}!`);
        fetchExports();
        return true;
      }
      alert('Lỗi: ' + (response.message || 'Không thể duyệt kho tổng'));
      return false;
    } catch (error: any) {
      console.error('Review warehouse error:', error);
      alert('Lỗi: ' + error.message);
      return false;
    }
  };

  const shipTransfer = async (id: string) => {
    try {
      const response = await ExportService.shipTransfer(id);
      if (response.success) {
        alert('Xác nhận gửi hàng thành công!');
        fetchExports();
        return true;
      }
      alert('Lỗi: ' + (response.message || 'Không thể xác nhận gửi hàng'));
      return false;
    } catch (error: any) {
      console.error('Ship transfer error:', error);
      alert('Lỗi: ' + error.message);
      return false;
    }
  };

  const receiveTransfer = async (id: string) => {
    try {
      const response = await ExportService.receiveTransfer(id);
      if (response.success) {
        alert('Xác nhận nhận hàng thành công!');
        fetchExports();
        return true;
      }
      alert('Lỗi: ' + (response.message || 'Không thể xác nhận nhận hàng'));
      return false;
    } catch (error: any) {
      console.error('Receive transfer error:', error);
      alert('Lỗi: ' + error.message);
      return false;
    }
  };

  const cancelExport = async (id: string, data: CancelExportRequest) => {
    try {
      const response = await ExportService.cancelExport(id, data);
      if (response.success) {
        alert('Hủy yêu cầu chuyển kho thành công!');
        fetchExports();
        return true;
      }
      alert('Lỗi: ' + (response.message || 'Không thể hủy yêu cầu chuyển kho'));
      return false;
    } catch (error: any) {
      console.error('Cancel error:', error);
      alert('Lỗi: ' + error.message);
      return false;
    }
  };

  const openDetailModal = async (exportItem: Export) => {
    const detailData = await getExportById(exportItem.id);
    if (detailData) {
      setSelectedExport(detailData);
      setShowDetailModal(true);
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedExport(null);
  };

  const getExportsByStatus = (status: ExportStatus): Export[] => {
    return exports.filter(exp => exp.status === status);
  };

  useEffect(() => {
    fetchExports();
  }, []);

  return {
    exports,
    loading,
    selectedExport,
    showDetailModal,
    showCreateModal,
    setShowCreateModal,
    fetchExports,
    requestTransfer,
    reviewBranch,
    reviewWarehouse,
    shipTransfer,
    receiveTransfer,
    cancelExport,
    openDetailModal,
    closeDetailModal,
    getExportsByStatus
  };
}