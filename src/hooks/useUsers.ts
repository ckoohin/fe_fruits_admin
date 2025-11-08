'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types/user';
import { Role } from '@/types/role';
import { AuthUtils } from '@/utils/auth';
import { ApiHelper } from '@/utils/api';
import { usePermissions } from '@/hooks/usePermissions';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<number | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const { hasPermission } = usePermissions();
  const canViewUsers = hasPermission('view-users');

  const fetchUsers = useCallback(async () => {
    if (!canViewUsers) return;

    setLoading(true);
    try {
      if (!AuthUtils.isAuthenticated()) {
        alert('Vui lòng đăng nhập để xem trang này');
        window.location.href = '/login';
        return;
      }

      const params = {
        page,
        limit,
        search: searchTerm || undefined,
        role_id: roleFilter || undefined,
        status: statusFilter || undefined,
      };

      const response = await ApiHelper.get<{ data: User[]; meta?: PaginationMeta }>(
        'api/v1/users',
        params
      );

      if (response.success && response.data) {
        setUsers(Array.isArray(response.data) ? response.data : []);
        setTotal(response.meta?.total || 0);
      } else {
        alert(response.message || 'Không thể tải danh sách người dùng');
      }
    } catch (error: any) {
      console.error('Fetch users error:', error);
      alert('Lỗi khi tải người dùng');
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, roleFilter, statusFilter, canViewUsers]);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await ApiHelper.get<{ data: Role[] }>('api/v1/roles');
      if (response.success && response.data) {
        setRoles(response.data);
      }
    } catch (error) {
      console.error('Fetch roles error:', error);
    }
  }, []);

  const pagination: PaginationMeta = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };

  useEffect(() => {
    if (canViewUsers) {
      fetchRoles();
      fetchUsers();
    }
  }, [canViewUsers, fetchUsers]);

  useEffect(() => {
    if (canViewUsers) fetchUsers();
  }, [page, limit, searchTerm, roleFilter, statusFilter, canViewUsers, fetchUsers]);

  return {
    users,
    roles,
    loading,
    page,
    limit,
    total,
    pagination,
    setPage,
    setLimit,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    fetchUsers,
    canViewUsers,
  };
}