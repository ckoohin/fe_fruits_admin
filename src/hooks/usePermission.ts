'use client';
import { useState, useEffect } from 'react';
import { Permission, CreatePermissionRequest } from '@/types/permission';
import { AuthUtils } from '@/utils/auth';
import { ApiHelper } from '@/utils/api';

declare global {
  interface Window {
    XLSX: any;
  }
}

/**
 * Hook để quản lý TẤT CẢ permissions (trang admin)
 * Không phụ thuộc vào roleId của user
 */
export function usePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
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

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      if (!AuthUtils.isAuthenticated()) {
        alert('Vui lòng đăng nhập');
        window.location.href = '/login';
        return;
      }

      // ✅ Lấy TẤT CẢ permissions để quản lý (không theo roleId)
      console.log('🔄 Fetching ALL permissions for management...');
      const response = await ApiHelper.get<Permission[]>('api/v1/permissions');
      
      if (response.success && response.data) {
        console.log('✅ All permissions loaded:', response.data.length, 'items');
        setPermissions(Array.isArray(response.data) ? response.data : []);
      } else {
        alert(response.message || 'Không thể tải dữ liệu quyền');
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      alert('Lỗi khi tải quyền');
    } finally {
      setLoading(false);
    }
  };

  const deletePermission = async (permission: Permission) => {
    if (!permission || !permission.id) {
      alert('Dữ liệu quyền không hợp lệ');
      return;
    }
    
    if (!confirm(`Bạn có chắc muốn xóa quyền "${permission.name}"?`)) return;

    try {
      const response = await ApiHelper.delete(`api/v1/permissions/${permission.id}`);
      if (response.success) {
        alert('Xóa quyền thành công!');
        fetchPermissions();
      } else {
        alert('Lỗi: ' + (response.message || 'Không thể xóa quyền'));
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      alert('Lỗi: ' + error.message);
    }
  };

  const createPermission = async (data: CreatePermissionRequest) => {
    try {
      console.log('=== CREATE PERMISSION ===');
      console.log('Data:', data);

      const response = await ApiHelper.post('api/v1/permissions', data);

      if (response.success) {
        alert('Thêm quyền thành công!');
        fetchPermissions();
        return true;
      }

      alert('Lỗi: ' + (response.message || 'Không thể lưu quyền'));
      return false;
    } catch (error: any) {
      console.error('Create error:', error);

      const rawError = error?.message || '';

      if (
        rawError.includes('duplicate key value') ||
        rawError.includes('permissions_slug_key')
      ) {
        alert('Lỗi: Slug này đã tồn tại. Vui lòng nhập slug khác!');
      } else {
        alert('Lỗi: ' + rawError);
      }

      return false;
    }
  };

  const updatePermission = async (id: string, data: CreatePermissionRequest) => {
    try {
      const updateData: any = {
        name: data.name,
        slug: data.slug,
        description: data.description
      }; 
      console.log('=== UPDATE PERMISSION ===');
      console.log('ID:', id);
      console.log('Data:', updateData);
      
      const response = await ApiHelper.patch(`api/v1/permissions/${id}`, updateData);
      if (response.success) {
        alert('Cập nhật thành công!');
        fetchPermissions();
        return true;
      }
      alert('Lỗi: ' + (response.message || 'Không thể cập nhật quyền'));
      return false;
    } catch (error: any) {
      console.error('Update error:', error);
      alert('Lỗi: ' + error.message);
      return false;
    }
  };

  const handleExportExcel = () => {
    if (!window.XLSX) {
      alert('Đang tải thư viện Excel, vui lòng thử lại sau giây lát...');
      return;
    }

    const exportData = filteredPermissions.map(permission => {
      return {
        'ID': permission.id,
        'Tên Quyền': permission.name,
        'Slug': permission.slug,
        'Mô tả': permission.description || '',
        'Ngày tạo': new Date(permission.created_at).toLocaleDateString('vi-VN')
      };
    });

    const worksheet = window.XLSX.utils.json_to_sheet(exportData);
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, "permissions");
    
    const colWidths = [
      { wch: 8 },   // ID
      { wch: 30 },  // Tên Quyền
      { wch: 30 },  // Slug
      { wch: 60 },  // Mô tả
      { wch: 12 }   // Ngày tạo
    ];
    worksheet['!cols'] = colWidths;

    const fileName = `permissions_${new Date().toISOString().split('T')[0]}.xlsx`;
    window.XLSX.writeFile(workbook, fileName);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.XLSX) {
      alert('Đang tải thư viện Excel, vui lòng thử lại sau giây lát...');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const binaryStr = event.target?.result;
        const workbook = window.XLSX.read(binaryStr, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = window.XLSX.utils.sheet_to_json(firstSheet);
        
        if (jsonData.length === 0) {
          alert('File Excel trống hoặc không có dữ liệu');
          return;
        }
        
        const importedPermissions = jsonData.map((row: any) => ({
          name: row['Tên Quyền'] || '',
          slug: row['Slug'] || '',
          description: row['Mô tả'] || null,
        }));

        if (!confirm(`Bạn có muốn import ${importedPermissions.length} quyền không?`)) {
          return;
        }

        let successCount = 0;
        let errorCount = 0;

        for (const permission of importedPermissions) {
          try {
            const response = await ApiHelper.post('api/v1/permissions', permission);
            if (response.success) {
              successCount++;
            } else {
              errorCount++;
              console.error('Error importing permission:', permission.name, response.message);
            }
          } catch (error) {
            errorCount++;
            console.error('Error importing permission:', permission.name, error);
          }
        }

        alert(`Import hoàn tất!\nThành công: ${successCount}\nThất bại: ${errorCount}`);
        fetchPermissions();

      } catch (error) {
        console.error('Error importing file:', error);
        alert('Lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng file.');
      }
    };
    
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const filteredPermissions = permissions.filter(permission => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    return (
      permission.name.toLowerCase().includes(query) ||
      permission.slug.toLowerCase().includes(query) ||
      (permission.description && permission.description.toLowerCase().includes(query))
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPermissions = filteredPermissions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPermissions.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchPermissions();
  }, []);

  return {
    permissions,
    filteredPermissions,
    currentPermissions,
    loading,
    currentPage,
    searchQuery,
    xlsxLoaded,
    totalPages,
    itemsPerPage,
    setSearchQuery,
    setCurrentPage,
    fetchPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    handleExportExcel,
    handleImportExcel
  };
}