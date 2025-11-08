import React from 'react';
import { Users, ShoppingBag, TrendingUp, Calendar } from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  order_count: number;
  total_spent: number;
  last_order_date: string | null;
}

interface CustomerStatsProps {
  customers: Customer[];
}

export default function CustomerStats({ customers }: CustomerStatsProps) {
  const totalCustomers = customers.length;
  const totalOrders = customers.reduce((sum, c) => sum + c.order_count, 0);
  const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0);
  const activeCustomers = customers.filter(c => c.order_count > 0).length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const customersWithRecentOrders = customers.filter(c => {
    if (!c.last_order_date) return false;
    const lastOrderDate = new Date(c.last_order_date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return lastOrderDate >= thirtyDaysAgo;
  }).length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Tổng khách hàng</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalCustomers}</p>
            <p className="text-xs text-green-600 mt-1">
              {activeCustomers} khách hàng đã mua hàng
            </p>
          </div>
          <div className="bg-blue-100 rounded-full p-3">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Tổng đơn hàng</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalOrders}</p>
            <p className="text-xs text-gray-500 mt-1">
              TB: {totalCustomers > 0 ? (totalOrders / totalCustomers).toFixed(1) : 0} đơn/KH
            </p>
          </div>
          <div className="bg-green-100 rounded-full p-3">
            <ShoppingBag className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              TB: {formatCurrency(avgOrderValue)}/đơn
            </p>
          </div>
          <div className="bg-purple-100 rounded-full p-3">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Hoạt động (30 ngày)</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {customersWithRecentOrders}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {totalCustomers > 0 
                ? ((customersWithRecentOrders / totalCustomers) * 100).toFixed(1)
                : 0}% khách hàng
            </p>
          </div>
          <div className="bg-orange-100 rounded-full p-3">
            <Calendar className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  );
}