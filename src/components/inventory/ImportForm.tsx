'use client';

import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ImportItem {
  product_id: number;
  variant_id: number;
  import_quantity: number;
  import_price?: number;
}

interface ImportFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ImportForm({ onClose, onSuccess }: ImportFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    import_code: `IMP-${Date.now()}`,
    note: '',
  });
  const [items, setItems] = useState<ImportItem[]>([
    { product_id: 0, variant_id: 0, import_quantity: 1, import_price: 0 }
  ]);

  const handleAddItem = () => {
    setItems([...items, { product_id: 0, variant_id: 0, import_quantity: 1, import_price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof ImportItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        details: items.map(item => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          import_quantity: item.import_quantity,
          import_price: item.import_price || 0
        }))
      };

      const response = await fetch('/api/inventory/imports/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Có lỗi xảy ra');
      }

      alert('Tạo yêu cầu nhập kho thành công!');
      onSuccess?.();
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Không thể tạo yêu cầu nhập kho');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = items.reduce((sum, item) => 
    sum + (item.import_quantity * (item.import_price || 0)), 0
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Tạo Yêu Cầu Nhập Kho</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Thông tin chung */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mã phiếu nhập</label>
              <input
                type="text"
                value={formData.import_code}
                onChange={(e) => setFormData({ ...formData, import_code: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tổng giá trị (dự kiến)</label>
              <input
                type="text"
                value={totalAmount.toLocaleString('vi-VN')}
                className="w-full border rounded px-3 py-2 bg-gray-50"
                readOnly
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ghi chú</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full border rounded px-3 py-2"
              rows={3}
              placeholder="Lý do nhập kho, ghi chú đặc biệt..."
            />
          </div>

          {/* Chi tiết sản phẩm */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium">Chi tiết sản phẩm</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
              >
                <Plus size={16} /> Thêm sản phẩm
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-3 items-start p-3 border rounded">
                  <div className="flex-1 grid grid-cols-4 gap-3">
                    <input
                      type="number"
                      placeholder="Product ID"
                      value={item.product_id || ''}
                      onChange={(e) => handleItemChange(index, 'product_id', parseInt(e.target.value))}
                      className="border rounded px-3 py-2"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Variant ID"
                      value={item.variant_id || ''}
                      onChange={(e) => handleItemChange(index, 'variant_id', parseInt(e.target.value))}
                      className="border rounded px-3 py-2"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Số lượng"
                      value={item.import_quantity}
                      onChange={(e) => handleItemChange(index, 'import_quantity', parseInt(e.target.value))}
                      className="border rounded px-3 py-2"
                      min="1"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Giá nhập (dự kiến)"
                      value={item.import_price || ''}
                      onChange={(e) => handleItemChange(index, 'import_price', parseFloat(e.target.value))}
                      className="border rounded px-3 py-2"
                      min="0"
                      step="1000"
                    />
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tổng số sản phẩm:</span>
              <span className="font-semibold">{items.length}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600">Tổng số lượng:</span>
              <span className="font-semibold">
                {items.reduce((sum, item) => sum + item.import_quantity, 0)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600">Tổng giá trị dự kiến:</span>
              <span className="font-semibold text-lg text-blue-600">
                {totalAmount.toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Tạo yêu cầu nhập kho'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}