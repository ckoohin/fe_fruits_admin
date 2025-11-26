'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { User } from '@/types/user';
import { Role } from '@/types/role';
import { AuthUtils } from '@/utils/auth';
import { ApiHelper } from '@/utils/api';
import { usePermissions } from '@/hooks/usePermissions';
import toast from 'react-hot-toast';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useUsers() {
  const [allUsers, setAllUsers] = useState<User[]>([]);    
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const limit = 15;                                        
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const { hasPermission } = usePermissions();
  const canViewUsers = hasPermission('view-users');

  useEffect(() => {
    setPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  const fetchAllUsers = useCallback(async () => {
    if (!canViewUsers) return;

    setLoading(true);
    try {
      if (!AuthUtils.isAuthenticated()) {
        toast.error('Vui lòng đăng nhập');
        window.location.href = '/login';
        return;
      }

      const response = await ApiHelper.get<{ data: User[] }>('api/v1/users');
      if (response.success && response.data) {
        const list = Array.isArray(response.data.data)
          ? response.data.data
          : Array.isArray(response.data)
          ? response.data
          : [];

        setAllUsers(list);
      } else {
        toast.error(response.message || 'Không thể tải danh sách');
      }
    } catch (error: any) {
      console.error('Lỗi tải user:', error);
      toast.error('Lỗi mạng');
    } finally {
      setLoading(false);
    }
  }, [canViewUsers]);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await ApiHelper.get<{ data: Role[] }>('api/v1/roles');
      if (res.success && res.data) {
        setRoles(res.data.data || []);
      }
    } catch (error) {
      console.error('Lỗi tải roles:', error);
    }
  }, []);

  useEffect(() => {
    if (canViewUsers) {
      fetchAllUsers();
      fetchRoles();
    }
  }, [canViewUsers, fetchAllUsers, fetchRoles]);

  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      const matchSearch =
        !searchTerm.trim() ||
        user.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.trim().toLowerCase());

      const matchRole = !roleFilter || user.roleId === roleFilter;
      const matchStatus = !statusFilter || user.status.toString() === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [allUsers, searchTerm, roleFilter, statusFilter]);

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, page, limit]);

  const pagination: PaginationMeta = {
    page,
    limit,
    total: filteredUsers.length,
    totalPages: Math.max(1, Math.ceil(filteredUsers.length / limit)),
  };

  return {
    users: paginatedUsers,       
    roles,
    loading,
    pagination,
    setPage,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    fetchUsers: fetchAllUsers,   
    canViewUsers,
  };
}