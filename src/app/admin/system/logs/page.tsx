'use client';
import React from 'react';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { useLogs } from '@/hooks/useLog';
import { LogHeader, LogTable } from '@/components/system/LogStaff';

export default function LogsPage() {
  const { logs, loading, fetchLogs, currentPage, totalPages, setCurrentPage } = useLogs();
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <LogHeader onRefresh={() => fetchLogs(currentPage)} />
        <LogTable logs={logs} loading={loading} />

        <div className="p-4 flex justify-between items-center border-t border-gray-200 bg-gray-50">
          <span className="text-sm text-gray-600 font-medium">
            Trang {currentPage} / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => { setCurrentPage(currentPage - 1); fetchLogs(currentPage - 1); }}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-100"
            >
              Trước
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => { setCurrentPage(currentPage + 1); fetchLogs(currentPage + 1); }}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-100"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}