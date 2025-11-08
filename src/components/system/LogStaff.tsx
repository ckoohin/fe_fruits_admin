'use client';
import React from 'react';
import CustomTable from '@/components/ui/CustomTable';
import { Log } from '@/types/log';

interface LogHeaderProps {
  onRefresh: () => void;
}

export function LogHeader({ onRefresh }: LogHeaderProps) {
  return (
    <div className="p-5 border-b border-gray-200 bg-white flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Nhật ký hoạt động</h2>
        <p className="text-sm text-gray-500 mt-0.5">Theo dõi các thao tác của người dùng trong hệ thống</p>
      </div>
      <button
        onClick={onRefresh}
        className="flex items-center gap-2 px-4 py-2.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-medium shadow-sm hover:shadow"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M4 9a9 9 0 0114.063-3.962L20 8M20 20v-5h-.581M20 15a9 9 0 01-14.063 3.962L4 16" />
        </svg>
        Làm mới
      </button>
    </div>
  );
}

interface LogTableProps {
  logs: Log[];
  loading: boolean;
}

export function LogTable({ logs, loading }: LogTableProps) {
  const columns = [
    { key: 'id', label: 'ID', width: '60px', className: 'text-center' },
    { key: 'user_name', label: 'NGƯỜI DÙNG', className: 'font-medium text-gray-900' },
    { key: 'user_email', label: 'EMAIL', render: (v: string) => <a href={`mailto:${v}`} className="text-blue-600 hover:underline text-sm">{v}</a> },
    { key: 'action', label: 'HÀNH ĐỘNG', className: 'text-left uppercase text-xs text-gray-600' },
    { key: 'details', label: 'CHI TIẾT', className: 'text-left text-sm text-gray-700' },
    { key: 'ip', label: 'IP', width: '100px', className: 'text-center text-sm text-gray-500' },
    { 
      key: 'created_at', 
      label: 'THỜI GIAN', 
      render: (v: string) => new Date(v).toLocaleString('vi-VN'),
      className: 'text-center text-sm text-gray-600'
    }
  ];

  return (
    <CustomTable
      columns={columns}
      data={logs}
      loading={loading}
      searchable={false}
      actionable={false}
      emptyText="Chưa có log nào"
    />
  );
}