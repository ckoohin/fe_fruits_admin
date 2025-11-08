'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUtils } from '@/utils/auth';
import { ApiHelper } from '@/utils/api';
import { User, UserData } from '@/types/user';
import { LoginRequest, LoginResponse } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; message: string; errors?: any }>;
  logout: () => void;
  hasRole: (roleId: string) => boolean;
  hasUserType: (userType: number) => boolean;
  isAdmin: () => boolean;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = useCallback(() => {
    console.log('AuthProvider checkAuth called');
    
    try {
      const token = AuthUtils.getToken();
      const userData = AuthUtils.getUser();
      const authStatus = AuthUtils.isAuthenticated();

      console.log('Auth check results:', {
        hasToken: !!token,
        hasUser: !!userData,
        authStatus,
        userData
      });

      if (token && userData && authStatus) {
        setUser(userData);
        setIsAuthenticated(true);
        console.log('User authenticated:', userData.email, 'branchId:', userData.branchId);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        console.log('❌User not authenticated');
      }
    } catch (error) {
      console.error('❌Auth check error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('🔍AuthProvider useEffect - checking auth...');
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (credentials: LoginRequest) => {
    console.log('🔐Starting login process...');
    setLoading(true);

    try {
      const response = await ApiHelper.fetch<any>('api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      console.log('🔐Login API response:', response);
      console.log('📦Response.data:', response.data);

      if (response.success && response.data) {
        // Handle different response structures
        let apiUserData = null;
        let token = null;

        if (response.data.user && response.data.token) {
          apiUserData = response.data.user;
          token = response.data.token;
        } else if (response.data.id && response.data.email) {
          apiUserData = response.data;
          token = response.data.token;
        }

        console.log('👤API User Data:', apiUserData);
        console.log('🏢branch_id from API:', apiUserData?.branch_id);

        if (!apiUserData || !token) {
          setLoading(false);
          return {
            success: false,
            message: 'Dữ liệu đăng nhập không hợp lệ',
          };
        }

        // ✅ FIX: Map đầy đủ fields including branchId
        const userData: User = {
          id: String(apiUserData.id),
          name: apiUserData.name || 'Khách',
          email: apiUserData.email,
          userType: Number(apiUserData.user_type),
          roleId: String(apiUserData.role_id),
          avatar: apiUserData.avatar || undefined,
          lastLogin: apiUserData.last_login,
          created_at: apiUserData.created_at,
          updated_at: apiUserData.updated_at,
          branchId: apiUserData.branch_id ? Number(apiUserData.branch_id) : undefined, // ✅ ADD THIS
        };

        console.log('✅ Mapped User Data:', userData);
        console.log('✅ branchId in User object:', userData.branchId);

        // Save to localStorage
        AuthUtils.setAuth(token, userData);

        // Verify localStorage
        const savedUserStr = localStorage.getItem('user');
        console.log('💾 Saved to localStorage:', savedUserStr);
        if (savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          console.log('💾 branchId in localStorage:', savedUser.branchId);
        }
        
        // Update state
        setUser(userData);
        setIsAuthenticated(true);
        setLoading(false);

        console.log('✅ Login successful:', userData.email, 'branchId:', userData.branchId);
        return { 
          success: true, 
          message: response.message || 'Đăng nhập thành công' 
        };
      } else {
        setLoading(false);
        return {
          success: false,
          message: response.message || 'Đăng nhập thất bại',
          errors: response.errors || { general: response.message },
        };
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setLoading(false);
      return {
        success: false,
        message: error.message || 'Lỗi kết nối',
        errors: { general: error.message || 'Unknown error' },
      };
    }
  }, []);

  const logout = useCallback(() => {
    console.log('🚪 Logging out...');
    
    AuthUtils.clearAuth();
    
    setUser(null);
    setIsAuthenticated(false);
    
    ApiHelper.authFetch('api/v1/auth/logout', { method: 'POST' })
      .catch((error) => console.warn('Logout API failed:', error));

    console.log('✅ Logout completed');
  }, []);

  const hasRole = useCallback((roleId: string) => {
    return user?.roleId === roleId;
  }, [user]);

  const hasUserType = useCallback((userType: number) => {
    return user?.userType === userType;
  }, [user]);

  const isAdmin = useCallback(() => {
    return user?.userType === 2;
  }, [user]);

  console.log('🔍 AuthProvider render state:', { 
    user: user?.email, 
    branchId: user?.branchId, 
    isAuthenticated, 
    loading 
  });

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        loading, 
        isAuthenticated, 
        login, 
        logout, 
        hasRole, 
        hasUserType, 
        isAdmin,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};