import { ApiHelper } from '@/utils/api';
import { Permission } from '@/types/permission';
import { ApiResponse } from '@/types/api';

export class PermissionService {
  static async getPermissionsByRole(roleId: string): Promise<ApiResponse<Permission[]>> {
    return ApiHelper.get<Permission[]>(`api/v1/roles/${roleId}/permissions`);
  }

  static async getAllPermissions(): Promise<ApiResponse<Permission[]>> {
    return ApiHelper.get<Permission[]>('api/v1/permissions');
  }

  static hasPermission(userPermissions: Permission[], requiredSlug: string): boolean {
    return userPermissions.some(permission => permission.slug === requiredSlug);
  }

  static hasAnyPermission(userPermissions: Permission[], requiredSlugs: string[]): boolean {
    return requiredSlugs.some(slug => this.hasPermission(userPermissions, slug));
  }

  static hasAllPermissions(userPermissions: Permission[], requiredSlugs: string[]): boolean {
    return requiredSlugs.every(slug => this.hasPermission(userPermissions, slug));
  }
}