'use client';
import { useState, useEffect } from 'react';
import { ApiHelper } from '@/utils/api';
import { AuthUtils } from '@/utils/auth';
import { Staff, CreateStaffRequest, UpdateStaffRequest } from '@/types/staff';

declare global {
  interface Window {
    XLSX: any;
  }
}

export function useStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [xlsxLoaded, setXlsxLoaded] = useState(false);
  const itemsPerPage = 10;

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

  const fetchStaff = async () => {
    setLoading(true);
    try {
      if (!AuthUtils.isAuthenticated()) {
        alert('Vui lòng đăng nhập');
        window.location.href = '/login';
        return;
      }
      const response = await ApiHelper.get<Staff[]>('/api/v1/staff');
      if (response.success && response.data) {
        setStaff(Array.isArray(response.data) ? response.data : []);
      } else {
        alert(response.message || 'Không thể tải dữ liệu');
      }
    } catch (error) {
      alert('Lỗi khi tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const deleteStaff = async (staffItem: Staff) => {
    if (!confirm(`Xóa "${staffItem.name}"?`)) return;
    try {
      const response = await ApiHelper.delete(`/api/v1/staff/${staffItem.id}`);
      if (response.success) {
        alert('Xóa thành công!');
        fetchStaff();
      } else {
        alert('Lỗi: ' + response.message);
      }
    } catch (error: any) {
      alert('Lỗi: ' + error.message);
    }
  };

  const createStaff = async (data: CreateStaffRequest) => {
    try {
      const response = await ApiHelper.post('/api/v1/staff', data);
      if (response.success) {
        alert('Thêm thành công!');
        fetchStaff();
        return true;
      }
      alert('Lỗi: ' + response.message);
      return false;
    } catch (error: any) {
      alert('Lỗi: ' + error.message);
      return false;
    }
  };

  const updateStaff = async (id: string, data: UpdateStaffRequest) => {
    try {
      const response = await ApiHelper.patch(`/api/v1/staff/${id}`, data);
      if (response.success) {
        alert('Cập nhật thành công!');
        fetchStaff();
        return true;
      }
      alert('Lỗi: ' + response.message);
      return false;
    } catch (error: any) {
      alert('Lỗi: ' + error.message);
      return false;
    }
  };

  const handleExportExcel = () => {
    if (!window.XLSX) {
      alert('Đang tải thư viện...');
      return;
    }
    const exportData = filteredStaff.map(staff => ({
      'ID': staff.id,
      'Tên': staff.name,
      'Email': staff.email,
      'Số điện thoại': staff.phone || '',
      'Trạng thái': staff.status === 1 ? 'Hoạt động' : 'Ngưng hoạt động',
      'Chi nhánh ID': staff.branch_id,
      'Tên chi nhánh': staff.branch_name,
      'Vai trò': staff.role_name,
    }));
    const ws = window.XLSX.utils.json_to_sheet(exportData);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Nhân viên");
    ws['!cols'] = [{ wch: 8 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 20 }];
    window.XLSX.writeFile(wb, `nhan-vien_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

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
          name: row['Tên'] || '',
          email: row['Email'] || '',
          role_id: Number(row['Vai trò ID']) || 0,
          branch_id: Number(row['Chi nhánh ID']) || 0,
        }));

        if (!confirm(`Import ${importData.length} nhân viên?`)) return;

        let success = 0, error = 0;
        for (const staff of importData) {
          try {
            const res = await ApiHelper.post('/api/v1/staff', staff);
            if (res.success) success++;
            else error++;
          } catch {
            error++;
          }
        }
        alert(`Thành công: ${success}\nThất bại: ${error}`);
        fetchStaff();
      } catch (error) {
        alert('Lỗi đọc file');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const filteredStaff = staff.filter(staff => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      staff.name.toLowerCase().includes(query) ||
      staff.email.toLowerCase().includes(query) ||
      staff.role_name.toLowerCase().includes(query) ||
      staff.branch_name.toLowerCase().includes(query)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStaff = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchStaff();
  }, []);

  return {
    staff,
    loading,
    currentPage,
    searchQuery,
    filteredStaff,
    currentStaff,
    totalPages,
    itemsPerPage,
    xlsxLoaded,
    setSearchQuery,
    setCurrentPage,
    fetchStaff,
    deleteStaff,
    createStaff,
    updateStaff,
    handleExportExcel,
    handleImportExcel,
  };
}