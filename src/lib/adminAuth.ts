import { AuthUser, AuthResponse, LoginCredentials } from '@/types/auth';
import { API_CONFIG } from './constants';

class AdminAuthError extends Error {
  public status?: number;
  public code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'AdminAuthError';
    this.status = status;
    this.code = code;
  }
}

class AdminAuth {
  private static instance: AdminAuth;
  private token: string | null = null;
  private user: AuthUser | null = null;
  private tokenExpiryTimeout: NodeJS.Timeout | null = null;

  private constructor() {
    this.loadFromStorage();
    this.setupTokenRefresh();
  }

  public static getInstance(): AdminAuth {
    if (!AdminAuth.instance) {
      AdminAuth.instance = new AdminAuth();
    }
    return AdminAuth.instance;
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      this.token = localStorage.getItem('admin_token');
      const userStr = localStorage.getItem('admin_user');
      this.user = userStr ? JSON.parse(userStr) : null;
      if (this.token && !this.user) {
        this.clearAuth();
      }
    } catch (error) {
      console.error('Error loading auth data from storage:', error);
      this.clearAuth();
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      if (this.token) {
        localStorage.setItem('admin_token', this.token);
      }
      if (this.user) {
        localStorage.setItem('admin_user', JSON.stringify(this.user));
      }
    } catch (error) {
      console.error('Error saving auth data to storage:', error);
    }
  }

  private clearStorage(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  }

  private setupTokenRefresh(): void {
    if (this.tokenExpiryTimeout) {
      clearTimeout(this.tokenExpiryTimeout);
    }
  }

  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const apiUrl = `${API_CONFIG.BASE_URL}/v1/auth/login`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: credentials.email, password: credentials.password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AdminAuthError(
          errorData.message || 'Email hoặc mật khẩu không chính xác',
          response.status,
          errorData.code
        );
      }

      const data = await response.json();
      let token: string | null = null;
      let user: AuthUser | null = null;

      if (data.success && data.data?.token) {
        token = data.data.token;
        user = {
          ...data.data.user,
          permission_ids: data.data.user.permission_ids || [],
        };
      } else if (data.token) {
        token = data.token;
        user = {
          ...data.user,
          permission_ids: data.user.permission_ids || [],
        };
      } else if (data.data?.token) {
        token = data.data.token;
        user = {
          ...data.data.user,
          permission_ids: data.data.user.permission_ids || [],
        };
      }

      if (!token || !user) {
        throw new AdminAuthError('Không tìm thấy token hoặc user trong phản hồi từ server');
      }

      this.token = token;
      this.user = user;
      this.saveToStorage();
      this.setupTokenRefresh();

      return { success: true, data: { token, user } };
    } catch (error) {
      if (error instanceof AdminAuthError) {
        throw error;
      }
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new AdminAuthError('Không thể kết nối đến server. Vui lòng kiểm tra backend đang chạy.');
      }
      throw new AdminAuthError(error instanceof Error ? error.message : 'Đăng nhập thất bại');
    }
  }

  public async logout(): Promise<void> {
    try {
      if (this.token) {
        await fetch(`${API_CONFIG.BASE_URL}/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`,
          },
        }).catch(err => console.error('Logout API error:', err));
      }
    } finally {
      this.clearAuth();
    }
  }

  public async getCurrentUser(): Promise<AuthUser> {
    if (!this.token) {
      throw new AdminAuthError('Chưa đăng nhập', 401);
    }
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/v1/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearAuth();
          throw new AdminAuthError('Phiên đăng nhập đã hết hạn', 401);
        }
        throw new AdminAuthError('Không thể lấy thông tin người dùng', response.status);
      }

      const data = await response.json();
      if (data.success && data.data) {
        this.user = {
          ...data.data,
          permission_ids: data.data.permission_ids || [], 
        };
        this.saveToStorage();
        return this.user;
      }

      throw new AdminAuthError('Dữ liệu người dùng không hợp lệ');
    } catch (error) {
      if (error instanceof AdminAuthError) {
        throw error;
      }
      throw new AdminAuthError(error instanceof Error ? error.message : 'Lỗi khi lấy thông tin người dùng');
    }
  }

  public async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    if (!this.token) {
      throw new AdminAuthError('Chưa đăng nhập', 401);
    }
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/v1/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AdminAuthError(
          errorData.message || 'Đổi mật khẩu thất bại',
          response.status,
          errorData.code
        );
      }
    } catch (error) {
      if (error instanceof AdminAuthError) {
        throw error;
      }
      throw new AdminAuthError(error instanceof Error ? error.message : 'Đổi mật khẩu thất bại');
    }
  }

  public isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  public getUser(): AuthUser | null {
    return this.user;
  }

  public getToken(): string | null {
    return this.token;
  }

  public clearAuth(): void {
    if (this.tokenExpiryTimeout) {
      clearTimeout(this.tokenExpiryTimeout);
      this.tokenExpiryTimeout = null;
    }
    this.token = null;
    this.user = null;
    this.clearStorage();
  }

  public async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    if (!this.token) {
      throw new AdminAuthError('Chưa đăng nhập', 401);
    }
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
      ...options.headers,
    };
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      this.clearAuth();
      throw new AdminAuthError('Phiên đăng nhập đã hết hạn', 401);
    }
    return response;
  }
}

export const adminAuth = AdminAuth.getInstance();
export { AdminAuthError };
export default adminAuth;