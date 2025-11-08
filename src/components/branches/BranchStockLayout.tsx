'use client';
import React, { useRef } from 'react';
import CustomTable from '@/components/ui/CustomTable';
import { BranchStock } from '@/types/inventory';

// BranchStockHeader Component
interface BranchStockHeaderProps {
  totalCount: number;
  filteredCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExport: () => void;
  xlsxLoaded: boolean;
  branchName: string;
}

export default function BranchStockHeader({
  totalCount,
  filteredCount,
  searchQuery,
  onSearchChange,
  onExport,
  xlsxLoaded,
  branchName
}: BranchStockHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="p-5 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Tồn Kho Chi Nhánh - {branchName}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {searchQuery ? (
              <>Tìm thấy {filteredCount} / {totalCount} sản phẩm</>
            ) : (
              <>Tổng: {totalCount} sản phẩm</>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, SKU..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-80 transition-all"
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

          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" />

          <button
            onClick={onExport}
            disabled={!xlsxLoaded || filteredCount === 0}
            className="flex items-center gap-2 px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-sm hover:shadow disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// BranchStockTable Component (Không thay đổi)
interface BranchStockTableProps {
  branchStock: BranchStock[];
  loading: boolean;
}

export function BranchStockTable({ branchStock, loading }: BranchStockTableProps) {
  const columns = [
    { key: 'variant_id', label: 'ID', width: '60px', sortable: true, className: 'text-center' },
    { key: 'sku', label: 'SKU', width: '120px', sortable: true, className: 'text-center' },
    { key: 'product_name', label: 'TÊN SẢN PHẨM', sortable: true, className: 'text-center' },
    { key: 'variant_name', label: 'BIẾN THỂ', sortable: true, className: 'text-center' },
    {
      key: 'quantity',
      label: 'SỐ LƯỢNG',
      width: '80px',
      sortable: true,
      render: (value: number) => <span className="font-medium text-gray-900">{value}</span>,
      className: 'text-center'
    }
  ];

  return <CustomTable columns={columns} data={branchStock} loading={loading} searchable={false} actionable={false} emptyText="Chưa có sản phẩm nào" />;
}