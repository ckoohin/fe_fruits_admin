'use client';
import { useState, useEffect } from 'react';
import { Role, CreateRoleRequest } from '@/types/role';
import { AuthUtils } from '@/utils/auth';
import { ApiHelper } from '@/utils/api';

// Định nghĩa kiểu trả về của useRoles
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
  revokePermissionFromRole: (roleId: string, permissionId: string) => Promise<boolean>; // Thêm vào kiểu trả về
  getRolePermissions: (roleId: string) => Promise<any[]>;
}

export function useRoles(): UseRolesReturn {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;

  const fetchRoles = async () => {
    setLoading(true);
    try {
      if (!AuthUtils.isAuthenticated()) {
        alert('Vui lòng đăng nhập để xem trang này');
        window.location.href = '/login';
        return;
      }

      const response = await ApiHelper.get<Role[]>('api/v1/roles');
      
      if (response.success && response.data) {
        const rolesWithCount = await Promise.all(
          response.data.map(async (role) => {
            const perms = await getRolePermissions(role.id.toString());
            return { ...role, permission_count: perms.length };
          })
        );
        setRoles(rolesWithCount);
      }
      
      if (response.success && response.data) {
        const rolesData = Array.isArray(response.data) ? response.data : [];
        setRoles(rolesData);
      } else {
        console.error('Error fetching roles:', response.message);
        alert(response.message || 'Không thể tải dữ liệu vai trò');
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      alert('Lỗi khi tải vai trò');
    } finally {
      setLoading(false);
    }
  };

  const createRole = async (data: CreateRoleRequest) => {
    try {
      console.log('Creating role:', data);
      const response = await ApiHelper.post('api/v1/roles', data);
      
      if (response.success) {
        alert('Thêm vai trò thành công!');
        fetchRoles();
        return true;
      }
      
      alert('Lỗi: ' + (response.message || 'Không thể lưu vai trò'));
      return false;
    } catch (error: any) {
      console.error('Create error:', error);
      alert('Lỗi: ' + error.message);
      return false;
    }
  };

  const updateRole = async (id: string, data: CreateRoleRequest) => {
    try {
      const updateData: any = {
        name: data.name,
        slug: data.slug
      };
      
      if (data.description && data.description.trim() !== '') {
        updateData.description = data.description;
      }
      
      console.log('Updating role ID:', id);
      console.log('Update data:', JSON.stringify(updateData, null, 2));
      
      const response = await ApiHelper.patch(`api/v1/roles/${id}`, updateData);
      
      if (response.success) {
        alert('Cập nhật thành công!');
        fetchRoles();
        return true;
      }
      
      alert('Lỗi: ' + (response.message || 'Không thể cập nhật vai trò'));
      return false;
    } catch (error: any) {
      console.error('Update error:', error);
      alert('Lỗi: ' + error.message);
      return false;
    }
  };

  const deleteRole = async (role: Role) => {
    if (!role || !role.id) {
      alert('Dữ liệu vai trò không hợp lệ');
      return;
    }
    
    if (!confirm(`Bạn có chắc muốn xóa vai trò "${role.name}"?`)) return;

    try {
      const response = await ApiHelper.delete(`api/v1/roles/${role.id}`);
      if (response.success) {
        alert('Xóa vai trò thành công!');
        fetchRoles();
      } else {
        alert('Lỗi: ' + (response.message || 'Không thể xóa vai trò'));
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      alert('Lỗi: ' + error.message);
    }
  };

  const assignPermissionToRole = async (roleId: string, permissionId: string) => {
    try {
      console.log('Assigning permission:', { roleId, permissionId });
      
      const existingPermissions = await getRolePermissions(roleId);
      const newPermission = await ApiHelper.get(`api/v1/permissions/${permissionId}`);
      
      if (newPermission.success && newPermission.data && existingPermissions.some((perm: any) => perm.slug === newPermission.data.slug)) {
        alert('Lỗi: Quyền này đã được gán, slug không được trùng!');
        return false;
      }

      const response = await ApiHelper.post(
        `api/v1/roles/${roleId}/permissions`,
        { permissionId: Number(permissionId) }
      );
      
      if (response.success) {
        alert('Gán quyền thành công!');
        return true;
      }
      
      alert('Lỗi: ' + (response.message || 'Không thể gán quyền'));
      return false;
    } catch (error: any) {
      console.error('Assign permission error:', error);
      alert('Lỗi: ' + error.message);
      return false;
    }
  };

  const revokePermissionFromRole = async (roleId: string, permissionId: string) => {
    try {
      console.log('Revoking permission:', { roleId, permissionId });
      
      const response = await ApiHelper.delete(
        `api/v1/roles/${roleId}/permissions/${permissionId}`
      );
      
      if (response.success) {
        alert('Hủy quyền thành công!');
        return true;
      }
      
      alert('Lỗi: ' + (response.message || 'Không thể hủy quyền'));
      return false;
    } catch (error: any) {
      console.error('Revoke permission error:', error);
      alert('Lỗi: ' + error.message);
      return false;
    }
  };

  const getRolePermissions = async (roleId: string) => {
    try {
      const response = await ApiHelper.get(`api/v1/roles/${roleId}/permissions`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Get role permissions error:', error);
      return [];
    }
  };

  const filteredRoles = roles.filter(role => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    return (
      role.name.toLowerCase().includes(query) ||
      role.slug.toLowerCase().includes(query) ||
      (role.description && role.description.toLowerCase().includes(query))
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
  }, []);

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
    revokePermissionFromRole, // Đã thêm vào return
    getRolePermissions
  };
}