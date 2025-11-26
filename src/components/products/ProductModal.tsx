'use client';
import React from 'react';
import CloudinaryUploader from './ProductImageForm';
import { Product, Category, Unit, CreateProductRequest } from '@/types/product';

interface ProductModalProps {
  showModal: boolean;
  editingProduct: Product | null;
  formData: CreateProductRequest; 
  categories: Category[];
  units: Unit[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onThumbnailChange: (url: string) => void;
  onGalleryChange: (urls: string[]) => void;
}

export default function ProductModal({
  showModal,
  editingProduct,
  formData,
  categories,
  units,
  onClose,
  onSubmit,
  onInputChange,
  onThumbnailChange,
  onGalleryChange
}: ProductModalProps) {
  if (!showModal) return null;

  const thumbnail = formData.images?.thumbnail || '';
  const gallery = Array.isArray(formData.images?.gallery) ? formData.images.gallery : [];

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {editingProduct ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={onInputChange}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Nhập tên sản phẩm"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={onInputChange}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="ten-san-pham"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                name="category_id"
                value={formData.category_id || ''}
                onChange={onInputChange}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đơn vị <span className="text-red-500">*</span>
              </label>
              <select
                name="unit_id"
                value={formData.unit_id || ''}
                onChange={onInputChange}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Chọn đơn vị --</option>
                {units.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-8 bg-gray-50 p-6 rounded-xl">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-3">Hình ảnh sản phẩm</h3>

            {/* Ảnh chính */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Ảnh chính (Thumbnail) <span className="text-red-500">*</span>
              </label>
              <CloudinaryUploader
                label="Ảnh chính"
                initialImage={thumbnail || null}
                onUploadComplete={onThumbnailChange}
              />
            </div>

            {/* Ảnh phụ (Gallery) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Ảnh phụ (Gallery) - Tối đa 5 ảnh
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {gallery.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg border-2 border-gray-200 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => onGalleryChange(gallery.filter((_, i) => i !== index))}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition hover:bg-red-700 shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}

                {gallery.length < 5 && (
                  <CloudinaryUploader
                    label="Thêm ảnh"
                    initialImage={null}
                    onUploadComplete={(newUrl) => {
                      onGalleryChange([...gallery, newUrl]);
                    }}
                  />
                )}
              </div>

              {gallery.length >= 8 && (
                <p className="text-sm text-amber-600 mt-3">Đã đạt tối đa 5 ảnh phụ.</p>
              )}
            </div>
          </div>

          {/* Giá */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá bán <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price || ''}  // ← Đảm bảo không bị undefined
                onChange={(e) => {
                  const value = e.target.value;
                  // Chỉ cho phép số hoặc rỗng
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    onInputChange(e);
                  }
                }}
                required
                min="0"
                step="1000"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="55000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá so sánh
              </label>
              <input
                type="number"
                name="compare_price"
                value={formData.compare_price || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    onInputChange(e);
                  }
                }}
                min="0"
                step="1000"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="70000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tồn kho <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d+$/.test(value)) {
                    onInputChange(e);
                  }
                }}
                required
                min="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="150"
              />
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả ngắn <span className="text-red-500">*</span>
            </label>
            <textarea
              name="short_description"
              value={formData.short_description}
              onChange={onInputChange}
              required
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Mô tả ngắn gọn về sản phẩm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả chi tiết <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onInputChange}
              required
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Mô tả đầy đủ về sản phẩm"
            />
          </div>

          {/* Thông tin bổ sung */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xuất xứ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={onInputChange}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Long An, Việt Nam"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mùa vụ
              </label>
              <input
                type="text"
                name="harvest_season"
                value={formData.harvest_season || ''}
                onChange={onInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Quanh năm"
              />
            </div>
          </div>

          {/* Checkbox */}
          <div className="flex items-center space-x-6 border-t pt-4">
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
                Hoạt động
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_featured"
                id="is_featured"
                checked={formData.is_featured}
                onChange={onInputChange}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <label htmlFor="is_featured" className="ml-2 text-sm text-gray-700">
                Nổi bật
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
            >
              {editingProduct ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}