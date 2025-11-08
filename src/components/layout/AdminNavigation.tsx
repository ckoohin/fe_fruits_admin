'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { getMenuItems } from '@/lib/menuItem';
import {
  LayoutDashboard,
  Package,
  Users,
  Warehouse,
  BarChart3,
  Settings,
} from 'lucide-react';

const iconMap = {
  dashboard: LayoutDashboard,
  products: Package,
  users: Users,
  warehouse: Warehouse,
  reports: BarChart3,
  settings: Settings,
};

interface AdminNavigationProps {
  className?: string;
}

export default function AdminNavigation({ className }: AdminNavigationProps) {
  const pathname = usePathname();
  const { hasPermission } = useAdminAuth();

  const menuItems = getMenuItems();

  const checkAccess = (permissions?: string[], requireAll?: boolean) => {
    if (!permissions || permissions.length === 0) return true;
    if (requireAll) return permissions.every((perm) => hasPermission(perm));
    return permissions.some((perm) => hasPermission(perm));
  };

  return (
    <nav className={cn('flex flex-col space-y-1', className)}>
      {menuItems.map((item) => {
        const hasAccess = checkAccess(item.requiredPermissions, item.requireAll);
        if (!hasAccess && !item.alwaysShow) return null;

        const IconComponent =
          iconMap[item.id as keyof typeof iconMap] || LayoutDashboard;

        const isActive =
          pathname === item.href ||
          (item.href && pathname.startsWith(item.href + '/'));

        return (
          <div key={item.id} className="flex flex-col">
            {/* Mục chính */}
            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <IconComponent className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            ) : (
              <div className="flex items-center px-3 py-2 text-sm font-semibold text-gray-800">
                <IconComponent className="mr-2 h-4 w-4" />
                {item.label}
              </div>
            )}

            {/* Submenu */}
            {item.submenu && item.submenu.length > 0 && (
              <div className="ml-6 flex flex-col space-y-1 mt-1">
                {item.submenu.map((sub) => {
                  const subHasAccess = checkAccess(
                    sub.requiredPermissions,
                    sub.requireAll
                  );
                  if (!subHasAccess) return null;

                  const isSubActive =
                    pathname === sub.href ||
                    pathname.startsWith(sub.href + '/');

                  return (
                    <Link
                      key={sub.id}
                      href={sub.href}
                      className={cn(
                        'text-sm px-3 py-1.5 rounded-md transition-colors',
                        isSubActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      )}
                    >
                      {sub.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}