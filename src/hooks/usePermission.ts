'use client';
import { useState, useEffect } from 'react';
import { Permission, CreatePermissionRequest } from '@/types/permission';
import { AuthUtils } from '@/utils/auth';
import { ApiHelper } from '@/utils/api';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    XLSX: any;
  }
}

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
        toast.error('Vui lòng đăng nhập');
        window.location.href = '/login';
        return;
      }

      const response = await ApiHelper.get<Permission[]>('api/v1/permissions');
      
      if (response.success && response.data) {
        console.log('All permissions loaded:', response.data.length, 'items');
        setPermissions(Array.isArray(response.data) ? response.data : []);
      } else {
        toast.error(response.message || 'Không thể tải dữ liệu quyền');
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast.error('Lỗi khi tải quyền');
    } finally {
      setLoading(false);
    }
  };

  const deletePermission = async (permissionId: number) => {
    if (!permissionId) {
      toast.error("ID quyền không hợp lệ");
      return;
    }

    try {
      const response = await ApiHelper.delete(`api/v1/permissions/${permissionId}`);
      if (response.success) {
        toast.success("Xóa quyền thành công!");
        fetchPermissions();
      } else {
        toast.error(response.message || "Không thể xóa quyền");
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error("Lỗi: " + error.message);
    }
  };

  const createPermission = async (data: CreatePermissionRequest) => {
    try {
      const response = await ApiHelper.post('api/v1/permissions', data);

      if (response.success) {
        toast.success('Thêm quyền thành công!');
        fetchPermissions();
        return true;
      }

      toast.error('Lỗi: ' + (response.message || 'Không thể lưu quyền'));
      return false;
    } catch (error: any) {
      console.error('Create error:', error);

      const rawError = error?.message || '';

      if (
        rawError.includes('duplicate key value') ||
        rawError.includes('permissions_slug_key')
      ) {
        toast.error('Lỗi: Slug này đã tồn tại. Vui lòng nhập slug khác!');
      } else {
        toast.error('Lỗi: ' + rawError);
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
      const response = await ApiHelper.patch(`api/v1/permissions/${id}`, updateData);
      if (response.success) {
        toast.success('Cập nhật thành công!');
        fetchPermissions();
        return true;
      }
      toast.error('Lỗi: ' + (response.message || 'Không thể cập nhật quyền'));
      return false;
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error('Lỗi: ' + error.message);
      return false;
    }
  };

  const handleExportExcel = () => {
    if (!window.XLSX) {
      toast.loading('Đang tải thư viện Excel, vui lòng thử lại sau giây lát...');
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
      toast.loading('Đang tải thư viện Excel, vui lòng thử lại sau giây lát...');
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
          toast.error('File Excel trống hoặc không có dữ liệu');
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

        toast.success(`Import hoàn tất!\nThành công: ${successCount}\nThất bại: ${errorCount}`);
        fetchPermissions();

      } catch (error) {
        console.error('Error importing file:', error);
        toast.error('Lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng file.');
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