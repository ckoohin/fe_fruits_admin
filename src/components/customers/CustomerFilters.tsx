import React from 'react';
import { Search, X } from 'lucide-react';

interface CustomerFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  orderCountFilter: string;
  onOrderCountFilterChange: (value: string) => void;
  spendingFilter: string;
  onSpendingFilterChange: (value: string) => void;
}

export default function CustomerFilters({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  orderCountFilter,
  onOrderCountFilterChange,
  spendingFilter,
  onSpendingFilterChange,
}: CustomerFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, email, số điện thoại..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sắp xếp theo
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name_asc">Tên (A-Z)</option>
            <option value="name_desc">Tên (Z-A)</option>
            <option value="orders_desc">Đơn hàng (Nhiều nhất)</option>
            <option value="orders_asc">Đơn hàng (Ít nhất)</option>
            <option value="spending_desc">Chi tiêu (Cao nhất)</option>
            <option value="spending_asc">Chi tiêu (Thấp nhất)</option>
            <option value="recent">Đơn hàng gần nhất</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số đơn hàng
          </label>
          <select
            value={orderCountFilter}
            onChange={(e) => onOrderCountFilterChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả</option>
            <option value="none">Chưa có đơn</option>
            <option value="1-5">1-5 đơn</option>
            <option value="6-10">6-10 đơn</option>
            <option value="11+">Trên 10 đơn</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tổng chi tiêu
          </label>
          <select
            value={spendingFilter}
            onChange={(e) => onSpendingFilterChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả</option>
            <option value="0">Chưa mua hàng</option>
            <option value="0-1m">Dưới 1 triệu</option>
            <option value="1m-5m">1-5 triệu</option>
            <option value="5m-10m">5-10 triệu</option>
            <option value="10m+">Trên 10 triệu</option>
          </select>
        </div>
      </div>
    </div>
  );
}