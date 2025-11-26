'use client';
import { useState, useEffect, useCallback } from 'react';
import { AuthUtils } from '@/utils/auth';
import { ApiHelper } from '@/utils/api';
import { User } from '@/types/user';
import { LoginRequest } from '@/types/auth';
import { PermissionService } from '@/services/permissionService';
import { adminAuth, AdminAuthError } from '@/lib/adminAuth';
import { ChangePasswordData } from '@/types/auth';

export function useAdminAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initAdminAuth = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = AuthUtils.getUser();
      const authStatus = AuthUtils.isAuthenticated();

      if (currentUser && authStatus) {
        setUser(currentUser);
        setIsAuthenticated(true);

        const cachedPermissions = AuthUtils.getPermissions();
        if (!cachedPermissions && currentUser.roleId) {
          const permResponse = await PermissionService.getPermissionsByRole(currentUser.roleId);
          if (permResponse.success && permResponse.data) {
            AuthUtils.setPermissions(permResponse.data);
          }
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initAdminAuth();
  }, [initAdminAuth]);

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      const response = await ApiHelper.fetch<any>('api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.success) {
        const apiUserData = response.data.user || response.data;
        const token = response.data.token;

        if (!apiUserData || !token) {
          return { success: false, message: 'Thiếu user hoặc token' };
        }

        const userData: User = {
          id: String(apiUserData.id),
          name: apiUserData.name || 'Khách',
          email: apiUserData.email,
          userType: Number(apiUserData.user_type || 0),
          roleId: apiUserData.role_id ? String(apiUserData.role_id) : '',
          avatar: apiUserData.avatar || null,
          branchId: Number(apiUserData.branch_id || 0),
          isActive: apiUserData.is_active ?? true, 
          status: apiUserData.status || 'active',  
          user_type: apiUserData.user_typets || 'default',
        };

        AuthUtils.setAuth(token, userData);
        setUser(userData);
        setIsAuthenticated(true);

        await initAdminAuth();

        return { success: true, message: 'Đăng nhập thành công' };
      }

      return { success: false, message: response.message || 'Đăng nhập thất bại' };
    } catch (err: any) {
      console.error('Login error:', err);
      return { success: false, message: err.message || 'Đăng nhập thất bại' };
    }
  }, [initAdminAuth]);

  const logout = useCallback(() => {
    ApiHelper.authFetch('api/v1/auth/logout', { method: 'POST' }).catch(() => {});
    AuthUtils.clearAuth();
    setUser(null);
    setIsAuthenticated(false);
    initAdminAuth();
  }, [initAdminAuth]);

  const hasPermission = useCallback((slug: string) => {
    return AuthUtils.hasPermission(slug);
  }, []);

  const hasUserType = useCallback((type: string | number) => {
    if (!user) return false;
    const userTypeNum = Number(user.userType);
    const requiredTypeNum = Number(type);
    return userTypeNum === requiredTypeNum;
  }, [user]);

  return {
    user,
    isLoading: loading,
    isAuthenticated,
    error,
    login,
    logout,
    hasPermission,
    hasUserType
  };
}