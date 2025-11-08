'use client';

import React from 'react';

interface RevenueChartProps {
  data: Array<{ date: string; value: number }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Không có dữ liệu doanh thu</p>
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
              className="bg-gradient-to-t from-green-500 to-green-400 rounded-t w-full transition-all duration-500 hover:from-green-600 hover:to-green-500 cursor-pointer"
              style={{ height: `${height}px` }}
              title={`${new Date(item.date).toLocaleDateString('vi-VN')}: ${item.value.toLocaleString('vi-VN')} ₫`}
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
