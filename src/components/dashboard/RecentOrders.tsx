'use client';

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface RecentOrdersProps {
  orders?: Order[];
}

export function RecentOrders({ orders = [] }: RecentOrdersProps) {
  // Mock data if no orders provided
  const mockOrders: Order[] = orders.length > 0 ? orders : [
    {
      id: 1,
      order_number: 'ORD-001',
      customer_name: 'Nguyễn Văn A',
      total_amount: 150000,
      status: 'delivered',
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      order_number: 'ORD-002',
      customer_name: 'Trần Thị B',
      total_amount: 250000,
      status: 'processing',
      created_at: '2024-01-15T09:15:00Z'
    },
    {
      id: 3,
      order_number: 'ORD-003',
      customer_name: 'Lê Văn C',
      total_amount: 180000,
      status: 'shipped',
      created_at: '2024-01-14T16:45:00Z'
    },
    {
      id: 4,
      order_number: 'ORD-004',
      customer_name: 'Phạm Thị D',
      total_amount: 320000,
      status: 'pending',
      created_at: '2024-01-14T14:20:00Z'
    },
    {
      id: 5,
      order_number: 'ORD-005',
      customer_name: 'Hoàng Văn E',
      total_amount: 95000,
      status: 'cancelled',
      created_at: '2024-01-14T11:10:00Z'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'green';
      case 'shipped':
        return 'blue';
      case 'processing':
        return 'yellow';
      case 'pending':
        return 'gray';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Đã giao';
      case 'shipped':
        return 'Đang giao';
      case 'processing':
        return 'Đang xử lý';
      case 'pending':
        return 'Chờ xử lý';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-4">
      {mockOrders.map((order) => (
        <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <div>
                <p className="font-medium text-gray-900">{order.order_number}</p>
                <p className="text-sm text-gray-500">{order.customer_name}</p>
              </div>
              <Badge color={getStatusColor(order.status) as any}>
                {getStatusLabel(order.status)}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-900">
              {order.total_amount.toLocaleString('vi-VN')} ₫
            </p>
            <p className="text-sm text-gray-500">
              {new Date(order.created_at).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
      ))}
      
      <div className="text-center pt-4">
        <Link href="/admin/orders">
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Xem tất cả đơn hàng →
          </button>
        </Link>
      </div>
    </div>
  );
}
