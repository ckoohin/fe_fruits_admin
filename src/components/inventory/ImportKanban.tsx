'use client';
import React, { useState } from 'react';
import { Import, ImportStatus, type KanbanColumn } from '@/types/import';
import { KANBAN_COLUMNS } from '@/hooks/useImport';

interface ImportKanbanBoardProps {
  imports: Import[];
  loading: boolean;
  onCardClick: (importItem: Import) => void;
  getImportsByStatus: (status: ImportStatus) => Import[];
}

export default function ImportKanbanBoard({
  imports,
  loading,
  onCardClick,
  getImportsByStatus,
}: ImportKanbanBoardProps) {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null); // Tháng (1-12) hoặc null để không lọc
  const [selectedYear, setSelectedYear] = useState<number | null>(null); // Năm hoặc null để không lọc

  // Lọc imports theo tháng và năm
  const filterImportsByDate = (imports: Import[]) => {
    if (!selectedMonth && !selectedYear) return imports;

    return imports.filter((imp) => {
      const importDate = new Date(imp.import_date);
      const monthMatch = !selectedMonth || importDate.getMonth() + 1 === selectedMonth;
      const yearMatch = !selectedYear || importDate.getFullYear() === selectedYear;
      return monthMatch && yearMatch;
    });
  };

  const filteredImports = filterImportsByDate(imports);

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
          let columnImports = filteredImports.filter((imp) => {
            if (column.id === 'paid') {
              return imp.payment_status === 'paid' && imp.status !== 'completed' && !imp.received_by;
            } else if (column.id === 'completed') {
              return imp.status === 'completed' || imp.received_by !== null;
            } else {
              return imp.status === column.id;
            }
          });

          return (
            <KanbanColumn
              key={column.id}
              column={column}
              imports={columnImports}
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
  imports: Import[];
  onCardClick: (importItem: Import) => void;
}

function KanbanColumn({ column, imports, onCardClick }: KanbanColumnProps) {
  const getColumnStyle = (id: string) => {
    const styles: Record<string, { headerBg: string; headerText: string; badgeBg: string; cardAccent: string }> = {
      requested: {
        headerBg: 'bg-orange-500',
        headerText: 'text-white',
        badgeBg: 'bg-white/20',
        cardAccent: 'border-l-orange-400'
      },
      approved: {
        headerBg: 'bg-blue-500',
        headerText: 'text-white',
        badgeBg: 'bg-white/20',
        cardAccent: 'border-l-blue-400'
      },
      paid: {
        headerBg: 'bg-purple-500',
        headerText: 'text-white',
        badgeBg: 'bg-white/20',
        cardAccent: 'border-l-purple-400'
      },
      completed: {
        headerBg: 'bg-emerald-500',
        headerText: 'text-white',
        badgeBg: 'bg-white/20',
        cardAccent: 'border-l-emerald-400'
      },
      rejected: {
        headerBg: 'bg-red-500',
        headerText: 'text-white',
        badgeBg: 'bg-white/20',
        cardAccent: 'border-l-red-400'
      },
      cancelled: {
        headerBg: 'bg-gray-400',
        headerText: 'text-white',
        badgeBg: 'bg-white/20',
        cardAccent: 'border-l-gray-400'
      }
    };
    return styles[id] || styles.requested;
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
            {imports.length}
          </span>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-b-lg p-2 flex-1 overflow-y-auto min-h-[500px] max-h-[calc(100vh-250px)] space-y-2">
        {imports.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-400 text-xs">
            Không có phiếu nào
          </div>
        ) : (
          imports.map((importItem) => (
            <ImportCard
              key={importItem.id}
              importItem={importItem}
              onClick={() => onCardClick(importItem)}
              cardAccent={style.cardAccent}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface ImportCardProps {
  importItem: Import;
  onClick: () => void;
  cardAccent: string;
}

function ImportCard({ importItem, onClick, cardAccent }: ImportCardProps) {
  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Number(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const calculateTemporaryTotal = () => {
    if (importItem.status !== 'requested' || !importItem.details) {
      return Number(importItem.total_amount);
    }
    return importItem.details.reduce((sum, detail) => {
      const price = Number(detail.import_price) || 0;
      return sum + (price * detail.import_quantity);
    }, 0);
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 ${cardAccent} hover:scale-[1.02]`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-sm text-gray-900 mb-0.5">
            {importItem.import_code}
          </h4>
          <p className="text-xs text-gray-500">
            {formatDate(importItem.import_date)}
          </p>
        </div>
        <span className="text-xs text-gray-400">#{importItem.id}</span>
      </div>

      {importItem.supplier_name && (
        <div className="flex items-center gap-1 mb-2 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="truncate font-medium">{importItem.supplier_name}</span>
        </div>
      )}

      <div className="bg-emerald-50 rounded px-2 py-1.5 mb-2">
        <p className="text-xs text-gray-600 mb-0.5">
          Tổng tiền{importItem.status === 'requested' ? ' (dự kiến)' : ''}
        </p>
        <p className="font-bold text-sm text-emerald-700">
          {formatCurrency(calculateTemporaryTotal())}
        </p>
      </div>

      {importItem.note && (
        <p className="text-xs text-gray-600 line-clamp-2 mb-2 italic bg-blue-50 p-1.5 rounded">
          "{importItem.note}"
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
        <span className="truncate">{importItem.requested_by || 'N/A'}</span>
        {importItem.details && (
          <span className="font-medium text-emerald-600 ml-2">
            {importItem.details.length} SP
          </span>
        )}
      </div>
    </div>
  );
}