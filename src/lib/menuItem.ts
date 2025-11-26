import SystemLayout from '@/app/admin/system/layout';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Gift,
  Settings,
  Warehouse,
  FileText,
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  requiredPermissions?: string[];
  requireAll?: boolean;
  alwaysShow?: boolean;
  submenu?: SubMenuItem[];
}

export interface SubMenuItem {
  id: string;
  label: string;
  href: string;
  requiredPermissions?: string[];
  requireAll?: boolean;
}

export const getMenuItems = (): MenuItem[] => [
  {
    id: 'dashboard',
    label: 'Tổng quan',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    alwaysShow: true,
  },
  {
    id: 'system-management',
    label: 'Quản lý tài khoản',
    href: '/admin/system',
    icon: Users,
    requiredPermissions: ['manage-users', 'manage-roles', 'manage-permissions'],
    requireAll: false,
    submenu: [
      {
        id: 'system-users',
        label: 'Danh sách người dùng',
        href: '/admin/system/users',
        requiredPermissions: ['view-users'],
        requireAll: false,
      },
      {
        id: 'system-staff',
        label: 'Quản lý nhân viên',
        href: '/admin/system/staff',
        requiredPermissions: ['manage-users','view-users','manage-roles','manage-permissions'],
        requireAll: false,
      },
      {
        id: 'system-roles',
        label: 'Vai trò & Phân quyền',
        href: '/admin/system/roles',
        requiredPermissions: ['manage-roles','manage-permissions'],
        requireAll: false,
      },
      {
        id: 'logs',
        label: 'Quản lý logs',
        href: '/admin/system/logs',
        requiredPermissions: ['manage-users'],
      },
    ],
  },
  {
    id: 'products',
    label: 'Quản lý sản phẩm',
    href: '/admin/products',
    icon: Package,
    requiredPermissions: ['manage-products', 'view-products'],
    requireAll: false,
  },
  {
    id: 'inventory',
    label: 'Quản lý kho',
    href: '/admin/inventory',
    icon: Warehouse,
    requiredPermissions: [],
    requireAll: false,
    submenu: [
      {
        id: 'inventory-show',
        label: 'Tổng quan tồn kho',
        href: '/admin/inventory',
        requiredPermissions: ['view-inventory'],
        requireAll: false,
      },
      {
        id: 'inventory-check',
        label: 'Kiểm kho',
        href: '/admin/inventory/check',
        requiredPermissions: ['manage-inventory'],
        requireAll: false,
      },
      {
        id: 'inventory-import',
        label: 'Quản lý nhập hàng',
        href: '/admin/inventory/import',
        requiredPermissions: [
          // 'view-inventory',
          'request-import',
          'approve-import',
          'manage-payment',
          'receive-import'
        ],
        requireAll: false,
      },
      {
        id: 'inventory-export',
        label: 'Quản lý xuất hàng',
        href: '/admin/inventory/export',
        requiredPermissions: [
          'view-inventory',
          'manage-inventory',
          'request-transfer',
          'review-branch-transfer',
          'review-warehouse-transfer',
          'ship-transfer',
          'receive-transfer',
          'cancel-transfer',
          'create-disposal'
        ],
        requireAll: false,
      },
    ],
  },
  {
    id: 'orders',
    label: 'Quản lý đơn hàng',
    href: '/admin/orders',
    icon: ShoppingCart,
    requiredPermissions: ['manage-orders'],
    requireAll: false,
  },
  {
    id: 'customers',
    label: 'Quản lý khách hàng',
    href: '/admin/customers',
    icon: Users,
    requiredPermissions: ['manage-customers'],
    requireAll: false,
  },
  {
    id: 'content',
    label: 'Quản lý nội dung',
    href: '/admin/post_categories',
    icon: FileText,
    requiredPermissions: ['manage-blog'],
    requireAll: false,
    submenu: [
      {
        id: 'post-categories',
        label: 'Quản lý danh mục bài viết',
        href: '/admin/post_categories',
        requiredPermissions: ['manage-blog','manage-categories'],
      },
      {
        id: 'tags',
        label: 'Quản lý thẻ',
        href: '/admin/tags',
        requiredPermissions: ['manage-blog'],
      },
      {
        id: 'posts',
        label: 'Quản lý bài viết',
        href: '/admin/posts',
        requiredPermissions: ['manage-blog'],
      },
      {
        id: 'banners',
        label: 'Quản lý banner',
        href: '/admin/banners',
        requiredPermissions: ['manage-blog','manage-banner'],
      },
    ],
  },
  {
    id: 'promotions',
    label: 'Quản lý khuyến mãi',
    href: '/admin/coupons',
    icon: Gift,
    requiredPermissions: ['manage-coupons'],
  },
  {
    id: 'settings',
    label: 'Cài đặt hệ thống',
    href: '/admin/branches',
    icon: Settings,
    requiredPermissions: ['manage-branches', 'manage-suppliers', 'manage-categories'],
    requireAll: false,
    submenu: [
      {
        id: 'branches',
        label: 'Quản lý chi nhánh',
        href: '/admin/branches',
        requiredPermissions: ['manage-branches'],
      },
      {
        id: 'suppliers',
        label: 'Quản lý nhà cung cấp',
        href: '/admin/suppliers',
        requiredPermissions: ['manage-suppliers'],
      },
      {
        id: 'categories',
        label: 'Quản lý danh mục sản phẩm',
        href: '/admin/categories',
        requiredPermissions: ['manage-categories'],
      },
    ],
  },
  {
    id: 'reports',
    label: 'Báo cáo & Thống kê',
    href: '/admin/reports',
    icon: BarChart3,
    requiredPermissions: ['view-reports', 'view-dashboard'],
    requireAll: false,
  },
];

export const filterMenuByPermissions = (
  menuItems: MenuItem[],
  userPermissions: string[]
): MenuItem[] => {
  return menuItems
    .map(item => {
      if (item.submenu) {
        const filteredSubmenu = item.submenu.filter(subItem => {
          if (!subItem.requiredPermissions || subItem.requiredPermissions.length === 0) {
            return true;
          }

          if (subItem.requireAll) {
            return subItem.requiredPermissions.every(perm => 
              userPermissions.includes(perm)
            );
          }

          return subItem.requiredPermissions.some(perm => 
            userPermissions.includes(perm)
          );
        });

        if (filteredSubmenu.length === 0 && !item.alwaysShow) {
          return null;
        }

        return { ...item, submenu: filteredSubmenu };
      }

      if (item.alwaysShow) {
        return item;
      }

      if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
        return item;
      }

      if (item.requireAll) {
        return item.requiredPermissions.every(perm => 
          userPermissions.includes(perm)
        ) ? item : null;
      }

      return item.requiredPermissions.some(perm => 
        userPermissions.includes(perm)
      ) ? item : null;
    })
    .filter((item): item is MenuItem => item !== null);
};