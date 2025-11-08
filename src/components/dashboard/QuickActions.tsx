'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Package, 
  Users, 
  ShoppingCart, 
  BarChart,
  Upload,
  Download 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function QuickActions() {
  const actions = [
    {
      title: 'Thêm sản phẩm',
      description: 'Tạo sản phẩm mới',
      href: '/admin/products/create',
      icon: <Plus className="h-5 w-5" />,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Quản lý kho',
      description: 'Xem tồn kho',
      href: '/admin/inventory',
      icon: <Package className="h-5 w-5" />,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Khách hàng',
      description: 'Xem danh sách khách hàng',
      href: '/admin/customers',
      icon: <Users className="h-5 w-5" />,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Đơn hàng',
      description: 'Quản lý đơn hàng',
      href: '/admin/orders',
      icon: <ShoppingCart className="h-5 w-5" />,
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      title: 'Báo cáo',
      description: 'Xem báo cáo doanh thu',
      href: '/admin/reports',
      icon: <BarChart className="h-5 w-5" />,
      color: 'bg-red-500 hover:bg-red-600'
    },
    {
      title: 'Nhập hàng',
      description: 'Nhập hàng vào kho',
      href: '/admin/inventory/import',
      icon: <Upload className="h-5 w-5" />,
      color: 'bg-indigo-500 hover:bg-indigo-600'
    },
    {
      title: 'Xuất báo cáo',
      description: 'Tải xuống báo cáo',
      href: '/admin/reports/export',
      icon: <Download className="h-5 w-5" />,
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Thao tác nhanh
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {actions.map((action, index) => (
          <Link key={index} href={action.href}>
            <div
              className={cn(
                `${action.color} text-white rounded-lg cursor-pointer transition-colors duration-200 text-center min-h-[100px] flex items-center justify-center`
              )}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center justify-center">
                  {action.icon}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium line-clamp-1">{action.title}</p>
                  <p className="text-xs opacity-90 line-clamp-2">{action.description}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}