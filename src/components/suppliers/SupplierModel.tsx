import React from 'react';
import { Supplier, CreateSupplierRequest } from '@/types/supplier';

interface SupplierModalProps {
  showModal: boolean;
  editingSupplier: Supplier | null;
  formData: CreateSupplierRequest;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export default function SupplierModal({
  showModal,
  editingSupplier,
  formData,
  onClose,
  onSubmit,
  onInputChange
}: SupplierModalProps) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">
            {editingSupplier ? 'Chỉnh Sửa Nhà Cung Cấp' : 'Thêm Nhà Cung Cấp Mới'}
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
          {/* Row 1: Tên và Mã */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên nhà cung cấp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={onInputChange}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Ví dụ: Nông sản Đà Lạt"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã nhà cung cấp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={onInputChange}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                placeholder="NSDL001"
                readOnly={!!editingSupplier}
              />
              {editingSupplier && (
                <p className="mt-1 text-xs text-gray-500">
                  Không thể thay đổi mã khi chỉnh sửa
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Email và SĐT */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={onInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="contact@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={onInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0263382212"
              />
            </div>
          </div>

          {/* Row 3: Người liên hệ và Mã số thuế */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Người liên hệ
              </label>
              <input
                type="text"
                name="contact_person"
                value={formData.contact_person || ''}
                onChange={onInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã số thuế
              </label>
              <input
                type="text"
                name="tax_code"
                value={formData.tax_code || ''}
                onChange={onInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0123456789"
              />
            </div>
          </div>

          {/* Row 4: Địa chỉ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ
            </label>
            <input
              type="text"
              name="address"
              value={formData.address || ''}
              onChange={onInputChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="123 Yersin, Phường 1"
            />
          </div>

          {/* Row 5: Tỉnh/TP, Quận/Huyện, Phường/Xã */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tỉnh/Thành phố
              </label>
              <input
                type="text"
                name="province"
                value={formData.province || ''}
                onChange={onInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Lâm Đồng"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quận/Huyện
              </label>
              <input
                type="text"
                name="district"
                value={formData.district || ''}
                onChange={onInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Đà Lạt"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phường/Xã
              </label>
              <input
                type="text"
                name="ward"
                value={formData.ward || ''}
                onChange={onInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Phường 1"
              />
            </div>
          </div>

          {/* Row 6: Thông tin ngân hàng */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tài khoản ngân hàng
              </label>
              <input
                type="text"
                name="bank_account"
                value={formData.bank_account || ''}
                onChange={onInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngân hàng
              </label>
              <input
                type="text"
                name="bank_name"
                value={formData.bank_name || ''}
                onChange={onInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Vietcombank"
              />
            </div>
          </div>

          {/* Row 7: Trạng thái */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="status"
              id="status"
              checked={formData.status}
              onChange={(e) => {
                const event = {
                  target: {
                    name: 'status',
                    value: e.target.checked,
                    type: 'checkbox'
                  }
                } as any;
                onInputChange(event);
              }}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="status" className="ml-2 text-sm text-gray-700">
              Kích hoạt nhà cung cấp (đang hoạt động)
            </label>
          </div>

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
              {editingSupplier ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}