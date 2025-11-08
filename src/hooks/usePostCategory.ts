'use client';
import { useState, useEffect } from 'react';
import { ApiHelper } from '@/utils/api';
import { AuthUtils } from '@/utils/auth';
import { PostCategory, CreatePostCategoryRequest, UpdatePostCategoryRequest } from '@/types/postCategory';

declare global {
  interface Window {
    XLSX: any;
  }
}

export function usePostCategories() {
  const [categories, setCategories] = useState<PostCategory[]>([]);
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

  const fetchCategories = async () => {
    setLoading(true);
    try {
      if (!AuthUtils.isAuthenticated()) {
        alert('Vui lòng đăng nhập');
        window.location.href = '/login';
        return;
      }
      const response = await ApiHelper.get<PostCategory[]>('/api/v1/post-categories');
      if (response.success && response.data) {
        setCategories(Array.isArray(response.data) ? response.data : []);
      } else {
        alert(response.message || 'Không thể tải danh sách danh mục bài viết');
      }
    } catch (error) {
      alert('Lỗi khi tải danh sách danh mục bài viết');
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (category: PostCategory) => {
    if (!confirm(`Xóa "${category.name}"?`)) return;
    try {
      const response = await ApiHelper.delete(`/api/v1/post-categories/${category.id}`);
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

  const createCategory = async (data: CreatePostCategoryRequest) => {
    try {
      const response = await ApiHelper.post('/api/v1/post-categories', data);
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

  const updateCategory = async (id: string, data: UpdatePostCategoryRequest) => {
    try {
      const response = await ApiHelper.patch(`/api/v1/post-categories/${id}`, data);
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

  const handleExportExcel = () => {
    if (!window.XLSX) {
      alert('Đang tải thư viện...');
      return;
    }
    const exportData = filteredCategories.map(category => ({
      'ID': category.id,
      'Tên': category.name,
      'Slug': category.slug,
      'Mô tả': category.description,
      'Parent ID': category.parent_id || '',
      'Ngày tạo': category.created_at,
      'Ngày cập nhật': category.updated_at,
    }));
    const ws = window.XLSX.utils.json_to_sheet(exportData);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Danh mục bài viết");
    ws['!cols'] = [{ wch: 8 }, { wch: 20 }, { wch: 20 }, { wch: 30 }, { wch: 12 }, { wch: 18 }, { wch: 18 }];
    window.XLSX.writeFile(wb, `danh-muc-bai-viet_${new Date().toISOString().split('T')[0]}.xlsx`);
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
          slug: row['Slug'] || '',
          description: row['Mô tả'] || '',
        }));

        if (!confirm(`Import ${importData.length} danh mục bài viết?`)) return;

        let success = 0, error = 0;
        for (const category of importData) {
          try {
            const res = await ApiHelper.post('/api/v1/post-categories', category);
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

  const filteredCategories = categories.filter(category => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      category.name.toLowerCase().includes(query) ||
      category.slug.toLowerCase().includes(query) ||
      category.description.toLowerCase().includes(query)
    );
  });

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
    handleImportExcel,
  };
}