'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { adminApi } from '@/lib/adminApi';
import { Product, Category,Unit } from '@/types/product';

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  units: Unit[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  submitting?: boolean;
  initialData?: any;
}

export function ProductForm({
  product,
  categories,
  units,
  onSubmit,
  onCancel,
  submitting = false,
}: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    sku: product?.sku || '',
    category_id: product?.category_id || '',
    unit_id: product?.unit_id || '',
    description: product?.description || '',
    short_description: product?.short_description || '',
    images: product?.images || { gallery: [], thumbnail: '' },
    price: product?.price || '',
    compare_price: product?.compare_price || '',
    cost_price: product?.cost_price || '',
    weight: product?.weight?.toString() || '',
    dimensions: product?.dimensions || '',
    stock_quantity: product?.stock_quantity?.toString() || '0',
    min_stock: product?.min_stock?.toString() || '0',
    track_inventory: product?.track_inventory ?? true,
    is_fresh: product?.is_fresh ?? true,
    shelf_life_days: product?.shelf_life_days?.toString() || '',
    storage_conditions: product?.storage_conditions || '',
    origin: product?.origin || '',
    harvest_season: product?.harvest_season || '',
    organic_certified: product?.organic_certified ?? false,
    is_featured: product?.is_featured ?? false,
    is_active: product?.is_active ?? true,
    seo_title: product?.seo_title || '',
    seo_description: product?.seo_description || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  const handleImagesChange = (images: { gallery: string[]; thumbnail: string }) => {
    setFormData(prev => ({ ...prev, images }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean up form data
    const cleanedData = {
      ...formData,
      price: Number(formData.price) || 0,
      sku: formData.sku || null,
      compare_price: formData.compare_price ? Number(formData.compare_price) : null,
      cost_price: formData.cost_price ? Number(formData.cost_price) : null,
      weight: formData.weight ? Number(formData.weight) : null,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      min_stock: parseInt(formData.min_stock) || 0,
      dimensions: formData.dimensions || null,
      shelf_life_days: formData.shelf_life_days ? Number(formData.shelf_life_days) : null,
      storage_conditions: formData.storage_conditions || null,
      origin: formData.origin || null,
      harvest_season: formData.harvest_season || null,
      seo_title: formData.seo_title || null,
      seo_description: formData.seo_description || null,
      description: formData.description || null,
      short_description: formData.short_description || null
    };
    
    onSubmit(cleanedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin cơ bản</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên sản phẩm *
            </label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nhập tên sản phẩm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SKU
            </label>
            <Input
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="Nhập mã SKU"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục *
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chọn danh mục</option>
                {Array.isArray(categories) && categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đơn vị *
            </label>
            <select
              name="unit_id"
              value={formData.unit_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chọn đơn vị</option>
              {units.map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.name} ({unit.abbreviation})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá bán *
            </label>
            <Input
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              required
              placeholder="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá so sánh
            </label>
            <Input
              name="compare_price"
              type="number"
              value={formData.compare_price}
              onChange={handleChange}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Inventory */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quản lý kho</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số lượng tồn kho
            </label>
            <Input
              name="stock_quantity"
              type="number"
              value={formData.stock_quantity}
              onChange={handleChange}
              placeholder="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tồn kho tối thiểu
            </label>
            <Input
              name="min_stock"
              type="number"
              value={formData.min_stock}
              onChange={handleChange}
              placeholder="0"
            />
          </div>
          
          <div className="md:col-span-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="track_inventory"
                checked={formData.track_inventory}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Theo dõi tồn kho
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Product Properties */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thuộc tính sản phẩm</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trọng lượng (g)
            </label>
            <Input
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleChange}
              placeholder="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kích thước
            </label>
            <Input
              name="dimensions"
              value={formData.dimensions}
              onChange={handleChange}
              placeholder="VD: 10x10x5 cm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Xuất xứ
            </label>
            <Input
              name="origin"
              value={formData.origin}
              onChange={handleChange}
              placeholder="Nhập xuất xứ"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mùa thu hoạch
            </label>
            <Input
              name="harvest_season"
              value={formData.harvest_season}
              onChange={handleChange}
              placeholder="VD: Tháng 1-3"
            />
          </div>
          
          <div className="md:col-span-2">
            <div className="flex space-x-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_fresh"
                  checked={formData.is_fresh}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Sản phẩm tươi
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="organic_certified"
                  checked={formData.organic_certified}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Chứng nhận hữu cơ
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Sản phẩm nổi bật
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Hoạt động
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Mô tả</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả ngắn
            </label>
            <textarea
              name="short_description"
              value={formData.short_description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mô tả ngắn về sản phẩm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả chi tiết
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mô tả chi tiết về sản phẩm"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'Đang lưu...' : (product ? 'Cập nhật' : 'Tạo mới')}
        </Button>
      </div>
    </form>
  );
}
