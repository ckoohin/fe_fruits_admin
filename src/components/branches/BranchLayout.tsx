'use client';
import React, { useRef } from 'react';
import CustomTable from '@/components/ui/CustomTable';
import { Branch } from '@/types/branch';

// BranchHeader Component
interface BranchHeaderProps {
  totalCount: number;
  filteredCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  onAdd: () => void;
  xlsxLoaded: boolean;
}

export default function BranchHeader({
  totalCount,
  filteredCount,
  searchQuery,
  onSearchChange,
  onImport,
  onExport,
  onAdd,
  xlsxLoaded
}: BranchHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="p-5 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Danh sách chi nhánh</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, địa chỉ..."
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
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Nhập excel</span>
          </button>

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

          <div className="h-9 w-px bg-gray-300"></div>

          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-5 py-2.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-medium shadow-sm hover:shadow"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Thêm Chi nhánh</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// BranchTable Component
interface BranchTableProps {
  branches: Branch[];
  loading: boolean;
  onEdit: (branch: Branch) => void;
  onDelete: (branch: Branch) => void;
}

export function BranchTable({ branches, loading, onEdit, onDelete }: BranchTableProps) {
  const columns = [
    { 
      key: 'id', 
      label: 'ID', 
      width: '80px', 
      sortable: true, 
      className: 'text-center' 
    },
    { 
      key: 'name', 
      label: 'TÊN CHI NHÁNH', 
      sortable: true, 
      className: 'text-center' 
    },
    { 
      key: 'address', 
      label: 'ĐỊA CHỈ', 
      sortable: true,
      className: 'text-center'
    },
    {
      key: 'is_active',
      label: 'TRẠNG THÁI',
      width: '120px',
      sortable: true,
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {value ? 'Hoạt động' : 'Tạm dừng'}
        </span>
      ),
      className: 'text-center'
    },
    {
      key: 'created_at',
      label: 'NGÀY TẠO',
      width: '120px',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('vi-VN'),
      className: 'text-center'
    },
    {
      key: 'actions',
      label: 'THAO TÁC',
      width: '120px',
      sortable: false,
      render: (_value: any, row: Branch) => (
        <div className="flex justify-center space-x-2">
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              onEdit(row); 
            }} 
            className="text-blue-600 hover:text-blue-800" 
            title="Sửa"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              onDelete(row); 
            }} 
            className="text-red-600 hover:text-red-800" 
            title="Xóa"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      ),
      className: 'text-center'
    }
  ];

  return (
    <CustomTable 
      columns={columns} 
      data={branches} 
      loading={loading} 
      searchable={false} 
      actionable={false} 
      emptyText="Chưa có chi nhánh nào" 
    />
  );
}