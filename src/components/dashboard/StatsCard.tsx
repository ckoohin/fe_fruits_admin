'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ReactNode; 
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
  isCurrency?: boolean;
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  icon, 
  color, 
  isCurrency = false 
}: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500'
  };

  const formatValue = (val: number | string) => {
    if (typeof val === 'number') {
      if (isCurrency) {
        return val.toLocaleString('vi-VN') + ' ₫';
      }
      return val.toLocaleString('vi-VN');
    }
    return val;
  };

  return (
    <div className="bg-white overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1 text-left">
            <dd className="text-lg sm:text-xl font-bold text-gray-900">
              {formatValue(value)}
            </dd>
            <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate uppercase">
              {title}
            </dt>
            {change !== undefined && (
              <div className={cn(
                'mt-1 px-2 py-1 rounded-full text-sm font-semibold text-green-800 bg-green-100'
              )}>
                {change >= 0 ? '+' : ''}{change.toFixed(1)}% so với tháng trước
              </div>
            )}
          </div>
          <div className="flex-shrink-0 ml-2 sm:ml-3">
            <div className={cn(
              'w-8 sm:w-10 h-8 sm:h-10 rounded-md flex items-center justify-center',
              colorClasses[color]
            )}>
              {icon}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}