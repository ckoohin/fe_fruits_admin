'use client';
import { useState, useEffect } from 'react';
import { ApiHelper } from '@/utils/api';
import { AuthUtils } from '@/utils/auth';
import { Category, CreateCategoryRequest } from '@/types/category';

declare global {
  interface Window {
    XLSX: any;
  }
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
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

  const fetchCategories = async () => {
    setLoading(true);
    try {
      if (!AuthUtils.isAuthenticated()) {
        alert('Vui lòng đăng nhập');
        window.location.href = '/login';
        return;
      }
      const response = await ApiHelper.get<Category[]>('api/v1/categories');
      if (response.success && response.data) {
        setCategories(Array.isArray(response.data) ? response.data : []);
      } else {
        alert(response.message || 'Không thể tải dữ liệu');
      }
    } catch (error) {
      alert('Lỗi khi tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (category: Category) => {
    if (!confirm(`Xóa "${category.name}"?`)) return;
    try {
      const response = await ApiHelper.delete(`api/v1/categories/${category.id}`);
      if (response.success) {
        alert('Xóa thành công!');
        fetchCategories();
      } else {
        alert('Lỗi: ' + response.message);
      }
    } catch (error: any) {
      alert('Lỗi: ' + error.message);
    }
  };

  const createCategory = async (data: CreateCategoryRequest) => {
    try {
      const response = await ApiHelper.post('api/v1/categories', data);
      if (response.success) {
        alert('Thêm thành công!');
        fetchCategories();
        return true;
      }
      alert('Lỗi: ' + response.message);
      return false;
    } catch (error: any) {
      alert('Lỗi: ' + error.message);
      return false;
    }
  };

  const updateCategory = async (id: string, data: CreateCategoryRequest) => {
    try {
      const updateData: any = {
        name: data.name,
        slug: data.slug,
        parent_id: data.parent_id || null,
        sort_order: data.sort_order,
        is_active: data.is_active
      };
      if (data.description?.trim()) updateData.description = data.description;
      if (data.image?.trim()) updateData.image = data.image;
      
      const response = await ApiHelper.patch(`api/v1/categories/${id}`, updateData);
      if (response.success) {
        alert('Cập nhật thành công!');
        fetchCategories();
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
    const exportData = filteredCategories.map(cat => {
      const parent = cat.parent_id ? categories.find(c => c.id === cat.parent_id) : null;
      return {
        'ID': cat.id,
        'Tên Danh Mục': cat.name,
        'Slug': cat.slug,
        'Danh Mục Cha': parent ? parent.name : 'Gốc',
        'Mô Tả': cat.description || '',
        'Hình Ảnh': cat.image || '',
        'Thứ Tự': cat.sort_order || 0,
        'Trạng Thái': cat.is_active ? 'Hoạt động' : 'Tạm dừng',
        'Ngày Tạo': new Date(cat.created_at).toLocaleDateString('vi-VN')
      };
    });
    const ws = window.XLSX.utils.json_to_sheet(exportData);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Danh Mục");
    ws['!cols'] = [{ wch: 8 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 30 }, { wch: 40 }, { wch: 10 }, { wch: 12 }, { wch: 12 }];
    window.XLSX.writeFile(wb, `danh-muc_${new Date().toISOString().split('T')[0]}.xlsx`);
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

        const importData = jsonData.map((row: any) => {
          let parentId = null;
          if (row['Danh Mục Cha'] && row['Danh Mục Cha'] !== 'Gốc') {
            const parent = categories.find(c => c.name.toLowerCase() === row['Danh Mục Cha'].toLowerCase());
            parentId = parent?.id || null;
          }
          return {
            name: row['Tên Danh Mục'] || '',
            slug: row['Slug'] || '',
            parent_id: parentId,
            description: row['Mô Tả'] || '',
            image: row['Hình Ảnh'] || '',
            sort_order: Number(row['Thứ Tự']) || 0,
            is_active: row['Trạng Thái'] === 'Hoạt động'
          };
        });

        if (!confirm(`Import ${importData.length} danh mục?`)) return;

        let success = 0, error = 0;
        for (const cat of importData) {
          try {
            const res = await ApiHelper.post('api/v1/categories', cat);
            if (res.success) success++;
            else error++;
          } catch {
            error++;
          }
        }
        alert(`Thành công: ${success}\nThất bại: ${error}`);
        fetchCategories();
      } catch (error) {
        alert('Lỗi đọc file');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Filter
  const filteredCategories = categories.filter(cat => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const parent = cat.parent_id ? categories.find(c => c.id === cat.parent_id) : null;
    return (
      cat.name.toLowerCase().includes(query) ||
      cat.slug.toLowerCase().includes(query) ||
      (cat.description && cat.description.toLowerCase().includes(query)) ||
      (parent && parent.name.toLowerCase().includes(query))
    );
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    currentPage,
    searchQuery,
    filteredCategories,
    currentCategories,
    totalPages,
    itemsPerPage,
    xlsxLoaded,
    setSearchQuery,
    setCurrentPage,
    fetchCategories,
    deleteCategory,
    createCategory,
    updateCategory,
    handleExportExcel,
    handleImportExcel
  };
}