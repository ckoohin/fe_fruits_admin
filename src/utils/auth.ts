import { User } from '@/types/user';
import { Permission } from '@/types/permission';

export class AuthUtils {
  private static readonly TOKEN_KEY = 'authToken';
  private static readonly USER_KEY = 'user';
  private static readonly AUTH_STATUS_KEY = 'isAuthenticated';
  private static readonly SESSION_ID_KEY = 'sessionId';
  private static readonly PERMISSIONS_KEY = 'permissions';

  static setAuth(token: string, user: User | any): void {
    if (typeof window === 'undefined') return;

    const branchId = user.branchId ?? user.branch_id;

    const userToStore = {
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.userType ?? user.user_type,
      roleId: user.roleId ?? user.role_id,
      avatar: user.avatar,
      branchId: branchId !== undefined && branchId !== null ? branchId : null,
      loginTime: new Date().getTime()
    };

    console.log('Saving user with branchId:', branchId, '(0 = Kho tổng)');
    console.log('Full user data:', userToStore);

    const sessionId = this.generateSessionId();

    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(userToStore));
    localStorage.setItem(this.AUTH_STATUS_KEY, 'true');
    
    sessionStorage.setItem(this.SESSION_ID_KEY, sessionId);
    localStorage.setItem(this.SESSION_ID_KEY, sessionId);
  }

  static setPermissions(permissions: Permission[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.PERMISSIONS_KEY, JSON.stringify(permissions));
  }

  static getPermissions(): Permission[] | null {
    if (typeof window === 'undefined') return null;
    
    if (!this.isSessionValid()) {
      this.clearAuth();
      return null;
    }
    
    const permissionsStr = localStorage.getItem(this.PERMISSIONS_KEY);
    if (permissionsStr) {
      try {
        return JSON.parse(permissionsStr) as Permission[];
      } catch (error) {
        console.error('Error parsing permissions data:', error);
        return null;
      }
    }
    return null;
  }

  static clearPermissions(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.PERMISSIONS_KEY);
  }

  static hasPermission(slug: string): boolean {
    const permissions = this.getPermissions();
    if (!permissions) return false;
    return permissions.some(p => p.slug === slug);
  }

  static hasAnyPermission(slugs: string[]): boolean {
    const permissions = this.getPermissions();
    if (!permissions) return false;
    return slugs.some(slug => permissions.some(p => p.slug === slug));
  }

  static hasAllPermissions(slugs: string[]): boolean {
    const permissions = this.getPermissions();
    if (!permissions) return false;
    return slugs.every(slug => permissions.some(p => p.slug === slug));
  }

  static getPermissionSlugs(): string[] {
    const permissions = this.getPermissions();
    if (!permissions) return [];
    return permissions.map(p => p.slug);
  }

  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private static isSessionValid(): boolean {
    if (typeof window === 'undefined') return false;
    
    const sessionStorageId = sessionStorage.getItem(this.SESSION_ID_KEY);
    const localStorageId = localStorage.getItem(this.SESSION_ID_KEY);
    
    if (!sessionStorageId) {
      return false;
    }
    
    return sessionStorageId === localStorageId;
  }

  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    if (!this.isSessionValid()) {
      this.clearAuth();
      return null;
    }
    
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static getUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    if (!this.isSessionValid()) {
      this.clearAuth();
      return null;
    }
    
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr) as User;
        
        console.log('👤 Getting user - branchId:', parsedUser.branchId, '(0 = Kho tổng)');
        
        return parsedUser;
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.clearAuth();
        return null;
      }
    }
    return null;
  }

  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    if (!this.isSessionValid()) {
      this.clearAuth();
      return false;
    }
    
    const token = this.getToken();
    const user = this.getUser();
    const authStatus = localStorage.getItem(this.AUTH_STATUS_KEY);
    
    return !!(token && user && authStatus === 'true');
  }

  static clearAuth(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.AUTH_STATUS_KEY);
    localStorage.removeItem(this.SESSION_ID_KEY);
    localStorage.removeItem(this.PERMISSIONS_KEY);
    sessionStorage.removeItem(this.SESSION_ID_KEY);
  }

  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  static hasRole(requiredRoleId: string): boolean {
    const user = this.getUser();
    return user ? user.roleId === requiredRoleId : false;
  }

  static hasUserType(requiredUserType: number): boolean {
    const user = this.getUser();
    return user ? user.userType === requiredUserType : false;
  }

  static isAdmin(): boolean {
    return this.hasUserType(2);
  }

  static getBranchId(): number | null {
    const user = this.getUser();
    if (!user) {
      console.warn('No user found');
      return null;
    }
    if (user.branchId === undefined || user.branchId === null) {
      console.warn('No branchId found for user');
      return null;
    }
    
    console.log('branchId:', user.branchId, user.branchId === 0 ? '(Kho tổng)' : '');
    return user.branchId;
  }

  static isMainWarehouse(): boolean {
    const branchId = this.getBranchId();
    return branchId === 0;
  }
}