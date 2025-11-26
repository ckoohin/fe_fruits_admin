'use client';
import React, { useState, useEffect } from 'react';
import { Product, ProductVariant } from '@/types/product'; 
import { ApiHelper } from '@/utils/api';

interface ProductDetailModalProps {
  productId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export default function ProductDetailModal({
  productId,
  isOpen,
  onClose,
  onEdit,
  onDelete
}: ProductDetailModalProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  
  const [allImages, setAllImages] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && productId) {
      fetchProductDetail();
    } else {
      setProduct(null);
      setSelectedImage('');
      setAllImages([]); 
    }
  }, [isOpen, productId]);

  const fetchProductDetail = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const response = await ApiHelper.get<Product>(`api/v1/products/${productId}`);
      if (response.success && response.data) {
        setProduct(response.data);

        const imagesData = response.data.images; 
        let mainImg = '';
        let galleryImgs: string[] = [];

        if (imagesData) {
          if (imagesData.thumbnail && imagesData.thumbnail.trim() !== '') {
            mainImg = imagesData.thumbnail;
            galleryImgs.push(imagesData.thumbnail);
          }

          if (imagesData.gallery && Array.isArray(imagesData.gallery)) {
            galleryImgs = [
              ...galleryImgs, 
              ...imagesData.gallery.filter(img => img && img.trim() !== '')
            ];
          }

          //Nếu không có thumbnail, lấy ảnh gallery đầu tiên làm ảnh chính
          if (!mainImg && galleryImgs.length > 0) {
            mainImg = galleryImgs[0];
          }
        }

        // Đặt ảnh chính, nếu không có ảnh nào thì dùng ảnh mặc định
        setSelectedImage(mainImg || 'https://via.placeholder.com/150x150.png?text=No+Image'); 
        // Đặt danh sách ảnh phụ
        setAllImages(galleryImgs); 

      }
    } catch (error) {
      console.error('Error fetching product detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleEdit = () => {
    if (product && onEdit) {
      onEdit(product);
      onClose();
    }
  };

  const handleDelete = () => {
    if (product && onDelete) {
      onDelete(product);
      onClose();
    }
  };

  const parseVariantImage = (imageData: string): string => {
    try {
      if (imageData.startsWith('[')) {
        const parsed = JSON.parse(imageData);
        return Array.isArray(parsed) ? parsed[0] : imageData;
      }
      return imageData;
    } catch {
      return imageData;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Chi tiết Sản phẩm</h2>
            {product && (
              <p className="text-sm text-gray-500 mt-1">ID: {product.id} • SKU: {product.sku}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-4 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : product ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4 flex flex-col items-center">
                  <div className="w-full max-w-[300px] max-h-[300px] bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={selectedImage || 'https://via.placeholder.com/150x150.png?text=No+Image'}
                      alt={product.name}
                      className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150x150.png?text=No+Image'; }}
                    />
                  </div>

                  {allImages.length > 1 && (
                    <div className="grid grid-cols-5 gap-2">
                      {allImages.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(img)}
                          className={`aspect-square w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImage === img
                              ? 'border-emerald-600 ring-2 ring-emerald-200'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150x150.png?text=No+Image'; }}
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                      product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.is_active ? '✓ Đang hoạt động' : '○ Tạm dừng'}
                    </span>
                    {product.is_featured && (
                      <span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        ★ Nổi bật
                      </span>
                    )}
                    {product.is_fresh && (
                      <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        ❄ Tươi sống
                      </span>
                    )}
                    {product.organic_certified && (
                      <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        🌿 Hữu cơ
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-4 overflow-y-auto">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{product.name}</h1>
                    <p className="text-sm text-gray-600">{product.category_name} • {product.unit_name}</p>
                  </div>

                  {product.short_description && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm">
                      {product.short_description}
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-3 border border-emerald-200 text-sm space-y-2">
                    <div className="flex items-baseline gap-3">
                      <span className="text-xl font-bold text-emerald-600">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(product.price))}
                      </span>
                      {product.compare_price && parseFloat(product.compare_price) > parseFloat(product.price) && (
                        <span className="text-gray-400 line-through text-sm">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(product.compare_price))}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {product.cost_price && (
                        <div>
                          <span className="text-gray-600">Giá vốn:</span>
                          <span className="ml-1 font-semibold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(product.cost_price))}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">Tồn kho:</span>
                        <span className={`ml-1 font-semibold ${
                          product.stock_quantity > 50 ? 'text-green-600' : product.stock_quantity > 10 ? 'text-yellow-600' : 'text-red-600'
                        }`}>{product.stock_quantity} {product.unit_name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="text-gray-600 mb-1">📦 Trọng lượng</div>
                      <div className="font-semibold text-gray-900">{product.weight} kg</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="text-gray-600 mb-1">🌍 Xuất xứ</div>
                      <div className="font-semibold text-gray-900">{product.origin}</div>
                    </div>
                    {product.harvest_season && (
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-gray-600 mb-1">📅 Mùa vụ</div>
                        <div className="font-semibold text-gray-900">{product.harvest_season}</div>
                      </div>
                    )}
                    {product.shelf_life_days > 0 && (
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-gray-600 mb-1">⏱ Hạn sử dụng</div>
                        <div className="font-semibold text-gray-900">{product.shelf_life_days} ngày</div>
                      </div>
                    )}
                  </div>

                  {product.storage_conditions && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                      <div className="font-semibold text-blue-900 mb-1">Bảo quản</div>
                      <p className="text-blue-800">{product.storage_conditions}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📝 Mô tả chi tiết</h3>
                <div className="bg-gray-50 rounded-lg p-3 text-gray-700 text-sm whitespace-pre-line">
                  {product.description}
                </div>
              </div>

              {product.variants && product.variants.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">🔄 Biến thể sản phẩm ({product.variants.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {product.variants.map((variant: ProductVariant) => (
                      <div key={variant.id} className="bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-emerald-300 transition-colors flex items-center gap-3">
                        {variant.image && (
                          <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={parseVariantImage(variant.image)}
                              alt={variant.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150x150.png?text=No+Image'; }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1 truncate">{variant.name}</h4>
                          <p className="text-xs text-gray-500 mb-1">SKU: {variant.sku}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-emerald-600">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(variant.price)}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              variant.stock_quantity > 50 ? 'bg-green-100 text-green-800' :
                              variant.stock_quantity > 10 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {variant.stock_quantity} {product.unit_name}
                            </span>
                          </div>
                          {variant.weight && (
                            <p className="text-xs text-gray-600 mt-1">📦 {variant.weight} kg</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center py-20">
              <p className="text-gray-500">Không tìm thấy thông tin sản phẩm</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-white font-medium transition-colors"
          >
            Đóng
          </button>

          {product && (
            <div className="flex gap-2">
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center gap-1"
                >
                  Xóa
                </button>
              )}
              {onEdit && (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors flex items-center gap-1"
                >
                  Chỉnh sửa
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}