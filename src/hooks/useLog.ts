'use client';
import { useState, useEffect } from 'react';
import { ApiHelper } from '@/utils/api';
import { AuthUtils } from '@/utils/auth';
import { Log } from '@/types/log';

export function useLogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 15;

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      if (!AuthUtils.isAuthenticated()) {
        alert('Vui lòng đăng nhập');
        window.location.href = '/login';
        return;
      }

      const response = await ApiHelper.get<any>(`/api/v1/logs?page=${page}&limit=${itemsPerPage}`);

      if (response.success && Array.isArray(response.data)) {
        setLogs(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
        setCurrentPage(response.pagination?.currentPage || 1);
      } else {
        console.error('Dữ liệu log không hợp lệ:', response);
        setLogs([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải logs:', error);
      alert('Không thể tải danh sách logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return {
    logs,
    loading,
    currentPage,
    totalPages,
    fetchLogs,
    setCurrentPage,
  };
}