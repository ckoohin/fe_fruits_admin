'use client';

import { useState, useEffect, useCallback } from 'react';
import { Role, CreateRoleRequest } from '@/types/role';
import { AuthUtils } from '@/utils/auth';
import { ApiHelper } from '@/utils/api';
import toast from 'react-hot-toast';

interface UseRolesReturn {
  roles: Role[];
  filteredRoles: Role[];
  currentRoles: Role[];
  loading: boolean;
  currentPage: number;
  searchQuery: string;
  totalPages: number;
  itemsPerPage: number;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  fetchRoles: () => Promise<void>;
  createRole: (data: CreateRoleRequest) => Promise<boolean>;
  updateRole: (id: string, data: CreateRoleRequest) => Promise<boolean>;
  deleteRole: (role: Role) => void;
  assignPermissionToRole: (roleId: string, permissionId: string) => Promise<boolean>;
  revokePermissionFromRole: (roleId: string, permissionId: string) => Promise<boolean>;
  getRolePermissions: (roleId: string) => Promise<any[]>;
}

export function useRoles(): UseRolesReturn {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      if (!AuthUtils.isAuthenticated()) {
        toast.error('Vui lòng đăng nhập');
        window.location.href = '/login';
        return;
      }

      const response = await ApiHelper.get<{ data: Role[] }>('api/v1/roles');

      if (response.success && response.data) {
        const rawRoles = Array.isArray(response.data) ? response.data : [];

        const rolesWithCount = await Promise.all(
          rawRoles.map(async (role) => {
            const perms = await getRolePermissions(role.id.toString());
            return {
              ...role,
              permission_count: perms.length,
            } as Role;
          })
        );

        setRoles(rolesWithCount); 
      } else {
        toast.error(response.message || 'Không thể tải vai trò');
      }
    } catch (error: any) {
      console.error('Lỗi tải roles:', error);
      toast.error('Lỗi mạng');
    } finally {
      setLoading(false);
    }
  }, []);

  const createRole = async (data: CreateRoleRequest): Promise<boolean> => {
    try {
      const res = await ApiHelper.post('api/v1/roles', data);
      if (res.success) {
        await fetchRoles();
        return true;
      }
      toast.error(res.message || 'Lỗi tạo vai trò');
      return false;
    } catch (e: any) {
      toast.error(e.message);
      return false;
    }
  };

  const updateRole = async (id: string, data: CreateRoleRequest): Promise<boolean> => {
    try {
      const updateData: any = { name: data.name, slug: data.slug };
      if (data.description?.trim()) updateData.description = data.description;

      const res = await ApiHelper.patch(`api/v1/roles/${id}`, updateData);
      if (res.success) {
        await fetchRoles();
        return true;
      }
      toast.error(res.message || 'Lỗi cập nhật');
      return false;
    } catch (e: any) {
      toast.error(e.message);
      return false;
    }
  };

  const deleteRole = async (role: Role) => {
    if (!role?.id || !confirm(`Xóa vai trò "${role.name}"?`)) return;
    try {
      const res = await ApiHelper.delete(`api/v1/roles/${role.id}`);
      if (res.success) {
        await fetchRoles();
      } else {
        toast.error(res.message || 'Lỗi xóa');
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const assignPermissionToRole = async (roleId: string, permissionId: string): Promise<boolean> => {
    try {
      const existing = await getRolePermissions(roleId);
      const permRes = await ApiHelper.get(`api/v1/permissions/${permissionId}`);
      if (permRes.success && existing.some((p: any) => p.slug === permRes.data.slug)) {
        toast.error('Quyền đã tồn tại (slug trùng)');
        return false;
      }

      const res = await ApiHelper.post(`api/v1/roles/${roleId}/permissions`, {
        permissionId: Number(permissionId),
      });
      if (res.success) {
        await fetchRoles(); 
        return true;
      }
      toast.error(res.message || 'Lỗi gán quyền');
      return false;
    } catch (e: any) {
      toast.error(e.message);
      return false;
    }
  };

  const revokePermissionFromRole = async (roleId: string, permissionId: string): Promise<boolean> => {
    try {
      const res = await ApiHelper.delete(`api/v1/roles/${roleId}/permissions/${permissionId}`);
      if (res.success) {
        await fetchRoles();
        return true;
      }
      toast.error(res.message || 'Lỗi hủy quyền');
      return false;
    } catch (e: any) {
      toast.error(e.message);
      return false;
    }
  };

  const getRolePermissions = async (roleId: string): Promise<any[]> => {
    try {
      const res = await ApiHelper.get(`api/v1/roles/${roleId}/permissions`);
      return res.success && res.data ? res.data : [];
    } catch {
      return [];
    }
  };

  const filteredRoles = roles.filter((role) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      role.name.toLowerCase().includes(q) ||
      role.slug.toLowerCase().includes(q) ||
      (role.description && role.description.toLowerCase().includes(q))
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRoles = filteredRoles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    filteredRoles,
    currentRoles,
    loading,
    currentPage,
    searchQuery,
    totalPages,
    itemsPerPage,
    setSearchQuery,
    setCurrentPage,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    assignPermissionToRole,
    revokePermissionFromRole,
    getRolePermissions,
  };
}