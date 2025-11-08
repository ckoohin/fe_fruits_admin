// User related types
export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  totalRides: number;
  totalFinished: number;
  homeLocation: string;
  workLocation: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'suspended';
}

// Admin user types
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar?: string;
  lastLogin: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

// Permission and role types
export type AdminRole = 'super_admin' | 'admin' | 'moderator' | 'viewer';

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

// Navigation types
export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  hasIndicator?: boolean;
  children?: MenuItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Layout component props
export interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export interface AdminHeaderProps {
  onSidebarToggle: () => void;
  user: AdminUser;
}

export interface AdminNavigationProps {
  activeSection: string;
}

export interface BreadcrumbProps {
  items: (string | BreadcrumbItem)[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter and search types
export interface UserFilters {
  search?: string;
  status?: User['status'];
  dateRange?: {
    start: string;
    end: string;
  };
}

// Dashboard stats types
export interface DashboardStats {
  totalUsers: number;
  activeOrders: number;
  revenue: number;
  products: number;
  growthRate: {
    users: number;
    orders: number;
    revenue: number;
  };
}

// Table column definition
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
}

// Action types for bulk operations
export type BulkAction = 'delete' | 'export' | 'activate' | 'deactivate';

export interface BulkActionConfig {
  key: BulkAction;
  label: string;
  icon?: React.ReactNode;
  confirmMessage?: string;
  dangerous?: boolean;
}