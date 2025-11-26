'use client';
import { useState, useEffect } from 'react';
import { ApiHelper } from '@/utils/api';
import { AuthUtils } from '@/utils/auth';
import { Post, CreatePostRequest, UpdatePostRequest } from '@/types/post';
import { Category } from '@/types/category'; 
import toast from 'react-hot-toast';

declare global {
  interface Window {
    XLSX: any;
  }
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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

  const fetchPosts = async (page = 1, limit = itemsPerPage) => {
    setLoading(true);
    try {
      if (!AuthUtils.isAuthenticated()) {
        toast.error('Vui lòng đăng nhập');
        window.location.href = '/login';
        return;
      }
      const response = await ApiHelper.get<Post[]>(`/api/v1/posts?page=${page}&limit=${limit}`);
      if (response.success && response.data) {
        setPosts(Array.isArray(response.data) ? response.data : []);
      } else {
        toast.error(response.message || 'Không thể tải danh sách bài viết');
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await ApiHelper.get<Category[]>('/api/v1/categories');
      if (response.success && response.data) {
        setCategories(Array.isArray(response.data) ? response.data : []);
      } else {
        toast.error(response.message || 'Không thể tải danh sách danh mục');
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách danh mục');
    }
  };

  const deletePost = async (post: Post) => {
    if (!confirm(`Xóa "${post.title}"?`)) return;
    try {
      const response = await ApiHelper.delete(`/api/v1/posts/${post.id}`);
      if (response.success) {
        toast.success('Xóa thành công!');
        fetchPosts(currentPage, itemsPerPage);
      } else {
        toast.error('Lỗi: ' + response.message);
      }
    } catch (error: any) {
      toast.error('Lỗi: ' + error.message);
    }
  };

  const createPost = async (data: CreatePostRequest) => {
    try {
      const response = await ApiHelper.post('/api/v1/posts', data);
      if (response.success) {
        toast.success('Thêm thành công!');
        fetchPosts(currentPage, itemsPerPage);
        return true;
      }
      toast.error('Lỗi: ' + response.message);
      return false;
    } catch (error: any) {
      toast.error('Lỗi: ' + error.message);
      return false;
    }
  };

  const updatePost = async (id: string, data: UpdatePostRequest) => {
    try {
      const response = await ApiHelper.patch(`/api/v1/posts/${id}`, data);
      if (response.success) {
        toast.success('Cập nhật thành công!');
        fetchPosts(currentPage, itemsPerPage);
        return true;
      }
      toast.error('Lỗi: ' + response.message);
      return false;
    } catch (error: any) {
      toast.error('Lỗi: ' + error.message);
      return false;
    }
  };

  const handleExportExcel = () => {
    if (!window.XLSX) {
      toast.loading('Đang tải thư viện...');
      return;
    }
    const exportData = filteredPosts.map(post => ({
      'ID': post.id,
      'Tiêu đề': post.title,
      'Slug': post.slug,
      'Danh mục': post.category_name,
      'Tác giả': post.author_name,
      'Ngày tạo': post.created_at,
    }));
    const ws = window.XLSX.utils.json_to_sheet(exportData);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Posts");
    ws['!cols'] = [{ wch: 8 }, { wch: 30 }, { wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 15 }];
    window.XLSX.writeFile(wb, `posts_${new Date().toISOString().split('T')[0]}.xlsx`);
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
          toast.error('File trống');
          return;
        }

        const importData = jsonData.map((row: any) => ({
          title: row['Tiêu đề'] || '',
          slug: row['Slug'] || '',
          excerpt: row['Tóm tắt'] || '',
          content: row['Nội dung'] || '',
          category_id: row['Danh mục ID'] || 1, // Giả định
          is_published: !!row['Đã xuất bản'],
          published_at: row['Ngày xuất bản'] || new Date().toISOString(),
          tags: row['Tags'] ? row['Tags'].split(',').map(Number) : [],
        }));

        if (!confirm(`Import ${importData.length} bài viết?`)) return;

        let success = 0, error = 0;
        for (const post of importData) {
          try {
            const res = await ApiHelper.post('/api/v1/posts', post);
            if (res.success) success++;
            else error++;
          } catch {
            error++;
          }
        }
        alert(`Thành công: ${success}\nThất bại: ${error}`);
        fetchPosts(currentPage, itemsPerPage);
      } catch (error) {
        toast.error('Lỗi đọc file');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const filteredPosts = posts.filter(post => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      post.title.toLowerCase().includes(query) ||
      post.slug.toLowerCase().includes(query) ||
      post.category_name.toLowerCase().includes(query) ||
      post.author_name.toLowerCase().includes(query)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchPosts(currentPage, itemsPerPage);
    fetchCategories();
  }, [currentPage]);

  return {
    posts,
    categories,
    loading,
    currentPage,
    searchQuery,
    filteredPosts,
    currentPosts,
    totalPages,
    itemsPerPage,
    xlsxLoaded,
    setSearchQuery,
    setCurrentPage,
    deletePost,
    createPost,
    updatePost,
    handleExportExcel,
    handleImportExcel,
  };
}

