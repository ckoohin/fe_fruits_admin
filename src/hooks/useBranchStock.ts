'use client';
import { useState, useEffect } from 'react';
import { ApiHelper } from '@/utils/api';
import { AuthUtils } from '@/utils/auth';
import { BranchStock } from '@/types/inventory';
import toast from 'react-hot-toast';

export function useBranchStock() {
  const [branchStock, setBranchStock] = useState<BranchStock[]>([]);
  const [branchName, setBranchName] = useState<string>('Đang tải...');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;

  const user = AuthUtils.getUser();
  const userBranchId = user?.branchId;

  const fetchBranchStock = async (branchId: number) => {
    setLoading(true);
    try {
      if (!AuthUtils.isAuthenticated()) {
        toast.error('Vui lòng đăng nhập!');
        setLoading(false);
        return;
      }
      if (!branchId && branchId !== 0) {
        console.warn('No valid branchId found, retrying authentication...');
        await AuthUtils.getUser();
        const updatedUser = AuthUtils.getUser();
        if (!updatedUser?.branchId && updatedUser?.branchId !== 0) {
          toast.error('Vui lòng đảm bảo có thông tin chi nhánh sau khi đăng nhập!');
          setLoading(false);
          return;
        }
        return fetchBranchStock(updatedUser!.branchId);
      }
      const response = await ApiHelper.get<BranchStock[]>(`api/v1/inventory/branches/${branchId}/stock`);
      if (response.success && response.data) {
        setBranchStock(Array.isArray(response.data) ? response.data : []);
      } else {
        toast.error(response.message || 'Không thể tải dữ liệu tồn kho');
      }
    } catch (error) {
      console.error('Error fetching branch stock:', error);
      toast.error('Lỗi khi tải tồn kho chi nhánh');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (typeof window === 'undefined' || !window.XLSX) {
      toast.loading('Đang tải thư viện...');
      return;
    }
    const exportData = filteredBranchStock.map(item => ({
      'ID Biến thể': item.variant_id,
      'Tên Sản phẩm': item.product_name,
      'Biến thể': item.variant_name,
      'SKU': item.sku,
      'Số lượng': item.quantity
    }));
    const ws = window.XLSX.utils.json_to_sheet(exportData);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Tồn Kho Chi Nhánh");
    ws['!cols'] = [{ wch: 8 }, { wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 12 }];
    window.XLSX.writeFile(wb, `ton-kho-chi-nhanh_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredBranchStock = branchStock.filter(item => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      item.product_name.toLowerCase().includes(query) ||
      item.variant_name.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBranchStock = filteredBranchStock.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBranchStock.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (!user) {
      console.log('User not available, waiting for authentication...');
      return;
    }
    
    let effectBranchId = userBranchId;
    
    if (!effectBranchId && effectBranchId !== 0) {
      console.warn('No branchId found, retrying authentication...');
      const updatedUser = AuthUtils.getUser();
      if (!updatedUser?.branchId && updatedUser?.branchId !== 0) {
        toast.error('Vui lòng đảm bảo có thông tin chi nhánh sau khi đăng nhập!');
        setLoading(false);
        return;
      }
      effectBranchId = updatedUser!.branchId;
    }

    const fetchBranchName = async () => {
      try {
        const response = await ApiHelper.get<{ name: string }>(`api/v1/branches/${effectBranchId}`);
        if (response.success && response.data) {
          setBranchName(response.data.name);
        } else {
          setBranchName('Không xác định');
        }
      } catch (error) {
        console.error('Error fetching branch name:', error);
        setBranchName('Không xác định');
      }
    };

    fetchBranchName();
    fetchBranchStock(effectBranchId);
  }, [user?.id, userBranchId]); 

  return {
    branchStock,
    branchName,
    loading,
    currentPage,
    searchQuery,
    filteredBranchStock,
    currentBranchStock,
    totalPages,
    itemsPerPage,
    userBranchId,
    setSearchQuery,
    setCurrentPage,
    handleExportExcel
  };
}