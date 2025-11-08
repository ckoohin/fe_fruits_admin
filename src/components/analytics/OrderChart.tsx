'use client';

import React from 'react';

interface OrderChartProps {
  data: Array<{ date: string; value: number }>;
}

export function OrderChart({ data }: OrderChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Không có dữ liệu đơn hàng</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  return (
    <div className="h-64 flex items-end justify-between space-x-1">
      {data.map((item, index) => {
        const height = range > 0 ? ((item.value - minValue) / range) * 200 + 20 : 50;
        
        return (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t w-full transition-all duration-500 hover:from-blue-600 hover:to-blue-500 cursor-pointer"
              style={{ height: `${height}px` }}
              title={`${new Date(item.date).toLocaleDateString('vi-VN')}: ${item.value} đơn hàng`}
            />
            <div className="mt-2 text-xs text-gray-500 text-center">
              {new Date(item.date).toLocaleDateString('vi-VN', { 
                day: '2-digit', 
                month: '2-digit' 
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
