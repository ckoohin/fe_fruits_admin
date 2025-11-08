'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ApiHelper } from '@/utils/api';
import { AuthUtils } from '@/utils/auth';
import { Search, Package, Check, Loader2, CheckSquare, Square } from 'lucide-react';

interface BranchStock {
  variant_id: number;
  quantity: number;
  variant_name: string;
  sku: string;
  product_name: string;
}

interface SelectedItem {
  variant_id: number;
  variant_name: string;
  sku: string;
  product_name: string;
  previous_quantity: number;
  counted_quantity: number;
}

export default function CreateStockCheckPage() {
  const router = useRouter();
  
  // ✅ FIX: Dùng helper method, chấp nhận branchId = 0
  const userBranchId = AuthUtils.getBranchId();

  const [branchStock, setBranchStock] = useState<BranchStock[]>([]);
  const [selectedItems, setSelectedItems] = useState<Map<number, SelectedItem>>(new Map());
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  // Fetch danh sách tồn kho
  useEffect(() => {
    const fetchBranchStock = async () => {
      // ✅ FIX: branchId = 0 là hợp lệ, chỉ reject null/undefined
      if (userBranchId === null || userBranchId === undefined) {
        console.error('❌ Invalid Branch ID:', userBranchId);
        alert('Không xác định được chi nhánh. Vui lòng đăng nhập lại.');
        router.push('/login');
        return;
      }

      console.log('🔄 Fetching stock for branch:', userBranchId, userBranchId === 0 ? '(Kho tổng)' : '');

      try {
        const response = await ApiHelper.get<BranchStock[]>(
          `api/v1/inventory/branches/${userBranchId}/stock`
        );
        
        if (response.success && response.data) {
          console.log('✅ Branch stock loaded:', response.data.length, 'items');
          setBranchStock(Array.isArray(response.data) ? response.data : []);
        } else {
          console.error('❌ Failed to load stock:', response.message);
          alert('Không thể tải danh sách sản phẩm: ' + response.message);
        }
      } catch (error) {
        console.error('❌ Error fetching branch stock:', error);
        alert('Lỗi khi tải danh sách sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchBranchStock();
  }, [userBranchId, router]);

  // Filter sản phẩm
  const filteredStock = branchStock.filter(item => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      item.product_name.toLowerCase().includes(query) ||
      item.variant_name.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query)
    );
  });

  // Toggle chọn sản phẩm
  const toggleSelectItem = (item: BranchStock) => {
    const newSelected = new Map(selectedItems);
    
    if (newSelected.has(item.variant_id)) {
      newSelected.delete(item.variant_id);
    } else {
      newSelected.set(item.variant_id, {
        variant_id: item.variant_id,
        variant_name: item.variant_name,
        sku: item.sku,
        product_name: item.product_name,
        previous_quantity: item.quantity,
        counted_quantity: item.quantity
      });
    }
    
    setSelectedItems(newSelected);
    setSelectAll(newSelected.size === filteredStock.length);
  };

  // Chọn tất cả
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Map());
      setSelectAll(false);
    } else {
      const newSelected = new Map<number, SelectedItem>();
      filteredStock.forEach(item => {
        newSelected.set(item.variant_id, {
          variant_id: item.variant_id,
          variant_name: item.variant_name,
          sku: item.sku,
          product_name: item.product_name,
          previous_quantity: item.quantity,
          counted_quantity: item.quantity
        });
      });
      setSelectedItems(newSelected);
      setSelectAll(true);
    }
  };

  // Cập nhật số lượng kiểm
  const updateCountedQuantity = (variantId: number, value: string) => {
    const quantity = parseInt(value) || 0;
    const newSelected = new Map(selectedItems);
    const item = newSelected.get(variantId);
    
    if (item) {
      item.counted_quantity = quantity;
      newSelected.set(variantId, item);
      setSelectedItems(newSelected);
    }
  };

  // Lưu và hoàn thành phiếu kiểm
  const handleSaveAndComplete = async () => {
    // ✅ FIX: branchId = 0 là hợp lệ
    if (userBranchId === null || userBranchId === undefined) {
      alert('❌ Lỗi: Không xác định được chi nhánh. Vui lòng đăng nhập lại.');
      console.error('Invalid branchId when saving:', userBranchId);
      return;
    }

    if (selectedItems.size === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm để kiểm kho');
      return;
    }

    if (!notes.trim()) {
      alert('Vui lòng nhập ghi chú');
      return;
    }

    if (!confirm(`Xác nhận tạo phiếu kiểm kho với ${selectedItems.size} sản phẩm?`)) {
      return;
    }

    setSaving(true);
    
    try {
      const createPayload = {
        branchId: userBranchId,
        notes: notes.trim()
      };
      console.log('📤 Creating stock check with payload:', createPayload);

      // Bước 1: Tạo phiếu kiểm
      const createResponse = await ApiHelper.post('api/v1/inventory/checks', createPayload);
      console.log('📥 Create response:', createResponse);

      if (!createResponse.success || !createResponse.data) {
        throw new Error(createResponse.message || 'Không thể tạo phiếu kiểm');
      }

      const checkId = createResponse.data.id;
      console.log('✅ Created check ID:', checkId);

      // Bước 2: Thêm từng item vào phiếu
      for (const item of selectedItems.values()) {
        console.log('📤 Adding item:', item.variant_name);
        
        const addItemResponse = await ApiHelper.post(
          `api/v1/inventory/checks/${checkId}/items`,
          {
            variantId: item.variant_id,
            countedQuantity: item.counted_quantity
          }
        );

        if (!addItemResponse.success) {
          throw new Error(`Lỗi khi thêm ${item.variant_name}`);
        }
      }

      // Bước 3: Complete phiếu kiểm
      console.log('📤 Completing check:', checkId);
      const completeResponse = await ApiHelper.post(
        `api/v1/inventory/checks/${checkId}/complete`,
        {}
      );

      if (!completeResponse.success) {
        throw new Error('Không thể hoàn thành phiếu kiểm');
      }

      console.log('✅ Stock check completed successfully');
      alert('✅ Tạo và hoàn thành phiếu kiểm kho thành công!');
      router.push('/admin/inventory/check');
      
    } catch (error: any) {
      console.error('❌ Save error:', error);
      alert('❌ Lỗi: ' + (error.message || 'Không thể lưu phiếu kiểm'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  // ✅ FIX: Chỉ reject khi null/undefined, chấp nhận 0
  if (userBranchId === null || userBranchId === undefined) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-700 mb-2">
            ⚠️ Không xác định được chi nhánh
          </h2>
          <p className="text-red-600 mb-4">
            Tài khoản của bạn chưa được gán chi nhánh hoặc phiên đăng nhập đã hết hạn.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Đăng nhập lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tạo phiếu kiểm kho</h1>
            <p className="text-sm text-gray-500 mt-1">
              {userBranchId === 0 ? '🏭 Kho tổng' : `Chi nhánh ID: ${userBranchId}`}
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/inventory/check')}
            className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Hủy
          </button>
        </div>

        {/* Ghi chú */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ghi chú <span className="text-red-500">*</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ví dụ: Kiểm kho định kỳ tháng 10/2025"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Search & Select All */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm theo tên, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              {selectAll ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
              {selectAll ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
            <span className="text-sm text-gray-600">
              Đã chọn: <span className="font-semibold text-emerald-600">{selectedItems.size}</span> / {filteredStock.length}
            </span>
          </div>
        </div>

        {/* Product List */}
        <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
          {filteredStock.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Không tìm thấy sản phẩm nào</p>
            </div>
          ) : (
            filteredStock.map((item) => {
              const isSelected = selectedItems.has(item.variant_id);
              const selectedItem = selectedItems.get(item.variant_id);
              const difference = selectedItem ? selectedItem.counted_quantity - item.quantity : 0;

              return (
                <div
                  key={item.variant_id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-emerald-50' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleSelectItem(item)}
                      className="mt-1"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                          <p className="text-sm text-gray-600 mt-0.5">{item.variant_name}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">
                              {item.sku}
                            </span>
                            <span className="text-sm text-gray-600">
                              Tồn kho: <span className="font-semibold">{item.quantity}</span>
                            </span>
                          </div>
                        </div>

                        {/* Quantity Input */}
                        {isSelected && (
                          <div className="flex items-center gap-3">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Số lượng kiểm</label>
                              <input
                                type="number"
                                min="0"
                                value={selectedItem?.counted_quantity || 0}
                                onChange={(e) => updateCountedQuantity(item.variant_id, e.target.value)}
                                className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center font-medium"
                              />
                            </div>
                            <div className="text-right">
                              <label className="block text-xs text-gray-600 mb-1">Chênh lệch</label>
                              <span
                                className={`inline-block px-3 py-2 rounded-lg font-semibold ${
                                  difference > 0
                                    ? 'bg-green-100 text-green-700'
                                    : difference < 0
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {difference > 0 ? '+' : ''}{difference}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Tổng sản phẩm kiểm:</span>{' '}
            <span className="text-lg font-bold text-emerald-600">{selectedItems.size}</span>
          </div>
          
          <button
            onClick={handleSaveAndComplete}
            disabled={saving || selectedItems.size === 0}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>Hoàn thành kiểm kho</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}