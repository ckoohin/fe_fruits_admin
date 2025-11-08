// 'use client';

// import React, { useEffect, useState } from 'react';
// import { adminApi } from '@/lib/adminApi';
// import { usePermissions } from '@/hooks/usePermissions';
// import {
//   StatsCard,
//   SalesChart,
//   RecentOrders,
//   TopProducts,
//   QuickActions,
// } from '@/components/dashboard';

// interface DashboardStats {
//   totalProducts: number;
//   totalCustomers: number;
//   totalOrders: number;
//   totalRevenue: number;
//   revenueGrowth: number;
//   orderGrowth: number;
//   customerGrowth: number;
//   productGrowth: number;
// }

// export default function DashboardPage() {
//   const { permissions, hasPermission, loading: permLoading } = usePermissions();
//   const [stats, setStats] = useState<DashboardStats | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [timeRange, setTimeRange] = useState<'day' | 'month' | 'year'>('day');

//   useEffect(() => {
//     loadDashboardStats();
//   }, []);

//   const loadDashboardStats = async () => {
//     try {
//       setLoading(true);
//       const response = await adminApi.getDashboardStats();
//       if (response.success && response.data) {
//         setStats(response.data);
//       }
//     } catch (err: any) {
//       setError(err.message || 'Không thể tải dữ liệu dashboard');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading || permLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="text-red-600 text-lg mb-4">⚠️</div>
//           <h2 className="text-xl font-semibold text-gray-900 mb-2">Lỗi tải dữ liệu</h2>
//           <p className="text-gray-600 mb-4">{error}</p>
//           <button
//             onClick={loadDashboardStats}
//             className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//           >
//             Thử lại
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* 🔹 Quick Actions */}
//       {hasPermission('create_products') && <QuickActions />}

//       {/* 🔹 Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <StatsCard
//           title="Tổng sản phẩm"
//           value={stats?.totalProducts || 0}
//           change={stats?.productGrowth || 0}
//           icon="📦"
//           color="blue"
//         />
//         <StatsCard
//           title="Tổng khách hàng"
//           value={stats?.totalCustomers || 0}
//           change={stats?.customerGrowth || 0}
//           icon="👥"
//           color="green"
//         />
//         <StatsCard
//           title="Tổng đơn hàng"
//           value={stats?.totalOrders || 0}
//           change={stats?.orderGrowth || 0}
//           icon="🛒"
//           color="yellow"
//         />
//         <StatsCard
//           title="Tổng doanh thu"
//           value={stats?.totalRevenue || 0}
//           change={stats?.revenueGrowth || 0}
//           icon="💰"
//           color="purple"
//           isCurrency
//         />
//       </div>

//       {/* 🔹 Charts and Tables */}
//       <div className="grid grid-cols-1 gap-6">
//         {hasPermission('view_dashboard') && (
//           <div className="bg-white p-6 rounded-lg shadow">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-lg font-semibold text-gray-900">
//                 Biểu đồ doanh thu
//               </h2>
//               <div className="flex space-x-2">
//                 <button
//                   onClick={() => setTimeRange('day')}
//                   className={`px-3 py-1 rounded-md text-sm ${
//                     timeRange === 'day'
//                       ? 'bg-blue-500 text-white'
//                       : 'bg-gray-200 text-gray-800'
//                   } hover:bg-blue-600 transition-colors`}
//                 >
//                   Ngày
//                 </button>
//                 <button
//                   onClick={() => setTimeRange('month')}
//                   className={`px-3 py-1 rounded-md text-sm ${
//                     timeRange === 'month'
//                       ? 'bg-blue-500 text-white'
//                       : 'bg-gray-200 text-gray-800'
//                   } hover:bg-blue-600 transition-colors`}
//                 >
//                   Tháng
//                 </button>
//                 <button
//                   onClick={() => setTimeRange('year')}
//                   className={`px-3 py-1 rounded-md text-sm ${
//                     timeRange === 'year'
//                       ? 'bg-blue-500 text-white'
//                       : 'bg-gray-200 text-gray-800'
//                   } hover:bg-blue-600 transition-colors`}
//                 >
//                   Năm
//                 </button>
//               </div>
//             </div>
//             <SalesChart timeRange={timeRange} />
//           </div>
//         )}
//       </div>

//       {/* 🔹 Top Products & Recent Orders */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
//         {hasPermission('view_products') && (
//           <div className="bg-white p-6 rounded-lg shadow">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">
//               Sản phẩm bán chạy
//             </h2>
//             <TopProducts />
//           </div>
//         )}

//         {hasPermission('view_orders') && (
//           <div className="bg-white p-6 rounded-lg shadow">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">
//               Đơn hàng gần đây
//             </h2>
//             <RecentOrders />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

'use client';
import React from 'react';
import { TrendingUp, ShoppingCart, DollarSign, Users, Package, Calendar } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useReports } from '@/hooks/useReport';
import { RevenueByPeriod, TopSellingProduct, OrderStatusCount, NewCustomerTrend } from '@/types/report';

export default function AdminDashboard() {
  const {
    revenueOverview,
    revenueByPeriod,
    topSellingProducts,
    orderStatusCounts,
    newCustomerTrend,
    loading,
    startDate,
    endDate,
    setStartDate,
    setEndDate
  } = useReports();

  const STATUS_COLORS: { [key: string]: string } = {
    'Hoàn thành': '#10b981',
    'Đang xử lý': '#f59e0b',
    'Đã hủy': '#ef4444',
    'Chờ thanh toán': '#3b82f6',
    'Pending': '#f59e0b',
    'Processing': '#3b82f6',
    'Completed': '#10b981',
    'Cancelled': '#ef4444',
    'pending': '#f59e0b',
    'processing': '#3b82f6',
    'completed': '#10b981',
    'cancelled': '#ef4444'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const totalNewCustomers = newCustomerTrend.reduce((sum: number, item: NewCustomerTrend) => sum + item.new_customer_count, 0);

  const chartData = revenueByPeriod.map((item: RevenueByPeriod) => ({
    thời_gian: item.period,
    'Doanh thu': item.revenue,
    'Đơn hàng': item.order_count
  }));

  const productChartData = topSellingProducts.slice(0, 10).map((item: TopSellingProduct) => ({
    name: item.product_name.length > 20 ? item.product_name.substring(0, 20) + '...' : item.product_name,
    'Doanh thu': item.total_revenue_generated,
    'Số lượng': item.total_quantity_sold
  }));

  const statusChartData = orderStatusCounts.map((item: OrderStatusCount) => ({
    name: item.order_status,
    value: item.count
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-5 pl-3 pr-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              Bảng Điều Khiển
            </h1>
            <p className="text-sm text-slate-600">Tổng quan hoạt động kinh doanh</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-600" />
            <div className="flex gap-2 items-center">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs font-medium text-slate-700 border-none focus:outline-none"
              />
              <span className="text-slate-400 text-xs">→</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs font-medium text-slate-700 border-none focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-xs backdrop-blur-sm">
                <TrendingUp className="w-3 h-3" />
                <span>+12%</span>
              </div>
            </div>
            <p className="text-blue-100 text-xs mb-1">Tổng đơn hàng</p>
            <p className="text-2xl font-bold">{revenueOverview?.total_orders?.toLocaleString() || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-xs backdrop-blur-sm">
                <TrendingUp className="w-3 h-3" />
                <span>+18%</span>
              </div>
            </div>
            <p className="text-emerald-100 text-xs mb-1">Tổng doanh thu</p>
            <p className="text-2xl font-bold">${revenueOverview?.total_revenue?.toLocaleString() || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Package className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-xs backdrop-blur-sm">
                <TrendingUp className="w-3 h-3" />
                <span>+8%</span>
              </div>
            </div>
            <p className="text-purple-100 text-xs mb-1">Giá trị TB/Đơn</p>
            <p className="text-2xl font-bold">${revenueOverview?.average_order_value?.toFixed(2) || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-xs backdrop-blur-sm">
                <TrendingUp className="w-3 h-3" />
                <span>+24%</span>
              </div>
            </div>
            <p className="text-orange-100 text-xs mb-1">Khách hàng mới</p>
            <p className="text-2xl font-bold">{totalNewCustomers.toLocaleString()}</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-md border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Doanh thu theo thời gian</h2>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                  Tháng
                </button>
                <button className="px-3 py-1.5 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors">
                  Năm
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="thời_gian" stroke="#64748b" style={{ fontSize: '11px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '11px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="Doanh thu" stroke="#3b82f6" strokeWidth={2} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status Pie Chart */}
          <div className="bg-white rounded-xl p-5 shadow-md border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Trạng thái đơn hàng</h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusChartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-1.5">
              {statusChartData.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[item.name] || '#94a3b8' }}></div>
                    <span className="text-xs text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl p-5 shadow-md border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Sản phẩm bán chạy</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={productChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '10px' }} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#64748b" style={{ fontSize: '11px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgb(0 0 0 / 0.1)',
                  fontSize: '12px'
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Doanh thu" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Số lượng" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topSellingProducts.slice(0, 4).map((product: TopSellingProduct) => (
            <div key={product.variant_id} className="bg-white rounded-xl p-4 shadow-md border border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center text-lg font-bold text-slate-600 flex-shrink-0">
                  {product.image ? (
                    <img src={product.image} alt={product.product_name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    product.sku.charAt(0)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 mb-0.5">{product.sku}</p>
                  <h3 className="font-bold text-slate-900 text-xs leading-tight line-clamp-2">{product.product_name}</h3>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg">
                  <span className="text-xs text-emerald-700 font-medium">Doanh thu</span>
                  <span className="text-xs font-bold text-emerald-600">${product.total_revenue_generated.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <span className="text-xs text-blue-700 font-medium">Đã bán</span>
                  <span className="text-xs font-bold text-blue-600">{product.total_quantity_sold} sp</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
