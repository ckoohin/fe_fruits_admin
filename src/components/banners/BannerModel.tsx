import React from 'react';
import { Banner, CreateBannerRequest } from '@/types/banner';

interface BannerModalProps {
  showModal: boolean;
  editingBanner: Banner | null;
  formData: CreateBannerRequest;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export default function BannerModal({
  showModal,
  editingBanner,
  formData,
  onClose,
  onSubmit,
  onInputChange
}: BannerModalProps) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">
            {editingBanner ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={onInputChange}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Nhập tiêu đề banner"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đường dẫn hình ảnh <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={onInputChange}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="/uploads/banners/image.jpg"
            />
            {formData.image && (
              <img 
                src={formData.image} 
                alt="Preview" 
                className="mt-2 w-full h-32 object-cover rounded"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link đích (tùy chọn)
            </label>
            <input
              type="text"
              name="link"
              value={formData.link}
              onChange={onInputChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="/khuyen-mai hoặc https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vị trí <span className="text-red-500">*</span>
            </label>
            <select
              name="position"
              value={formData.position}
              onChange={onInputChange}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="homepage-main">Trang chủ - Chính</option>
              <option value="homepage-sidebar">Trang chủ - Sidebar</option>
              <option value="category-top">Danh mục - Top</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thứ tự sắp xếp <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="sort_order"
              value={formData.sort_order}
              onChange={onInputChange}
              required
              min="0"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="0"
            />
            <p className="mt-1 text-xs text-gray-500">Số nhỏ hơn sẽ hiển thị trước</p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={formData.is_active}
              onChange={onInputChange}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
              Kích hoạt banner (hiển thị ngay lập tức)
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
              {editingBanner ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}