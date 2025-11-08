'use client';

import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

interface StockItem {
  variant_id: number;
  variant_name: string;
  sku: string;
  quantity: number;
  product_name: string;
}

interface StockAlertProps {
  items: StockItem[];
  threshold?: {
    critical: number;
    warning: number;
    safe: number;
  };
}

export default function StockAlert({ 
  items, 
  threshold = { critical: 10, warning: 50, safe: 100 } 
}: StockAlertProps) {
  
  const getStockLevel = (quantity: number) => {
    if (quantity <= threshold.critical) return 'critical';
    if (quantity <= threshold.warning) return 'warning';
    return 'safe';
  };

  const criticalItems = items.filter(item => getStockLevel(item.quantity) === 'critical');
  const warningItems = items.filter(item => getStockLevel(item.quantity) === 'warning');

  if (criticalItems.length === 0 && warningItems.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-800">
          <CheckCircle size={20} />
          <span className="font-medium">Tồn kho ổn định</span>
        </div>
        <p className="text-sm text-green-600 mt-1">
          Tất cả sản phẩm đều có số lượng đầy đủ
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Critical Alerts */}
      {criticalItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 mb-3">
            <AlertCircle size={20} />
            <span className="font-medium">
              Cảnh báo: {criticalItems.length} sản phẩm sắp hết hàng
            </span>
          </div>
          <div className="space-y-2">
            {criticalItems.slice(0, 5).map((item) => (
              <div 
                key={item.variant_id}
                className="flex justify-between items-center text-sm bg-white p-2 rounded"
              >
                <div>
                  <span className="font-medium">{item.product_name}</span>
                  {item.variant_name && (
                    <span className="text-gray-600"> - {item.variant_name}</span>
                  )}
                  <span className="text-gray-500 text-xs ml-2">({item.sku})</span>
                </div>
                <span className="font-semibold text-red-600">
                  Còn {item.quantity}
                </span>
              </div>
            ))}
            {criticalItems.length > 5 && (
              <p className="text-xs text-red-600 text-center mt-2">
                và {criticalItems.length - 5} sản phẩm khác...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Warning Alerts */}
      {warningItems.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800 mb-3">
            <AlertTriangle size={20} />
            <span className="font-medium">
              Lưu ý: {warningItems.length} sản phẩm sắp cần nhập thêm
            </span>
          </div>
          <div className="space-y-2">
            {warningItems.slice(0, 5).map((item) => (
              <div 
                key={item.variant_id}
                className="flex justify-between items-center text-sm bg-white p-2 rounded"
              >
                <div>
                  <span className="font-medium">{item.product_name}</span>
                  {item.variant_name && (
                    <span className="text-gray-600"> - {item.variant_name}</span>
                  )}
                  <span className="text-gray-500 text-xs ml-2">({item.sku})</span>
                </div>
                <span className="font-semibold text-yellow-600">
                  Còn {item.quantity}
                </span>
              </div>
            ))}
            {warningItems.length > 5 && (
              <p className="text-xs text-yellow-600 text-center mt-2">
                và {warningItems.length - 5} sản phẩm khác...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}