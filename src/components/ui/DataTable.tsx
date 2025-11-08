'use client';

import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './Table';
import { Pagination } from '@/components/common/Pagination';

interface Column {
  key: string;
  label: string;
  render?: (item: any) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  loading?: boolean;
  className?: string;
}

export function DataTable({
  data,
  columns,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  loading = false,
  className = ''
}: DataTableProps) {
  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} sortable={column.sortable}>
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index} hover>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.render ? column.render(item) : item[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && onPageChange && (
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
