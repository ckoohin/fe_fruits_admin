'use client';

import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ExportItem {
  product_id: number;
  variant_id: number;
  quantity: number;
  product_name?: string;
  variant_name?: string;
  sku?: string;
}

interface ExportFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ExportForm({ onClose, onSuccess }: ExportFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    export_code: `EXP-${Date.now()}`,
    type: 1, // 1: Xuất bán, 2: Xuất hủy, 3: Chuyển kho
    to_branch_id: 1,
    export_date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [items, setItems] = useState<ExportItem[]>([
    { product_id: 0, variant_id: 0, quantity: 1 }
  ]);

  const handleAddItem = () => {
    setItems([...items, { product_id: 0, variant_id: 0, quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof ExportItem, value: any) => {
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
          quantity: item.quantity
        }))
      };

      const response = await fetch('/api/inventory/exports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Có lỗi xảy ra');
      }

      alert('Tạo phiếu xuất kho thành công!');
      onSuccess?.();
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Không thể tạo phiếu xuất kho');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Tạo Phiếu Xuất Kho</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Thông tin chung */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mã phiếu xuất</label>
              <input
                type="text"
                value={formData.export_code}
                onChange={(e) => setFormData({ ...formData, export_code: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Loại xuất kho</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: parseInt(e.target.value) })}
                className="w-full border rounded px-3 py-2"
              >
                <option value={1}>Xuất bán</option>
                <option value={2}>Xuất hủy</option>
                <option value={3}>Chuyển kho</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Chi nhánh nhận</label>
              <input
                type="number"
                value={formData.to_branch_id}
                onChange={(e) => setFormData({ ...formData, to_branch_id: parseInt(e.target.value) })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ngày xuất</label>
              <input
                type="date"
                value={formData.export_date}
                onChange={(e) => setFormData({ ...formData, export_date: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ghi chú</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border rounded px-3 py-2"
              rows={3}
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
                  <div className="flex-1 grid grid-cols-3 gap-3">
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
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                      className="border rounded px-3 py-2"
                      min="1"
                      required
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
              {loading ? 'Đang xử lý...' : 'Tạo phiếu xuất'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}