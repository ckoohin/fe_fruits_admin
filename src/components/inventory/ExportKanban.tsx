'use client';
import React, { useState } from 'react';
import { Export, ExportStatus, type KanbanColumn } from '@/types/export';
import { KANBAN_COLUMNS } from '@/hooks/useExport';

interface ExportKanbanBoardProps {
  exports: Export[];
  loading: boolean;
  onCardClick: (exportItem: Export) => void;
  getExportsByStatus: (status: ExportStatus) => Export[];
}

export default function ExportKanbanBoard({
  exports,
  loading,
  onCardClick,
  getExportsByStatus,
}: ExportKanbanBoardProps) {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null); // Tháng (1-12) hoặc null để không lọc
  const [selectedYear, setSelectedYear] = useState<number | null>(null); // Năm hoặc null để không lọc

  // Lọc exports theo tháng và năm
  const filterExportsByDate = (exports: Export[]) => {
    if (!selectedMonth && !selectedYear) return exports;

    return exports.filter((exp) => {
      // Kiểm tra null hoặc undefined trước khi tạo Date
      if (!exp.requested_at) return false;
      const exportDate = new Date(exp.requested_at);
      if (isNaN(exportDate.getTime())) return false; // Bỏ qua nếu ngày không hợp lệ
      const monthMatch = !selectedMonth || exportDate.getMonth() + 1 === selectedMonth;
      const yearMatch = !selectedYear || exportDate.getFullYear() === selectedYear;
      return monthMatch && yearMatch;
    });
  };

  const filteredExports = filterExportsByDate(exports);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-4">
      {/* Bộ lọc theo tháng và năm */}
      <div className="mb-4 flex gap-4">
        <select
          value={selectedMonth || ''}
          onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : null)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Tất cả các tháng</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              Tháng {i + 1}
            </option>
          ))}
        </select>
        <select
          value={selectedYear || ''}
          onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Tất cả các năm</option>
          {Array.from({ length: 5 }, (_, i) => {
            const year = new Date().getFullYear() - i;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {KANBAN_COLUMNS.map((column) => {
          let columnExports = filteredExports.filter((exp) => {
            if (column.id === 'branch_pending') {
              return exp.status === 'branch_pending' && exp.type === 3;
            } else if (column.id === 'warehouse_pending') {
              return exp.status === 'warehouse_pending' && exp.type === 3;
            } else if (column.id === 'processing') {
              return exp.status === 'processing' && exp.type === 3;
            } else if (column.id === 'shipped') {
              return exp.status === 'shipped' && exp.type === 3;
            } else if (column.id === 'completed') {
              return exp.status === 'completed' && exp.type === 3;
            } else if (column.id === 'cancelled') {
              return exp.status === 'cancelled' && exp.type === 3;
            }
            return false; // Trường hợp không khớp
          });

          return (
            <KanbanColumn
              key={column.id}
              column={column}
              exports={columnExports}
              onCardClick={onCardClick}
            />
          );
        })}
      </div>
    </div>
  );
}

interface KanbanColumnProps {
  column: KanbanColumn;
  exports: Export[];
  onCardClick: (exportItem: Export) => void;
}

function KanbanColumn({ column, exports, onCardClick }: KanbanColumnProps) {
  const getColumnStyle = (id: string) => {
    const styles: Record<string, { headerBg: string; headerText: string; badgeBg: string; cardAccent: string }> = {
      branch_pending: {
        headerBg: 'bg-yellow-500',
        headerText: 'text-white',
        badgeBg: 'bg-white/20',
        cardAccent: 'border-l-yellow-400'
      },
      warehouse_pending: {
        headerBg: 'bg-orange-500',
        headerText: 'text-white',
        badgeBg: 'bg-white/20',
        cardAccent: 'border-l-orange-400'
      },
      processing: {
        headerBg: 'bg-blue-500',
        headerText: 'text-white',
        badgeBg: 'bg-white/20',
        cardAccent: 'border-l-blue-400'
      },
      shipped: {
        headerBg: 'bg-green-500',
        headerText: 'text-white',
        badgeBg: 'bg-white/20',
        cardAccent: 'border-l-green-400'
      },
      completed: {
        headerBg: 'bg-emerald-500',
        headerText: 'text-white',
        badgeBg: 'bg-white/20',
        cardAccent: 'border-l-emerald-400'
      },
      cancelled: {
        headerBg: 'bg-gray-400',
        headerText: 'text-white',
        badgeBg: 'bg-white/20',
        cardAccent: 'border-l-gray-400'
      }
    };
    return styles[id] || styles.branch_pending;
  };

  const style = getColumnStyle(column.id);

  return (
    <div className="flex flex-col h-full">
      <div className={`${style.headerBg} rounded-t-lg px-3 py-2.5`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold ${style.headerText} text-sm`}>
            {column.title}
          </h3>
          <span className={`${style.badgeBg} ${style.headerText} px-2 py-0.5 rounded-full text-xs font-bold`}>
            {exports.length}
          </span>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-b-lg p-2 flex-1 overflow-y-auto min-h-[500px] max-h-[calc(100vh-250px)] space-y-2">
        {exports.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-400 text-xs">
            Không có phiếu nào
          </div>
        ) : (
          exports.map((exportItem) => (
            <ExportCard
              key={exportItem.id}
              exportItem={exportItem}
              onClick={() => onCardClick(exportItem)}
              cardAccent={style.cardAccent}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface ExportCardProps {
  exportItem: Export;
  onClick: () => void;
  cardAccent: string;
}

function ExportCard({ exportItem, onClick, cardAccent }: ExportCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getTypeLabel = (type: number) => {
    const labels: Record<number, string> = {
      1: '🛒 Bán hàng',
      2: '❌ Hủy hàng',
      3: '📦 Chuyển kho'
    };
    return labels[type] || 'Không xác định';
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 ${cardAccent} hover:scale-[1.02]`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-sm text-gray-900 mb-0.5">
            {exportItem.export_code}
          </h4>
          <p className="text-xs text-gray-500">
            {formatDate(exportItem.requested_at)}
          </p>
        </div>
        <span className="text-xs text-gray-400">#{exportItem.id}</span>
      </div>

      <div className="flex items-center gap-1 mb-2 text-xs font-medium text-gray-700 bg-gray-50 px-2 py-1 rounded">
        {getTypeLabel(exportItem.type)}
      </div>

      {exportItem.from_branch_name && (
        <div className="flex items-center gap-1 mb-2 text-xs text-gray-600">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="truncate">{exportItem.from_branch_name}</span>
        </div>
      )}

      {exportItem.to_branch_name && (
        <div className="flex items-center gap-1 mb-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          <span className="truncate font-medium">{exportItem.to_branch_name}</span>
        </div>
      )}

      <div className="bg-emerald-50 rounded px-2 py-1.5 mb-2">
        <p className="text-xs text-gray-600 mb-0.5">Tổng số lượng:</p>
        <p className="font-bold text-sm text-emerald-700">
          {exportItem.total_quantity} sản phẩm
        </p>
      </div>

      {exportItem.notes && (
        <p className="text-xs text-gray-600 line-clamp-2 mb-2 italic bg-blue-50 p-1.5 rounded">
          "{exportItem.notes}"
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
        <span className="truncate">{exportItem.requested_by_name || 'N/A'}</span>
        {exportItem.details && (
          <span className="font-medium text-emerald-600 ml-2">
            {exportItem.details.length} SP
          </span>
        )}
      </div>
    </div>
  );
}