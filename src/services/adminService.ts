import { ApiHelper } from '@/utils/api';

// Interfaces cho API
export interface UserData {
  id: string;
  name: string;
  email: string;
  user_type: number;
  role_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  user_type: number;
  role_id: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  user_type?: number;
  role_id?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalRoles: number;
  activeUsers: number;
  newUsersToday: number;
}

export class AdminService {
  // Dashboard Statistics
  static async getDashboardStats() {
    return ApiHelper.get<DashboardStats>('api/v1/admin/dashboard/stats');
  }

  // User Management
  static async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    user_type?: number;
    role_id?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `api/v1/admin/users${queryParams.toString() ? `?${queryParams}` : ''}`;
    return ApiHelper.get<PaginatedResponse<UserData>>(endpoint);
  }

  static async getUser(id: string) {
    return ApiHelper.get<UserData>(`api/v1/admin/users/${id}`);
  }

  static async createUser(userData: CreateUserRequest) {
    return ApiHelper.post<UserData>('api/v1/admin/users', userData);
  }

  static async updateUser(id: string, userData: UpdateUserRequest) {
    return ApiHelper.put<UserData>(`api/v1/admin/users/${id}`, userData);
  }

  static async deleteUser(id: string) {
    return ApiHelper.delete(`api/v1/admin/users/${id}`);
  }

  // Bulk operations
  static async bulkDeleteUsers(userIds: string[]) {
    return ApiHelper.post('api/v1/admin/users/bulk-delete', { userIds });
  }

  // Role Management
  static async getRoles() {
    return ApiHelper.get('api/v1/admin/roles');
  }

  static async createRole(roleData: { name: string; description: string; permissions: string[] }) {
    return ApiHelper.post('api/v1/admin/roles', roleData);
  }

  static async updateRole(id: string, roleData: { name?: string; description?: string; permissions?: string[] }) {
    return ApiHelper.put(`api/v1/admin/roles/${id}`, roleData);
  }

  static async deleteRole(id: string) {
    return ApiHelper.delete(`api/v1/admin/roles/${id}`);
  }
}