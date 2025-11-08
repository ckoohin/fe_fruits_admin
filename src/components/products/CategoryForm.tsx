'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  status: 'active' | 'inactive';
}

interface CategoryFormProps {
  initialData?: Partial<Category>;
  categories?: Category[];
  onSubmit: (data: Partial<Category>) => Promise<void>;
  onCancel: () => void;
}

export default function CategoryForm({ initialData, categories, onSubmit, onCancel }: CategoryFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Category>>(
    initialData || {
      name: '',
      slug: '',
      description: '',
      parentId: null,
      status: 'active'
    }
  );

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Submit error:', error);
      alert('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">
            {initialData?.id ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên danh mục *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tên danh mục"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ten-danh-muc"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mô tả danh mục"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục cha
            </label>
            <select
              value={formData.parentId || ''}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Không có --</option>
              {categories?.filter(cat => cat.id !== initialData?.id).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Vô hiệu hóa</option>
            </select>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
            >
              {loading ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}