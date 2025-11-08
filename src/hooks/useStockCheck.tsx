'use client';
import { useState, useEffect } from 'react';
import { ApiHelper } from '@/utils/api';
import { AuthUtils } from '@/utils/auth';
import { StockCheck, BranchStock, CreateStockCheckRequest } from '@/types/inventory';

export function useStockChecks() {
  const [stockChecks, setStockChecks] = useState<StockCheck[]>([]);
  const [branchStock, setBranchStock] = useState<BranchStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;

  // Lấy branch_id từ user đăng nhập
  const user = AuthUtils.getUser();
  const userBranchId = user?.branchId;

  // Fetch danh sách phiếu kiểm kho
  const fetchStockChecks = async () => {
    setLoading(true);
    try {
      if (!AuthUtils.isAuthenticated()) {
        alert('Vui lòng đăng nhập');
        window.location.href = '/login';
        return;
      }

      const response = await ApiHelper.get<any>('api/v1/inventory/checks?page=1&limit=100');
      
      if (response.success && response.data) {
        const checksData = response.data.data || response.data;
        setStockChecks(Array.isArray(checksData) ? checksData : []);
      } else {
        alert(response.message || 'Không thể tải dữ liệu');
      }
    } catch (error) {
      console.error('Error fetching stock checks:', error);
      alert('Lỗi khi tải danh sách kiểm kho');
    } finally {
      setLoading(false);
    }
  };

  // Fetch tồn kho của chi nhánh
  const fetchBranchStock = async (branchId: number) => {
    try {
      const response = await ApiHelper.get<BranchStock[]>(`api/v1/inventory/branches/${branchId}/stock`);
      
      if (response.success && response.data) {
        setBranchStock(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching branch stock:', error);
    }
  };

  // Tạo phiếu kiểm kho mới
  const createStockCheck = async (data: CreateStockCheckRequest) => {
    try {
      const response = await ApiHelper.post('api/v1/inventory/checks', data);
      if (response.success) {
        alert('Tạo phiếu kiểm kho thành công!');
        fetchStockChecks();
        return response.data;
      }
      alert('Lỗi: ' + (response.message || 'Không thể tạo phiếu kiểm'));
      return null;
    } catch (error: any) {
      console.error('Create error:', error);
      alert('Lỗi: ' + error.message);
      return null;
    }
  };

  // Thêm item vào phiếu kiểm
  const addItemToCheck = async (checkId: number, variantId: number, countedQuantity: number) => {
    try {
      const response = await ApiHelper.post(`api/v1/inventory/checks/${checkId}/items`, {
        variantId,
        countedQuantity
      });
      
      if (response.success) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Add item error:', error);
      return false;
    }
  };

  // Cập nhật số lượng item
  const updateItemQuantity = async (checkId: number, itemId: number, countedQuantity: number) => {
    try {
      const response = await ApiHelper.patch(
        `api/v1/inventory/checks/${checkId}/items/${itemId}`,
        { countedQuantity }
      );
      return response.success;
    } catch (error) {
      console.error('Update item error:', error);
      return false;
    }
  };

  // Xóa item khỏi phiếu kiểm
  const removeItemFromCheck = async (checkId: number, itemId: number) => {
    try {
      const response = await ApiHelper.delete(`api/v1/inventory/checks/${checkId}/items/${itemId}`);
      return response.success;
    } catch (error) {
      console.error('Remove item error:', error);
      return false;
    }
  };

  // Hoàn thành phiếu kiểm
  const completeStockCheck = async (checkId: number) => {
    try {
      const response = await ApiHelper.post(`api/v1/inventory/checks/${checkId}/complete`, {});
      if (response.success) {
        alert('Hoàn thành kiểm kho và cập nhật tồn kho thành công!');
        fetchStockChecks();
        return true;
      }
      alert('Lỗi: ' + response.message);
      return false;
    } catch (error: any) {
      alert('Lỗi: ' + error.message);
      return false;
    }
  };

  // Hủy phiếu kiểm
  const cancelStockCheck = async (checkId: number) => {
    if (!confirm('Bạn có chắc muốn hủy phiếu kiểm này?')) return false;

    try {
      const response = await ApiHelper.delete(`api/v1/inventory/checks/${checkId}`);
      if (response.success) {
        alert('Đã hủy phiếu kiểm');
        fetchStockChecks();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Cancel error:', error);
      return false;
    }
  };

  // Lấy chi tiết phiếu kiểm
  const getStockCheckDetail = async (checkId: number): Promise<StockCheck | null> => {
    try {
      const response = await ApiHelper.get<StockCheck>(`api/v1/inventory/checks/${checkId}`);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Get detail error:', error);
      return null;
    }
  };

  // Filter
  const filteredStockChecks = stockChecks.filter(check => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    return (
      check.branch_name.toLowerCase().includes(query) ||
      check.user_name.toLowerCase().includes(query) ||
      check.notes.toLowerCase().includes(query) ||
      check.status.toLowerCase().includes(query)
    );
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStockChecks = filteredStockChecks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStockChecks.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchStockChecks();
    if (userBranchId) {
      fetchBranchStock(userBranchId);
    }
  }, [userBranchId]);

  return {
    stockChecks,
    branchStock,
    filteredStockChecks,
    currentStockChecks,
    loading,
    currentPage,
    searchQuery,
    totalPages,
    itemsPerPage,
    userBranchId,
    setSearchQuery,
    setCurrentPage,
    fetchStockChecks,
    fetchBranchStock,
    createStockCheck,
    addItemToCheck,
    updateItemQuantity,
    removeItemFromCheck,
    completeStockCheck,
    cancelStockCheck,
    getStockCheckDetail
  };
}
