import { ApiHelper } from '@/utils/api';
import { Role, CreateRoleRequest, UpdateRoleRequest } from '@/types/role';

export class RoleService {
  // Get all roles
  static async getRoles() {
    return ApiHelper.get<Role[]>('api/v1/admin/roles');
  }

  // Get single role
  static async getRole(id: string) {
    return ApiHelper.get<Role>(`api/v1/admin/roles/${id}`);
  }

  // Create role
  static async createRole(roleData: CreateRoleRequest) {
    return ApiHelper.post<Role>('api/v1/admin/roles', roleData);
  }

  // Update role
  static async updateRole(id: string, roleData: UpdateRoleRequest) {
    return ApiHelper.put<Role>(`api/v1/admin/roles/${id}`, roleData);
  }

  // Delete role
  static async deleteRole(id: string) {
    return ApiHelper.delete(`api/v1/admin/roles/${id}`);
  }
}