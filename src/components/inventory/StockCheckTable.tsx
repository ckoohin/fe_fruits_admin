'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import CustomTable from '@/components/ui/CustomTable';
import { StockCheck } from '@/types/inventory';

interface StockCheckTableProps {
  stockChecks: StockCheck[];
  loading: boolean;
  onComplete: (check: StockCheck) => void;
  onCancel: (check: StockCheck) => void;
}

export function StockCheckTable({ stockChecks, loading, onComplete, onCancel }: StockCheckTableProps) {
  const router = useRouter();

  const columns = [
    { 
      key: 'id', 
      label: 'MÃ PHIẾU', 
      width: '100px',
      sortable: true,
      render: (value: number) => <code className="text-xs bg-gray-100 px-2 py-1 rounded">#{value}</code>,
      className: 'text-center'
    },
    {
      key: 'check_date',
      label: 'NGÀY KIỂM',
      width: '150px',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      className: 'text-center'
    },
    { 
      key: 'branch_name', 
      label: 'CHI NHÁNH',
      width: '200px',
      sortable: true,
      className: 'text-left'
    },
    { 
      key: 'user_name', 
      label: 'NGƯỜI KIỂM',
      width: '150px',
      sortable: true,
      className: 'text-center'
    },
    { 
      key: 'notes', 
      label: 'GHI CHÚ',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-700 line-clamp-2" title={value}>
          {value || '-'}
        </span>
      ),
      className: 'text-left'
    },
    {
      key: 'status',
      label: 'TRẠNG THÁI',
      width: '130px',
      sortable: true,
      render: (value: string) => {
        const statusMap: { [key: string]: { label: string; color: string } } = {
          'pending': { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
          'in_progress': { label: 'Đang kiểm', color: 'bg-blue-100 text-blue-800' },
          'completed': { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
          'cancelled': { label: 'Đã hủy', color: 'bg-gray-100 text-gray-800' }
        };
        const status = statusMap[value] || { label: value, color: 'bg-gray-100 text-gray-800' };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
            {status.label}
          </span>
        );
      },
      className: 'text-center'
    },
    {
      key: 'actions',
      label: 'THAO TÁC',
      width: '180px',
      sortable: false,
      render: (_value: any, row: StockCheck) => (
        <div className="flex justify-center space-x-2">
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              router.push(`/admin/inventory/check/${row.id}`);
            }}
            className="text-blue-600 hover:text-blue-800 px-2 py-1 text-sm"
            title="Xem chi tiết"
          >
            Chi tiết
          </button>
          
          {row.status === 'in_progress' && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onComplete(row); }}
                className="text-green-600 hover:text-green-800 px-2 py-1 text-sm"
                title="Hoàn thành"
              >
                Hoàn thành
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onCancel(row); }}
                className="text-red-600 hover:text-red-800 px-2 py-1 text-sm"
                title="Hủy"
              >
                Hủy
              </button>
            </>
          )}
        </div>
      ),
      className: 'text-center'
    }
  ];

  return (
    <CustomTable
      columns={columns}
      data={stockChecks}
      loading={loading}
      searchable={false}
      actionable={false}
      emptyText="Chưa có phiếu kiểm kho nào"
      onRowClick={(row) => router.push(`/admin/inventory/check/${row.id}`)}
    />
  );
}
