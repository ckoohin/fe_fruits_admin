'use client';

import { useState, useEffect } from 'react';
import { ApiHelper } from '@/utils/api';
import { AuthUtils } from '@/utils/auth';
import { Log } from '@/types/log';
import toast from 'react-hot-toast';

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

export function useLogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 15;

  const fetchLogs = async (page: number = 1) => {
    setLoading(true);
    try {
      if (!AuthUtils.isAuthenticated()) {
        toast.error('Vui lòng đăng nhập');
        window.location.href = '/login';
        return;
      }

      const response = await ApiHelper.get<any>(
        `api/v1/logs?page=${page}&limit=${itemsPerPage}`
      );

      console.log('Raw response:', response); // Để debug

      if (response.success) {
        // XỬ LÝ CHÍNH XÁC CẤU TRÚC LỒNG 2 LỚP
        const rawData = response.data || {};
        const logList = Array.isArray(rawData.data) ? rawData.data : [];
        const pagination = rawData.pagination || response.pagination || {};

        setLogs(logList);
        setCurrentPage(pagination.currentPage || page);
        setTotalPages(pagination.totalPages || 1);
        setTotalItems(pagination.totalItems || logList.length);
      } else {
        toast.error(response.message || 'Không thể tải logs');
        setLogs([]);
        setCurrentPage(1);
        setTotalPages(1);
      }
    } catch (error: any) {
      console.error('Lỗi tải logs:', error);
      toast.error('Lỗi kết nối: ' + error.message);
      setLogs([]);
      setCurrentPage(1);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Gọi khi thay đổi trang
  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage]);

  // Load lần đầu
  useEffect(() => {
    fetchLogs(1);
  }, []);

  return {
    logs,
    loading,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    fetchLogs,
    setCurrentPage,
  };
}