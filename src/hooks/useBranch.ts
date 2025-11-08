'use client';
import { useState, useEffect } from 'react';
import { ApiHelper } from '@/utils/api';
import { AuthUtils } from '@/utils/auth';
import { Branch, CreateBranchRequest } from '@/types/branch';

declare global {
  interface Window {
    XLSX: any;
  }
}

export function useBranches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [xlsxLoaded, setXlsxLoaded] = useState(false);
  const itemsPerPage = 10;

  // Load XLSX
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.XLSX) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      script.onload = () => setXlsxLoaded(true);
      document.head.appendChild(script);
    } else if (window.XLSX) {
      setXlsxLoaded(true);
    }
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      if (!AuthUtils.isAuthenticated()) {
        alert('Vui lòng đăng nhập');
        window.location.href = '/login';
        return;
      }
      const response = await ApiHelper.get<Branch[]>('api/v1/branches');
      if (response.success && response.data) {
        setBranches(Array.isArray(response.data) ? response.data : []);
      } else {
        alert(response.message || 'Không thể tải dữ liệu');
      }
    } catch (error) {
      alert('Lỗi khi tải danh sách chi nhánh');
    } finally {
      setLoading(false);
    }
  };

  const deleteBranch = async (branch: Branch) => {
    if (!confirm(`Xóa chi nhánh "${branch.name}"?`)) return;
    try {
      const response = await ApiHelper.delete(`api/v1/branches/${branch.id}`);
      if (response.success) {
        alert('Xóa thành công!');
        fetchBranches();
      } else {
        alert('Lỗi: ' + response.message);
      }
    } catch (error: any) {
      alert('Lỗi: ' + error.message);
    }
  };

  const createBranch = async (data: CreateBranchRequest) => {
    try {
      const response = await ApiHelper.post('api/v1/branches', data);
      if (response.success) {
        alert('Thêm thành công!');
        fetchBranches();
        return true;
      }
      alert('Lỗi: ' + response.message);
      return false;
    } catch (error: any) {
      alert('Lỗi: ' + error.message);
      return false;
    }
  };

  const updateBranch = async (id: number, data: CreateBranchRequest) => {
    try {
      const updateData = {
        name: data.name,
        address: data.address,
        is_active: data.is_active
      };
      
      const response = await ApiHelper.patch(`api/v1/branches/${id}`, updateData);
      if (response.success) {
        alert('Cập nhật thành công!');
        fetchBranches();
        return true;
      }
      alert('Lỗi: ' + response.message);
      return false;
    } catch (error: any) {
      alert('Lỗi: ' + error.message);
      return false;
    }
  };

  // Excel Export
  const handleExportExcel = () => {
    if (!window.XLSX) {
      alert('Đang tải thư viện...');
      return;
    }
    const exportData = filteredBranches.map(branch => ({
      'ID': branch.id,
      'Tên Chi Nhánh': branch.name,
      'Địa Chỉ': branch.address,
      'Trạng Thái': branch.is_active ? 'Hoạt động' : 'Tạm dừng',
      'Ngày Tạo': new Date(branch.created_at).toLocaleDateString('vi-VN')
    }));
    const ws = window.XLSX.utils.json_to_sheet(exportData);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Chi Nhánh");
    ws['!cols'] = [
      { wch: 8 },  // ID
      { wch: 30 }, // Tên
      { wch: 50 }, // Địa chỉ
      { wch: 12 }, // Trạng thái
      { wch: 12 }  // Ngày tạo
    ];
    window.XLSX.writeFile(wb, `chi-nhanh_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Excel Import
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !window.XLSX) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const wb = window.XLSX.read(event.target?.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonData = window.XLSX.utils.sheet_to_json(ws);
        
        if (jsonData.length === 0) {
          alert('File trống');
          return;
        }

        const importData = jsonData.map((row: any) => ({
          name: row['Tên Chi Nhánh'] || '',
          address: row['Địa Chỉ'] || '',
          is_active: row['Trạng Thái'] === 'Hoạt động'
        }));

        if (!confirm(`Import ${importData.length} chi nhánh?`)) return;

        let success = 0, error = 0;
        for (const branch of importData) {
          try {
            const res = await ApiHelper.post('api/v1/branches', branch);
            if (res.success) success++;
            else error++;
          } catch {
            error++;
          }
        }
        alert(`Thành công: ${success}\nThất bại: ${error}`);
        fetchBranches();
      } catch (error) {
        alert('Lỗi đọc file');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Filter
  const filteredBranches = branches.filter(branch => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      branch.name.toLowerCase().includes(query) ||
      branch.address.toLowerCase().includes(query)
    );
  });
  

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBranches = filteredBranches.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchBranches();
  }, []);

  return {
    branches,
    loading,
    currentPage,
    searchQuery,
    filteredBranches,
    currentBranches,
    totalPages,
    itemsPerPage,
    xlsxLoaded,
    setSearchQuery,
    setCurrentPage,
    fetchBranches,
    deleteBranch,
    createBranch,
    updateBranch,
    handleExportExcel,
    handleImportExcel
  };
}