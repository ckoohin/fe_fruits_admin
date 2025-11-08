'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';
import { getMenuItems, filterMenuByPermissions } from '@/lib/menuItem';
import {
  ChevronDown,
  ChevronRight,
  Package,
  Shield,
  X,
} from 'lucide-react';

interface AdminSidebarProps {
  isCollapsed?: boolean;
  isMobileOpen?: boolean;
  onToggle?: () => void;
  onMobileClose?: () => void;
}

export default function AdminSidebar({
  isCollapsed = false,
  isMobileOpen = false,
  onToggle,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { permissions, loading } = usePermissions();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const userPermissionSlugs = useMemo(
    () => permissions?.map((p) => p.slug) || [],
    [permissions]
  );

  const menuItems = useMemo(() => {
    const allItems = getMenuItems();
    return filterMenuByPermissions(allItems, userPermissionSlugs);
  }, [userPermissionSlugs]);

  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.submenu?.some((sub) => pathname.startsWith(sub.href))) {
        setExpandedMenu(item.id);
      }
    });
  }, [pathname, menuItems]);

  const toggleExpand = (id: string) => {
    setExpandedMenu((prev) => (prev === id ? null : id));
  };

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center min-w-0">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="ml-3 text-lg font-bold text-gray-900 truncate">
              Fruits Admin
            </span>
          </div>
        )}

        {isMobileOpen && onMobileClose && (
          <button
            onClick={onMobileClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
        {!loading && menuItems.length > 0 ? (
          menuItems.map((item) => {
            const isExpanded = expandedMenu === item.id;
            const isActive =
              pathname === item.href ||
              item.submenu?.some((sub) => pathname.startsWith(sub.href));
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const Icon = item.icon || Package;

            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() =>
                    hasSubmenu ? toggleExpand(item.id) : (window.location.href = item.href)
                  }
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all',
                    isActive
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  )}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {hasSubmenu && (
                    <span
                      className={cn(
                        'ml-2 transition-transform',
                        isExpanded ? 'rotate-180 text-blue-600' : 'text-gray-400'
                      )}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </button>

                {hasSubmenu && isExpanded && (
                  <div className="ml-4 pl-4 border-l-2 border-gray-200 space-y-1">
                    {item.submenu.map((sub) => {
                      const isSubActive =
                        pathname === sub.href ||
                        pathname.startsWith(sub.href + '/');
                      return (
                        <Link
                          key={sub.id}
                          href={sub.href}
                          className={cn(
                            'flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all',
                            isSubActive
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
          })
        ) : (
          !loading && (
            <div className="p-4 text-center">
              <Shield className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Không có quyền truy cập
              </p>
            </div>
          )
        )}
      </nav>
    </>
  );

  if (!isMobileOpen) {
    return (
      <aside
        className={cn(
          'hidden lg:flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300 shadow-sm',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity"
        onClick={onMobileClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-white shadow-xl transition-transform duration-300 lg:hidden flex flex-col',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          'w-72'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}