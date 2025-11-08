// src/components/PageLayout/customers/CustomerHeader.tsx (Cập nhật)
'use client';
import React, { useRef } from 'react';
import CustomTable from '@/components/ui/CustomTable';
import { Customer } from '@/types/customer';

// Thay đổi interface: Bỏ onAdd
interface CustomerHeaderProps {
  totalCount: number;
  filteredCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  onRefresh: () => void; // Thêm hàm làm mới (Refetch)
  xlsxLoaded: boolean;
}

export default function CustomerHeader({
  totalCount,
  filteredCount,
  searchQuery,
  onSearchChange,
  onImport,
  onExport,
  onRefresh, // Sử dụng hàm làm mới
  xlsxLoaded
}: CustomerHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

return (
    <div className="p-5 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Danh sách khách hàng</h2>
          {/* <p className="text-sm text-gray-500 mt-0.5">
            {searchQuery ? (
              <>Tìm thấy {filteredCount} / {totalCount} nhà cung cấp</>
            ) : (
              <>Tổng: {totalCount} nhà cung cấp</>
            )}
          </p> */}
        </div>
        
        <div className="flex items-center gap-3">
      
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, mã, email, SĐT..."
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
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={onImport} className="hidden" />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!xlsxLoaded}
            className="flex items-center gap-2 px-4 py-2.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium shadow-sm hover:shadow disabled:opacity-50"
            title="Import khách hàng từ Excel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Import</span>
          </button>

          <button
            onClick={onExport}
            disabled={!xlsxLoaded || filteredCount === 0}
            className="flex items-center gap-2 px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-sm hover:shadow disabled:opacity-50"
            title="Export khách hàng ra Excel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            <span>Export</span>
          </button>

          <div className="h-9 w-px bg-gray-300"></div>

          {/* <button
            onClick={onAdd}
            className="flex items-center gap-2 px-5 py-2.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-medium shadow-sm hover:shadow"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Thêm NCC</span>
          </button> */}
        </div>
      </div>
    </div>
  );
}

// --- CUSTOMER TABLE COMPONENT ---
interface CustomerTableProps {
  customers: Customer[];
  loading: boolean;
  // Bỏ onEdit và onDelete
}

export function CustomerTable({ customers, loading }: CustomerTableProps) {
  // Bỏ hành động onEdit và onDelete khỏi Columns
  const columns = [
    { 
      key: 'id', 
      label: 'ID', 
      width: '60px',
      sortable: true,
      className: 'text-center'
    },
    { 
      key: 'name', 
      label: 'TÊN KHÁCH HÀNG',
      sortable: true,
      className: 'text-left font-medium'
    },
    { 
      key: 'email', 
      label: 'EMAIL',
      width: '200px',
      sortable: true,
      render: (value: string | null) => (
        value ? (
          <a href={`mailto:${value}`} className="text-blue-600 hover:text-blue-800 hover:underline text-sm truncate block max-w-[200px]" title={value}>
            {value}
          </a>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        )
      ),
      className: 'text-left'
    },
    { 
      key: 'phone', 
      label: 'SỐ ĐIỆN THOẠI',
      width: '120px',
      sortable: true,
      render: (value: string | null) => (
        value ? (
          <a href={`tel:${value}`} className="text-blue-600 hover:text-blue-800 hover:underline text-sm">
            {value}
          </a>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        )
      ),
      className: 'text-center'
    },
    { 
      key: 'address', 
      label: 'ĐỊA CHỈ',
      sortable: false,
      render: (value: string | null) => (
        <span className="text-gray-600 text-sm truncate block max-w-[200px]" title={value || ''}>
          {value || '-'}
        </span>
      ),
      className: 'text-left'
    },
    {
      key: 'order_count',
      label: 'SỐ ĐƠN',
      width: '80px',
      sortable: true,
      className: 'text-center'
    },
    {
      key: 'total_spent',
      label: 'TỔNG CHI TIÊU',
      width: '120px',
      sortable: true,
      render: (value: string) => Number(value).toLocaleString('vi-VN') + 'đ',
      className: 'text-right font-semibold text-emerald-600'
    },
  ];

  return (
    <CustomTable
      columns={columns}
      data={customers}
      loading={loading}
      searchable={false}
      actionable={false} // Quan trọng: Tắt cột hành động
      emptyText="Chưa có khách hàng nào"
    />
  );
}