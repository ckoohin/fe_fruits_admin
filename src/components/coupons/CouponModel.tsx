import React from 'react';
import { Coupon, CreateCouponRequest } from '@/types/coupon';

interface CouponModalProps {
  showModal: boolean;
  editingCoupon: Coupon | null;
  formData: CreateCouponRequest;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export default function CouponModal({
  showModal,
  editingCoupon,
  formData,
  onClose,
  onSubmit,
  onInputChange
}: CouponModalProps) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">
            {editingCoupon ? 'Chỉnh sửa mã khuyến mãi' : 'Thêm mã khuyến mãi mới'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Row 1: Tên mã và Loại */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã khuyến mãi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={onInputChange}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono uppercase"
                placeholder="VD: GIAM10K"
              />
              <p className="mt-1 text-xs text-gray-500">
                Mã sẽ được khách hàng nhập khi thanh toán
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại khuyến mãi <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={onInputChange}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="percentage">Giảm theo phần trăm (%)</option>
                <option value="fixed_amount">Giảm số tiền cố định (đ)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={onInputChange}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Mô tả chi tiết về mã khuyến mãi"
            />
          </div>

          {/* Row 3: Giá trị và Điều kiện */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá trị giảm <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="value"
                value={formData.value}
                onChange={onInputChange}
                required
                min="0"
                step={formData.type === 'percentage' ? '0.01' : '1000'}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={formData.type === 'percentage' ? '10' : '50000'}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.type === 'percentage' ? 'Nhập % (0-100)' : 'Nhập số tiền (VNĐ)'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đơn hàng tối thiểu
              </label>
              <input
                type="number"
                name="minimum_amount"
                value={formData.minimum_amount || ''}
                onChange={onInputChange}
                min="0"
                step="1000"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0"
              />
              <p className="mt-1 text-xs text-gray-500">
                Giá trị đơn tối thiểu (VNĐ)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giảm tối đa
              </label>
              <input
                type="number"
                name="maximum_amount"
                value={formData.maximum_amount || ''}
                onChange={onInputChange}
                min="0"
                step="1000"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Không giới hạn"
                disabled={formData.type === 'fixed_amount'}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.type === 'percentage' ? 'Số tiền giảm tối đa' : 'Không áp dụng'}
              </p>
            </div>
          </div>

          {/* Row 4: Giới hạn sử dụng */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giới hạn tổng số lần sử dụng
              </label>
              <input
                type="number"
                name="usage_limit"
                value={formData.usage_limit || ''}
                onChange={onInputChange}
                min="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Không giới hạn"
              />
              <p className="mt-1 text-xs text-gray-500">
                Tổng số lần mã có thể được sử dụng
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giới hạn số lần/khách hàng
              </label>
              <input
                type="number"
                name="usage_limit_per_customer"
                value={formData.usage_limit_per_customer || ''}
                onChange={onInputChange}
                min="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Không giới hạn"
              />
              <p className="mt-1 text-xs text-gray-500">
                Mỗi khách hàng chỉ được dùng tối đa
              </p>
            </div>
          </div>

          {/* Row 5: Thời gian hiệu lực */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày bắt đầu
              </label>
              <input
                type="datetime-local"
                name="start_date"
                value={formData.start_date || ''}
                onChange={onInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Để trống nếu có hiệu lực ngay
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày kết thúc
              </label>
              <input
                type="datetime-local"
                name="end_date"
                value={formData.end_date || ''}
                onChange={onInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Để trống nếu không giới hạn
              </p>
            </div>
          </div>

          {/* Row 6: Áp dụng cho */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Áp dụng cho danh mục
              </label>
              <input
                type="text"
                name="applicable_categories"
                value={formData.applicable_categories || ''}
                onChange={onInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="VD: 1,2,5 (cách nhau bởi dấu phẩy)"
              />
              <p className="mt-1 text-xs text-gray-500">
                ID các danh mục áp dụng (để trống = tất cả)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Áp dụng cho sản phẩm
              </label>
              <input
                type="text"
                name="applicable_products"
                value={formData.applicable_products || ''}
                onChange={onInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="VD: 10,25,38 (cách nhau bởi dấu phẩy)"
              />
              <p className="mt-1 text-xs text-gray-500">
                ID các sản phẩm áp dụng (để trống = tất cả)
              </p>
            </div>
          </div>

          {/* Row 7: Trạng thái */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => {
                const event = {
                  target: {
                    name: 'is_active',
                    value: e.target.checked,
                    type: 'checkbox'
                  }
                } as any;
                onInputChange(event);
              }}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
              Kích hoạt mã khuyến mãi (có hiệu lực ngay)
            </label>
          </div>

          {/* Thông tin đã sử dụng (chỉ hiện khi edit) */}
          {editingCoupon && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Đã sử dụng:</strong> {editingCoupon.used_count} lần
              </p>
            </div>
          )}

          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              {editingCoupon ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}