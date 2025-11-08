'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

interface StockCheckHeaderProps {
  totalCount: number;
  filteredCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  branchName?: string;
}

export default function StockCheckHeader({
  totalCount,
  filteredCount,
  searchQuery,
  onSearchChange,
  branchName
}: StockCheckHeaderProps) {
  const router = useRouter();

  return (
    <div className="p-5 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Kiểm kho</h2>
          {branchName && (
            <p className="text-sm text-gray-500 mt-0.5">
              Chi nhánh: <span className="font-medium">{branchName}</span>
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm theo ghi chú, trạng thái..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-80"
            />
            <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button onClick={() => onSearchChange('')} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="h-9 w-px bg-gray-300"></div>

          <button
            onClick={() => router.push('/admin/inventory/check/create')}
            className="flex items-center gap-2 px-5 py-2.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Tạo phiếu kiểm kho</span>
          </button>
        </div>
      </div>
    </div>
  );
}