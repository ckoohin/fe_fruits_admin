'use client';
import { useState, useEffect } from 'react';
import { ApiHelper } from '@/utils/api';
import { AuthUtils } from '@/utils/auth';
import { Tag, CreateTagRequest, UpdateTagRequest } from '@/types/tag';

declare global {
  interface Window {
    XLSX: any;
  }
}

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
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

  const fetchTags = async () => {
    setLoading(true);
    try {
      if (!AuthUtils.isAuthenticated()) {
        alert('Vui lòng đăng nhập');
        window.location.href = '/login';
        return;
      }
      const response = await ApiHelper.get<Tag[]>('/api/v1/tags');
      if (response.success && response.data) {
        setTags(Array.isArray(response.data) ? response.data : []);
      } else {
        alert(response.message || 'Không thể tải danh sách tags');
      }
    } catch (error) {
      alert('Lỗi khi tải danh sách tags');
    } finally {
      setLoading(false);
    }
  };

  const deleteTag = async (tag: Tag) => {
    if (!confirm(`Xóa "${tag.name}"?`)) return;
    try {
      const response = await ApiHelper.delete(`/api/v1/tags/${tag.id}`);
      if (response.success) {
        alert('Xóa thành công!');
        fetchTags();
      } else {
        alert('Lỗi: ' + response.message);
      }
    } catch (error: any) {
      alert('Lỗi: ' + error.message);
    }
  };

  const createTag = async (data: CreateTagRequest) => {
    try {
      const response = await ApiHelper.post('/api/v1/tags', data);
      if (response.success) {
        alert('Thêm thành công!');
        fetchTags();
        return true;
      }
      alert('Lỗi: ' + response.message);
      return false;
    } catch (error: any) {
      alert('Lỗi: ' + error.message);
      return false;
    }
  };

  const updateTag = async (id: string, data: UpdateTagRequest) => {
    try {
      const response = await ApiHelper.patch(`/api/v1/tags/${id}`, data);
      if (response.success) {
        alert('Cập nhật thành công!');
        fetchTags();
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
    const exportData = filteredTags.map(tag => ({
      'ID': tag.id,
      'Tên': tag.name,
      'Slug': tag.slug,
    }));
    const ws = window.XLSX.utils.json_to_sheet(exportData);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Tags");
    ws['!cols'] = [{ wch: 8 }, { wch: 20 }, { wch: 20 }];
    window.XLSX.writeFile(wb, `tags_${new Date().toISOString().split('T')[0]}.xlsx`);
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
        }));

        if (!confirm(`Import ${importData.length} tags?`)) return;

        let success = 0, error = 0;
        for (const tag of importData) {
          try {
            const res = await ApiHelper.post('/api/v1/tags', tag);
            if (res.success) success++;
            else error++;
          } catch {
            error++;
          }
        }
        alert(`Thành công: ${success}\nThất bại: ${error}`);
        fetchTags();
      } catch (error) {
        alert('Lỗi đọc file');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const filteredTags = tags.filter(tag => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      tag.name.toLowerCase().includes(query) ||
      tag.slug.toLowerCase().includes(query)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTags = filteredTags.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTags.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchTags();
  }, []);

  return {
    tags,
    loading,
    currentPage,
    searchQuery,
    filteredTags,
    currentTags,
    totalPages,
    itemsPerPage,
    xlsxLoaded,
    setSearchQuery,
    setCurrentPage,
    fetchTags,
    deleteTag,
    createTag,
    updateTag,
    handleExportExcel,
    handleImportExcel,
  };
}