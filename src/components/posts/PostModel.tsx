import React from 'react';
import { Post, CreatePostRequest } from '@/types/post';
import { Category } from '@/types/category';

interface PostModalProps {
  showModal: boolean;
  editingPost: Post | null;
  formData: CreatePostRequest;
  categories: Category[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function PostModal({
  showModal,
  editingPost,
  formData,
  categories,
  onClose,
  onSubmit,
  onInputChange,
  onCategoryChange,
}: PostModalProps) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">
            {editingPost ? 'Chỉnh Sửa Bài Viết' : 'Thêm Bài Viết Mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={onInputChange}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Nhập tiêu đề"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Slug <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={onInputChange}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Nhập slug"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tóm tắt</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={onInputChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Nhập tóm tắt"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={onInputChange}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Nhập nội dung"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục <span className="text-red-500">*</span></label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={onCategoryChange}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Chọn danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
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
              {editingPost ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}