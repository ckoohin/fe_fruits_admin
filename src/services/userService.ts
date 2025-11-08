import { ApiHelper } from '@/utils/api';
import { UserData, CreateUserRequest, UpdateUserRequest } from '@/types/user';
import { PaginatedResponse } from '@/types/api';

export class UserService {
  // Get paginated users
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

  // Get single user
  static async getUser(id: string) {
    return ApiHelper.get<UserData>(`api/v1/admin/users/${id}`);
  }

  // Create user
  static async createUser(userData: CreateUserRequest) {
    return ApiHelper.post<UserData>('api/v1/admin/users', userData);
  }

  // Update user
  static async updateUser(id: string, userData: UpdateUserRequest) {
    return ApiHelper.put<UserData>(`api/v1/admin/users/${id}`, userData);
  }

  // Delete user
  static async deleteUser(id: string) {
    return ApiHelper.delete(`api/v1/admin/users/${id}`);
  }

  // Bulk delete users
  static async bulkDeleteUsers(userIds: string[]) {
    return ApiHelper.post('api/v1/admin/users/bulk-delete', { userIds });
  }

  // Toggle user status
  static async toggleUserStatus(id: string) {
    return ApiHelper.patch(`api/v1/admin/users/${id}/status`);
  }
}