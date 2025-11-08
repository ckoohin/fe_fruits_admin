'use client';
import React, { useState, useEffect } from 'react';
import { CreateImportRequest } from '@/types/import';
import { ApiHelper } from '@/utils/api';

interface CreateImportModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: CreateImportRequest) => void;
}

interface DetailRow {
  product_id: number;
  variant_id: number;
  import_quantity: number;
}

interface Product {
  id: number;
  name: string;
  variants: { id: number; name: string }[];
}

interface Variant {
  id: number;
  name: string;
  sku?: string;
}

export default function CreateImportModal({ show, onClose, onSubmit }: CreateImportModalProps) {
  const [formData, setFormData] = useState({ import_code: '', note: '' });
  const [details, setDetails] = useState<DetailRow[]>([{ product_id: 0, variant_id: 0, import_quantity: 0 }]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // MỖI DÒNG CÓ DANH SÁCH VARIANTS RIÊNG
  const [variantsByRow, setVariantsByRow] = useState<{ [key: number]: Variant[] }>({});
  const [loadingVariantsByRow, setLoadingVariantsByRow] = useState<{ [key: number]: boolean }>({});
  
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const response = await ApiHelper.get('/api/v1/products');
        if (response.success && response.data) {
          setProducts(response.data);
        } else {
          setError(response.message || 'Không thể tải danh sách sản phẩm');
        }
      } catch (error) {
        setError('Lỗi khi tải danh sách sản phẩm');
        console.error('Error fetching products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };
    if (show) fetchProducts();
  }, [show]);

  if (!show) return null;

  const handleAddRow = () => {
    setDetails([...details, { product_id: 0, variant_id: 0, import_quantity: 0 }]);
  };

  const handleRemoveRow = (index: number) => {
    if (details.length > 1) {
      setDetails(details.filter((_, i) => i !== index));
      
      // Xóa variants của dòng này
      const newVariants = { ...variantsByRow };
      delete newVariants[index];
      setVariantsByRow(newVariants);
      
      const newLoading = { ...loadingVariantsByRow };
      delete newLoading[index];
      setLoadingVariantsByRow(newLoading);
    }
  };

  const handleDetailChange = async (index: number, field: keyof DetailRow, value: string) => {
    const newDetails = [...details];
    newDetails[index] = { ...newDetails[index], [field]: Number(value) };
    
    // Nếu đổi product thì reset variant_id
    if (field === 'product_id') {
      newDetails[index].variant_id = 0;
    }
    
    setDetails(newDetails);

    // Load variants cho TỪNG DÒNG khi product_id thay đổi
    if (field === 'product_id' && Number(value) > 0) {
      setLoadingVariantsByRow({ ...loadingVariantsByRow, [index]: true });
      setError(null);
      
      try {
        const response = await ApiHelper.get(`/api/v1/products/${value}/variants`);
        if (response.success && response.data) {
          setVariantsByRow({ ...variantsByRow, [index]: response.data });
        } else {
          setError(response.message || 'Không thể tải danh sách biến thể');
        }
      } catch (error) {
        setError('Lỗi khi tải danh sách biến thể');
        console.error('Error fetching variants:', error);
      } finally {
        setLoadingVariantsByRow({ ...loadingVariantsByRow, [index]: false });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.import_code.trim()) {
      alert('Vui lòng nhập mã phiếu nhập');
      return;
    }

    const validDetails = details.filter(
      (d) => d.product_id > 0 && d.variant_id > 0 && d.import_quantity > 0
    );

    if (validDetails.length === 0) {
      alert('Vui lòng thêm ít nhất 1 sản phẩm hợp lệ');
      return;
    }

    const requestData: CreateImportRequest = {
      import_code: formData.import_code,
      note: formData.note || undefined,
      details: validDetails,
    };

    onSubmit(requestData);
    setFormData({ import_code: '', note: '' });
    setDetails([{ product_id: 0, variant_id: 0, import_quantity: 0 }]);
    setVariantsByRow({});
    setLoadingVariantsByRow({});
  };

  const generateImportCode = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setFormData({ ...formData, import_code: `PNK-${dateStr}-${randomNum}` });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Tạo yêu cầu nhập hàng</h2>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mã phiếu nhập <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.import_code}
                onChange={(e) => setFormData({ ...formData, import_code: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="PNK-20251017-001"
                required
              />
              <button
                type="button"
                onClick={generateImportCode}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                🎲 Tạo mã
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Ghi chú</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Ghi chú về phiếu nhập này..."
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                Danh sách sản phẩm <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAddRow}
                className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 text-sm font-medium transition-colors"
              >
                + Thêm dòng
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Sản phẩm</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Biến thể</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Số lượng</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {details.map((detail, index) => {
                    const rowVariants = variantsByRow[index] || [];
                    const isLoadingVariants = loadingVariantsByRow[index] || false;
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <select
                            value={detail.product_id || ''}
                            onChange={(e) => handleDetailChange(index, 'product_id', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-emerald-500"
                            disabled={loadingProducts}
                          >
                            <option value="0">Chọn sản phẩm</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={detail.variant_id || ''}
                            onChange={(e) => handleDetailChange(index, 'variant_id', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-emerald-500"
                            disabled={isLoadingVariants || !detail.product_id || rowVariants.length === 0}
                          >
                            <option value="0">
                              {isLoadingVariants ? 'Đang tải...' : 'Chọn biến thể'}
                            </option>
                            {rowVariants.map((variant) => (
                              <option key={variant.id} value={variant.id}>
                                {variant.name} {variant.sku ? `(SKU: ${variant.sku})` : ''}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={detail.import_quantity || ''}
                            onChange={(e) => handleDetailChange(index, 'import_quantity', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-emerald-500"
                            placeholder="100"
                            min="1"
                            disabled={!detail.variant_id}
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          {details.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(index)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Xóa dòng"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: Chọn sản phẩm, biến thể và nhập số lượng muốn nhập. Có thể thêm nhiều dòng.
            </p>
          </div>
        </form>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors shadow-sm"
            disabled={loadingProducts}
          >
            Tạo yêu cầu
          </button>
        </div>
      </div>
    </div>
  );
}