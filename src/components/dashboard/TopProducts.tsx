'use client';

import React from 'react';
import Link from 'next/link';

interface TopProduct {
  id: number;
  name: string;
  quantity_sold: number;
  revenue: number;
  image?: string;
}

interface TopProductsProps {
  products?: TopProduct[];
}

export function TopProducts({ products = [] }: TopProductsProps) {
  // Mock data if no products provided
  const mockProducts: TopProduct[] = products.length > 0 ? products : [
    {
      id: 1,
      name: 'Táo đỏ Fuji',
      quantity_sold: 150,
      revenue: 3750000,
      image: '/images/apple.jpg'
    },
    {
      id: 2,
      name: 'Chuối tiêu',
      quantity_sold: 200,
      revenue: 2400000,
      image: '/images/banana.jpg'
    },
    {
      id: 3,
      name: 'Cam sành',
      quantity_sold: 120,
      revenue: 3600000,
      image: '/images/orange.jpg'
    },
    {
      id: 4,
      name: 'Nho xanh',
      quantity_sold: 80,
      revenue: 3200000,
      image: '/images/grape.jpg'
    },
    {
      id: 5,
      name: 'Dâu tây',
      quantity_sold: 60,
      revenue: 3000000,
      image: '/images/strawberry.jpg'
    }
  ];

  return (
    <div className="space-y-4">
      {mockProducts.map((product, index) => (
        <div key={product.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">#{index + 1}</span>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{product.name}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{product.quantity_sold} sản phẩm</span>
              <span>•</span>
              <span>{product.revenue.toLocaleString('vi-VN')} ₫</span>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ 
                  width: `${Math.min((product.quantity_sold / 200) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        </div>
      ))}
      
      <div className="text-center pt-4">
        <Link href="/admin/products">
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Xem tất cả sản phẩm →
          </button>
        </Link>
      </div>
    </div>
  );
}
