'use client';
import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, ShoppingCart, Users, Package, DollarSign, Calendar, FileText, AlertCircle, Download, RefreshCw, Filter, ArrowUpRight, ArrowDownRight, Printer } from 'lucide-react';
import { useReports } from '@/hooks/useReport';
import {
  RevenueOverview,
  RevenueByPeriod,
  RevenueByPaymentMethod,
  RevenueByProvince,
  OrderStatusCount,
  TopSellingProduct,
  RevenueByCategory,
  TopCustomer,
  NewCustomerTrend,
  StockLevel,
  InventoryValue,
  ImportHistory,
  ExportHistory,
  InventoryAdjustment,
} from '@/types/report';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const FruitsAdminReport = () => {
  const {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    loading,
    revenueOverview,
    revenueByPeriod,
    revenueByPaymentMethod,
    revenueByProvince,
    orderStatusCounts,
    topSellingProducts,
    revenueByCategory,
    topCustomers,
    newCustomerTrend,
    stockLevels,
    inventoryValue,
    importHistory,
    exportHistory,
    inventoryAdjustments,
    refetch,
  } = useReports();

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const formatNumber = (value: number) => new Intl.NumberFormat('vi-VN').format(value);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('vi-VN');

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const exportToPDF = () => window.print();

  const exportToExcel = () => alert('Tính năng xuất Excel đang được phát triển');

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }: any) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <div
              className={`flex items-center gap-1 mt-2 text-sm ${
                trend >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              <span>{Math.abs(trend).toFixed(1)}% so với kỳ trước</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const filteredStockLevels = showLowStockOnly
    ? stockLevels.filter((s) => s.quantity < s.min_stock)
    : stockLevels;

  const lowStockCount = stockLevels.filter((s) => s.quantity < s.min_stock).length;

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-600">
        <div className="animate-spin mx-auto mb-3 border-4 border-gray-300 border-t-blue-500 rounded-full w-10 h-10"></div>
        <p>Đang tải dữ liệu báo cáo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* <div className="mb-8 flex items-center justify-between">
          <div className="flex gap-3">
            <button
              onClick={refetch}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Printer className="w-5 h-5" />
              In báo cáo
            </button>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Download className="w-5 h-5" />
              Xuất Excel
            </button>
          </div>
        </div> */}

        {/* Date Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Thời gian:</span>
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <span className="text-gray-600">đến</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="day">Theo ngày</option>
              <option value="week">Theo tuần</option>
              <option value="month">Theo tháng</option>
              <option value="year">Theo năm</option>
            </select>
            <button
              onClick={refetch}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Áp dụng
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Printer className="w-5 h-5" />
              In báo cáo
            </button>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Download className="w-5 h-5" />
              Xuất Excel
            </button>
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-green-500" />
              <span className="text-lg font-medium">Đang tải dữ liệu...</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b overflow-x-auto">
            {[
              { id: 'overview', label: 'Tổng Quan', icon: TrendingUp },
              { id: 'revenue', label: 'Doanh Thu', icon: DollarSign },
              { id: 'products', label: 'Sản Phẩm', icon: Package },
              { id: 'customers', label: 'Khách Hàng', icon: Users },
              { id: 'inventory', label: 'Kho Hàng', icon: FileText }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-2 border-green-500 text-green-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && revenueOverview && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Tổng Doanh Thu"
                value={formatCurrency(revenueOverview.total_revenue)}
                icon={DollarSign}
                color="bg-green-500"
                subtitle="Doanh thu gộp"
                trend={12.5}
              />
              <StatCard
                title="Đơn Hàng"
                value={formatNumber(revenueOverview.total_orders)}
                icon={ShoppingCart}
                color="bg-blue-500"
                subtitle="Tổng số đơn"
                trend={8.3}
              />
              <StatCard
                title="Giá Trị Trung Bình"
                value={formatCurrency(revenueOverview.average_order_value)}
                icon={TrendingUp}
                color="bg-purple-500"
                subtitle="Trên mỗi đơn hàng"
                trend={5.2}
              />
              <StatCard
                title="Giá Trị Kho"
                value={formatCurrency(inventoryValue?.total_inventory_value || 0)}
                icon={Package}
                color="bg-orange-500"
                subtitle="Tổng hàng tồn"
                trend={-2.1}
              />
            </div>

            {/* Revenue & Orders Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Doanh Thu & Đơn Hàng Theo Thời Gian</h3>
                <div className="flex gap-2">
                  <Filter className="w-5 h-5 text-gray-600" />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={revenueByPeriod}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#22c55e" fillOpacity={1} fill="url(#colorRevenue)" name="Doanh thu" />
                  <Line yAxisId="right" type="monotone" dataKey="order_count" stroke="#3b82f6" strokeWidth={2} name="Số đơn" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Order Status & Payment Method */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Trạng Thái Đơn Hàng</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={orderStatusCounts}
                      dataKey="count"
                      nameKey="order_status"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {orderStatusCounts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Phương Thức Thanh Toán</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={revenueByPaymentMethod}
                      dataKey="total_revenue"
                      nameKey="payment_method"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {revenueByPaymentMethod.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Doanh Thu Thuần</p>
                    <p className="text-2xl font-bold">{formatCurrency(revenueOverview.net_sales)}</p>
                  </div>
                  <DollarSign className="w-12 h-12 opacity-80" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Phí Vận Chuyển</p>
                    <p className="text-2xl font-bold">{formatCurrency(revenueOverview.total_shipping)}</p>
                  </div>
                  <Package className="w-12 h-12 opacity-80" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Giảm Giá</p>
                    <p className="text-2xl font-bold">{formatCurrency(revenueOverview.total_discount)}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 opacity-80" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && revenueOverview && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Doanh Thu Thuần"
                value={formatCurrency(revenueOverview.net_sales)}
                icon={DollarSign}
                color="bg-green-500"
                trend={10.2}
              />
              <StatCard
                title="Phí Vận Chuyển"
                value={formatCurrency(revenueOverview.total_shipping)}
                icon={TrendingUp}
                color="bg-blue-500"
                trend={5.8}
              />
              <StatCard
                title="Giảm Giá"
                value={formatCurrency(revenueOverview.total_discount)}
                icon={TrendingUp}
                color="bg-red-500"
                trend={-3.2}
              />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Doanh Thu Theo Tỉnh Thành</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={revenueByProvince}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="province" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="total_revenue" fill="#22c55e" name="Doanh thu" />
                  <Bar dataKey="order_count" fill="#3b82f6" name="Số đơn" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Chi Tiết Doanh Thu Theo Phương Thức</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Phương Thức</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Số Đơn</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Doanh Thu</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Tỷ Lệ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {revenueByPaymentMethod.map((method) => {
                      const totalRevenue = revenueByPaymentMethod.reduce((sum, m) => sum + m.total_revenue, 0);
                      const percentage = (method.total_revenue / totalRevenue) * 100;
                      return (
                        <tr key={method.payment_method} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-800">{method.payment_method}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-800">{formatNumber(method.order_count)}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-green-600">
                            {formatCurrency(method.total_revenue)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">{percentage.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Top Sản Phẩm Bán Chạy</h3>
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="revenue">Theo doanh thu</option>
                  <option value="quantity">Theo số lượng</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Hạng</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Sản Phẩm</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">SKU</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Số Lượng Bán</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Doanh Thu</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Giá TB</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {topSellingProducts.map((product, index) => {
                      const avgPrice = product.total_revenue_generated / product.total_quantity_sold;
                      return (
                        <tr key={product.variant_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                              index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                            }`}>
                              {index + 1}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-800">{product.product_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{product.sku}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-800">{formatNumber(product.total_quantity_sold)}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-green-600">
                            {formatCurrency(product.total_revenue_generated)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">{formatCurrency(avgPrice)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Doanh Thu Theo Danh Mục</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={revenueByCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category_name" type="category" width={150} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="total_revenue_generated" fill="#22c55e" name="Doanh thu" />
                  <Bar dataKey="total_quantity_sold" fill="#3b82f6" name="Số lượng" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {revenueByCategory.map((category, index) => (
                <div key={category.category_id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-800">{category.category_name}</h4>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS[index % COLORS.length] + '20' }}>
                      <Package className="w-5 h-5" style={{ color: COLORS[index % COLORS.length] }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Doanh thu:</span>
                      <span className="text-sm font-bold text-green-600">{formatCurrency(category.total_revenue_generated)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Số lượng bán:</span>
                      <span className="text-sm font-semibold text-gray-800">{formatNumber(category.total_quantity_sold)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Xu Hướng Khách Hàng Mới</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={newCustomerTrend}>
                  <defs>
                    <linearGradient id="colorCustomer" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="new_customer_count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCustomer)" name="Khách hàng mới" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Top Khách Hàng Thân Thiết</h3>
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="revenue">Theo chi tiêu</option>
                  <option value="orders">Theo số đơn</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Hạng</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Khách Hàng</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Liên Hệ</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Số Đơn</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Tổng Chi Tiêu</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">TB/Đơn</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {topCustomers.map((customer, index) => {
                      const avgOrder = customer.total_spent / customer.total_orders;
                      return (
                        <tr key={customer.customer_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                              index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                            }`}>
                              {index + 1}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-gray-800">{customer.customer_name}</p>
                              <p className="text-xs text-gray-500">{customer.customer_email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{customer.customer_phone || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-800">{customer.total_orders}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-green-600">
                            {formatCurrency(customer.total_spent)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">{formatCurrency(avgOrder)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Tổng KH Mới</p>
                    <p className="text-2xl font-bold">{formatNumber(newCustomerTrend.reduce((sum, t) => sum + t.new_customer_count, 0))}</p>
                  </div>
                  <Users className="w-12 h-12 opacity-80" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-1">TB KH/Tháng</p>
                    <p className="text-2xl font-bold">
                      {formatNumber(Math.round(newCustomerTrend.reduce((sum, t) => sum + t.new_customer_count, 0) / newCustomerTrend.length))}
                    </p>
                  </div>
                  <TrendingUp className="w-12 h-12 opacity-80" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow-md p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Top Customer</p>
                    <p className="text-2xl font-bold">{formatCurrency(topCustomers[0]?.total_spent || 0)}</p>
                  </div>
                  <DollarSign className="w-12 h-12 opacity-80" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLowStockOnly}
                    onChange={(e) => setShowLowStockOnly(e.target.checked)}
                    className="w-4 h-4 text-green-500 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Chỉ hiển thị sản phẩm sắp hết</span>
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(Number(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value={0}>Tất cả chi nhánh</option>
                  <option value={1}>Chi nhánh HN</option>
                  <option value={2}>Chi nhánh HCM</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Tồn Kho Theo Chi Nhánh</h3>
                {lowStockCount > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{lowStockCount} sản phẩm sắp hết hàng</span>
                  </div>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Chi Nhánh</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Sản Phẩm</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">SKU</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Tồn Kho</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Tối Thiểu</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Giá Trị</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredStockLevels.map((stock) => {
                      const isLowStock = stock.quantity < stock.min_stock;
                      const stockPercentage = (stock.quantity / stock.min_stock) * 100;
                      return (
                        <tr key={`${stock.branch_id}-${stock.variant_id}`} className={`hover:bg-gray-50 ${isLowStock ? 'bg-orange-50' : ''}`}>
                          <td className="px-4 py-3 text-sm text-gray-800">{stock.branch_name}</td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-gray-800">{stock.product_name}</p>
                              <p className="text-xs text-gray-500">{stock.variant_name}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{stock.sku}</td>
                          <td className={`px-4 py-3 text-sm text-right font-bold ${isLowStock ? 'text-orange-600' : 'text-gray-800'}`}>
                            {stock.quantity}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">{stock.min_stock}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-green-600">
                            {formatCurrency(stock.quantity * stock.cost_price)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isLowStock ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                <AlertCircle className="w-3 h-3" />
                                Sắp hết
                              </span>
                            ) : stockPercentage > 150 ? (
                              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                Dồi dào
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                Tốt
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
                <h4 className="text-sm font-medium mb-2 opacity-90">Tổng Giá Trị Kho</h4>
                <p className="text-3xl font-bold">{formatCurrency(inventoryValue?.total_inventory_value || 0)}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
                <h4 className="text-sm font-medium mb-2 opacity-90">Số SKU Đang Quản Lý</h4>
                <p className="text-3xl font-bold">{stockLevels.length}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md p-6 text-white">
                <h4 className="text-sm font-medium mb-2 opacity-90">Sản Phẩm Sắp Hết</h4>
                <p className="text-3xl font-bold">{lowStockCount}</p>
              </div>
            </div>

            {/* Import/Export History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Lịch Sử Nhập Kho</h3>
                <div className="space-y-3">
                  {importHistory.data.map((item) => (
                    <div key={item.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">{item.import_code}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {item.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Nhà cung cấp: <span className="font-medium">{item.supplier_name}</span></p>
                        <p>Người yêu cầu: {item.requested_by_name}</p>
                        <p>Ngày nhập: {formatDate(item.import_date)}</p>
                        <p className="text-green-600 font-semibold">Giá trị: {formatCurrency(item.total_amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Lịch Sử Xuất Kho</h3>
                <div className="space-y-3">
                  {exportHistory.data.map((item) => (
                    <div key={item.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">{item.export_code}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {item.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Từ: <span className="font-medium">{item.from_branch_name}</span></p>
                        <p>Đến: <span className="font-medium">{item.to_branch_name}</span></p>
                        <p>Người tạo: {item.created_by_name}</p>
                        <p>Ngày xuất: {formatDate(item.export_date)}</p>
                        <p className="text-blue-600 font-semibold">Số lượng: {formatNumber(item.total_quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Inventory Adjustments */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Điều Chỉnh Tồn Kho</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Ngày</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Loại</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Số Lượng</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Lý Do</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Người Điều Chỉnh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {inventoryAdjustments.data.map((adj) => (
                      <tr key={adj.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-800">{formatDate(adj.adjustment_date)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            adj.type === 'increase' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {adj.type === 'increase' ? '↑ Tăng' : '↓ Giảm'}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-sm text-right font-semibold ${
                          adj.type === 'increase' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {adj.type === 'increase' ? '+' : '-'}{formatNumber(adj.quantity)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{adj.reason}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{adj.adjusted_by}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FruitsAdminReport;