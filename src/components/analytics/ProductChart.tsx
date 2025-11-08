'use client';

import React from 'react';

interface ProductData {
  name: string;
  quantity: number;
  revenue: number;
}

interface ProductChartProps {
  data: ProductData[];
}

export function ProductChart({ data }: ProductChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Không có dữ liệu sản phẩm</p>
      </div>
    );
  }

  const maxQuantity = Math.max(...data.map(d => d.quantity));

  return (
    <div className="space-y-4">
      {data.map((product, index) => (
        <div key={index} className="flex items-center space-x-4">
          <div className="flex-shrink-0 w-20">
            <p className="text-sm font-medium text-gray-900 truncate">
              {product.name}
            </p>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">{product.quantity} sản phẩm</span>
              <span className="font-medium text-gray-900">
                {product.revenue.toLocaleString('vi-VN')} ₫
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500" 
                style={{ 
                  width: `${Math.min((product.quantity / maxQuantity) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
