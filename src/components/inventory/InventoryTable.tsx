'use client';

import { Package, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface InventoryItem {
  variant_id: number;
  variant_name: string;
  sku: string;
  quantity: number;
  product_name: string;
}

interface InventoryTableProps {
  items: InventoryItem[];
  loading?: boolean;
  threshold?: {
    critical: number;
    warning: number;
  };
}

export default function InventoryTable({ 
  items, 
  loading = false,
  threshold = { critical: 10, warning: 50 }
}: InventoryTableProps) {
  
  const getStockStatus = (quantity: number) => {
    if (quantity <= threshold.critical) {
      return {
        label: 'Rất thấp',
        color: 'text-red-600',
        bg: 'bg-red-50',
        icon: AlertCircle
      };
    }
    if (quantity <= threshold.warning) {
      return {
        label: 'Thấp',
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        icon: TrendingDown
      };
    }
    return {
      label: 'Tốt',
      color: 'text-green-600',
      bg: 'bg-green-50',
      icon: TrendingUp
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <Package size={48} className="mx-auto text-gray-300" />
          <p className="mt-4 text-gray-600">Không có sản phẩm nào trong kho</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sản phẩm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Biến thể
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số lượng
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => {
              const status = getStockStatus(item.quantity);
              const StatusIcon = status.icon;
              
              return (
                <tr key={item.variant_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.product_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.variant_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`text-lg font-semibold ${status.color}`}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                      <StatusIcon size={14} />
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">
            Tổng số sản phẩm: <span className="font-semibold text-gray-900">{items.length}</span>
          </span>
          <span className="text-gray-600">
            Tổng số lượng: <span className="font-semibold text-gray-900">
              {items.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}