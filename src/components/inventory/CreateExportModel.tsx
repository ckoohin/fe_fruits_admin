'use client';
import React, { useState, useEffect } from 'react';
import { CreateExportRequest } from '@/types/export';
import { ApiHelper } from '@/utils/api';
import { AuthUtils } from '@/utils/auth';

interface CreateExportModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: CreateExportRequest) => Promise<boolean>; // Thay đổi để nhận Promise
}

interface DetailRow {
  product_id: number;
  variant_id: number;
  quantity: number;
}

interface Product {
  id: number;
  name: string;
  variants: { id: number; name: string; sku?: string }[];
}

interface Branch {
  id: number;
  name: string;
}

interface VariantMap {
  [productId: number]: { id: number; name: string; sku?: string }[];
}

export default function CreateExportModal({ show, onClose, onSubmit }: CreateExportModalProps) {
  const [formData, setFormData] = useState({
    from_branch_id: 0,
    notes: ''
  });
  const [details, setDetails] = useState<DetailRow[]>([{ product_id: 0, variant_id: 0, quantity: 0 }]);
  const [products, setProducts] = useState<Product[]>([]);
  const [variantsMap, setVariantsMap] = useState<VariantMap>({});
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState<{ [index: number]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const response = await ApiHelper.get('/api/v1/products');
        if (response.success && response.data) {
          setProducts(response.data);
        } else {
          setError('Lỗi khi tải danh sách sản phẩm');
        }
      } catch (error) {
        setError('Lỗi khi tải danh sách sản phẩm');
        console.error('Error fetching products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    const fetchBranches = async () => {
      try {
        const response = await ApiHelper.get('/api/v1/branches');
        if (response.success && response.data) {
          setBranches(response.data);
        } else {
          setError('Lỗi khi tải danh sách chi nhánh');
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
        setError('Lỗi khi tải danh sách chi nhánh');
      }
    };

    const fetchUserBranch = async () => {
      const user = AuthUtils.getUser();
      const branchId = user && user.branchId !== undefined ? user.branchId : 0;
      setFormData(prev => ({ ...prev, from_branch_id: branchId }));
      if (branchId === 0) {
        setError('Không tìm thấy chi nhánh của người dùng. Vui lòng liên hệ quản trị viên.');
      }
    };

    if (show) {
      fetchProducts();
      fetchBranches();
      fetchUserBranch();
    }
  }, [show]);

  const fetchVariantsForProduct = async (productId: number, index: number) => {
    if (!productId || productId === 0) {
      setVariantsMap(prev => ({ ...prev, [productId]: [] }));
      return;
    }

    setLoadingVariants(prev => ({ ...prev, [index]: true }));
    setError(null);
    try {
      const response = await ApiHelper.get(`/api/v1/products/${productId}/variants`);
      if (response.success && response.data) {
        setVariantsMap(prev => ({ ...prev, [productId]: response.data }));
      } else {
        setVariantsMap(prev => ({ ...prev, [productId]: [] }));
        setError('Lỗi khi tải danh sách biến thể');
      }
    } catch (error) {
      setVariantsMap(prev => ({ ...prev, [productId]: [] }));
      setError('Lỗi khi tải danh sách biến thể');
      console.error('Error fetching variants:', error);
    } finally {
      setLoadingVariants(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleAddRow = () => {
    setDetails([...details, { product_id: 0, variant_id: 0, quantity: 0 }]);
  };

  const handleRemoveRow = (index: number) => {
    if (details.length > 1) {
      setDetails(details.filter((_, i) => i !== index));
      setLoadingVariants(prev => {
        const newLoading = { ...prev };
        delete newLoading[index];
        return newLoading;
      });
    }
  };

  const handleDetailChange = (index: number, field: keyof DetailRow, value: string) => {
    const newDetails = [...details];
    newDetails[index] = { ...newDetails[index], [field]: Number(value) };
    setDetails(newDetails);

    if (field === 'product_id' && Number(value) > 0) {
      newDetails[index].variant_id = 0;
      fetchVariantsForProduct(Number(value), index);
    } else if (field === 'product_id' && Number(value) === 0) {
      newDetails[index].variant_id = 0;
      setVariantsMap(prev => ({ ...prev, [index]: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.from_branch_id === 0) {
        onClose();
      alert('Không thể tạo phiếu xuất kho vì không có chi nhánh hợp lệ');
      return;
    }

    const validDetails = details.filter(
      (d) => d.product_id > 0 && d.variant_id > 0 && d.quantity > 0
    );

    if (validDetails.length === 0) {
      alert('Vui lòng thêm ít nhất 1 sản phẩm hợp lệ');
      return;
    }

    const requestData: CreateExportRequest = {
      from_branch_id: formData.from_branch_id,
      notes: formData.notes || undefined,
      details: validDetails,
    };

    try {
      console.log('Gửi yêu cầu submit:', requestData);
      const success = await onSubmit(requestData); // Chờ phản hồi từ onSubmit
      console.log('Kết quả submit:', success);
      if (success) {
        alert('✅ Tạo yêu cầu chuyển kho thành công');
        setFormData({ from_branch_id: formData.from_branch_id, notes: '' });
        setDetails([{ product_id: 0, variant_id: 0, quantity: 0 }]);
        setVariantsMap({});
        setLoadingVariants({});
        onClose(); // Đóng modal nếu thành công
      } else {
        alert('❌ Tạo yêu cầu chuyển kho thất bại. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu:', error);
      alert('❌ Đã xảy ra lỗi khi tạo yêu cầu chuyển kho. Vui lòng thử lại.');
    }
  };

  const selectedBranch = branches.find(branch => branch.id === formData.from_branch_id);

  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Tạo yêu cầu chuyển kho</h2>
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
              Chi nhánh xuất <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={selectedBranch ? selectedBranch.name : 'Không có chi nhánh'}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Ghi chú</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="Ghi chú về yêu cầu chuyển kho..."
              disabled={formData.from_branch_id === 0}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                Danh sách sản phẩm <span className="text-red-500">*</span>
              </label>
              {formData.from_branch_id !== 0 && (
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 text-sm font-medium transition-colors"
                >
                  + Thêm dòng
                </button>
              )}
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
                  {details.map((detail, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <select
                          value={detail.product_id || ''}
                          onChange={(e) => handleDetailChange(index, 'product_id', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-emerald-500"
                          disabled={loadingProducts || formData.from_branch_id === 0}
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
                          disabled={
                            loadingVariants[index] ||
                            !detail.product_id ||
                            !variantsMap[detail.product_id] ||
                            variantsMap[detail.product_id].length === 0 ||
                            formData.from_branch_id === 0
                          }
                        >
                          <option value="0">Chọn biến thể</option>
                          {variantsMap[detail.product_id]?.map((variant) => (
                            <option key={variant.id} value={variant.id}>
                              {variant.name} {variant.sku ? `(SKU: ${variant.sku})` : ''}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={detail.quantity || ''}
                          onChange={(e) => handleDetailChange(index, 'quantity', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-emerald-500"
                          placeholder="100"
                          min="1"
                          disabled={!detail.variant_id || formData.from_branch_id === 0}
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        {details.length > 1 && formData.from_branch_id !== 0 && (
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
                  ))}
                </tbody>
              </table>
            </div>

            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: Chọn sản phẩm, biến thể và nhập số lượng muốn xuất.
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
          {formData.from_branch_id !== 0 && (
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors shadow-sm"
              disabled={loadingProducts || Object.values(loadingVariants).some(v => v)}
            >
              Tạo yêu cầu
            </button>
          )}
        </div>
      </div>
    </div>
  );
}