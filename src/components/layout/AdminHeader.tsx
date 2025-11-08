'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, Search, Menu, User, LogOut, Settings, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext'; 
import { cn } from '@/lib/utils';
import { getMenuItems } from '@/lib/menuItem';

interface AdminHeaderProps {
  onMenuToggle?: () => void;
  title?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}

export default function AdminHeader({ onMenuToggle, title, breadcrumbs }: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth(); 

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const parentMenuLabel = useMemo(() => {
    const menuItems = getMenuItems();
    for (const parent of menuItems) {
      if (parent.href && (pathname === parent.href || pathname.startsWith(parent.href + '/'))) {
        return parent.label;
      }

      if (parent.submenu) {
        for (const child of parent.submenu) {
          if (pathname === child.href || pathname.startsWith(child.href + '/')) {
            return parent.label;
          }
        }
      }
    }
    return 'Dashboard';
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      try {
        await logout();
        router.replace('/login');
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
      setShowMobileSearch(false);
      setSearchQuery('');
    }
  };

  const notifications = [
    { id: 1, title: 'Đơn hàng mới', message: 'Có 3 đơn hàng mới cần xử lý', time: '5 phút trước', unread: true },
    { id: 2, title: 'Cảnh báo tồn kho', message: 'Sản phẩm "Táo Fuji" sắp hết hàng', time: '1 giờ trước', unread: true },
    { id: 3, title: 'Thanh toán thành công', message: 'Đơn hàng #12345 đã được thanh toán', time: '2 giờ trước', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden flex-shrink-0"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          )}

          <div>
            <h1 className="text-2xl font-bold text-gray-900">{parentMenuLabel}</h1>
            <p className="text-gray-600">
              Chào mừng trở lại, {user?.name || 'Admin'}!
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
          <form onSubmit={handleSearch} className="hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-48 lg:w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                         transition-all"
              />
            </div>
          </form>

          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>

          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Thông báo</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      {unreadCount} mới
                    </span>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          'p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors',
                          n.unread && 'bg-blue-50'
                        )}
                      >
                        <p className="text-sm font-medium text-gray-900">{n.title}</p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Không có thông báo mới</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-sm font-semibold text-white">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <span className="hidden lg:block text-sm font-medium">{user?.name}</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                <div className="p-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      router.push('/admin/profile');
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    <User className="mr-3 h-4 w-4" />
                    Hồ sơ cá nhân
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      router.push('/admin/settings');
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    Cài đặt
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleLogout();
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showMobileSearch && (
        <div className="md:hidden border-t border-gray-200 p-4 bg-gray-50">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <button
              type="button"
              onClick={() => setShowMobileSearch(false)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </header>
  );
}