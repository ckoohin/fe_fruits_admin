import React, { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';

interface OrderFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export interface FilterState {
  search: string;
  order_status: string;
  payment_status: string;
  payment_method: string;
  start_date: string;
  end_date: string;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({ onFilterChange, initialFilters }) => {
  const [filters, setFilters] = useState<FilterState>(
    initialFilters || {
      search: '',
      order_status: '',
      payment_status: '',
      payment_method: '',
      start_date: '',
      end_date: '',
    }
  );

  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const emptyFilters: FilterState = {
      search: '',
      order_status: '',
      payment_status: '',
      payment_method: '',
      start_date: '',
      end_date: '',
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, tên khách hàng, số điện thoại..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-green-50 border-green-300 text-green-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-5 h-5" />
          Bộ lọc
          {hasActiveFilters && (
            <span className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {Object.values(filters).filter(v => v !== '').length}
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            <X className="w-5 h-5" />
            Xóa lọc
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Order Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái đơn hàng
              </label>
              <select
                value={filters.order_status}
                onChange={(e) => handleFilterChange('order_status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Tất cả</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="processing">Đang xử lý</option>
                <option value="shipping">Đang giao</option>
                <option value="delivered">Đã giao</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái thanh toán
              </label>
              <select
                value={filters.payment_status}
                onChange={(e) => handleFilterChange('payment_status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Tất cả</option>
                <option value="pending">Chờ thanh toán</option>
                <option value="paid">Đã thanh toán</option>
                <option value="failed">Thất bại</option>
                <option value="refunded">Đã hoàn tiền</option>
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phương thức thanh toán
              </label>
              <select
                value={filters.payment_method}
                onChange={(e) => handleFilterChange('payment_method', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Tất cả</option>
                <option value="cod">COD</option>
                <option value="bank_transfer">Chuyển khoản</option>
                <option value="momo">MoMo</option>
                <option value="vnpay">VNPay</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Từ ngày
              </label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đến ngày
              </label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderFilters;