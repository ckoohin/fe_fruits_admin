'use client';
import React, { useState, useEffect } from 'react';

interface Column {
  key: string;        
  label: string;       
  render?: (value: any, row: any) => React.ReactNode; 
  sortable?: boolean;   
  width?: string;      
  className?: string;
  headerClassName?: string;
}

interface CustomTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  loading?: boolean;
  searchable?: boolean;
  actionable?: boolean;
  title?: string;
  emptyText?: string;
  className?: string;
}

const CustomTable: React.FC<CustomTableProps> = ({ 
  columns, 
  data = [],
  onRowClick,
  onEdit,
  onDelete,
  loading = false,
  searchable = true,
  actionable = true,
  title,
  emptyText = "Không có dữ liệu",
  className = ""
}) => {
  const [filteredData, setFilteredData] = useState<any[]>(data);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);

  useEffect(() => {
    let result = [...data];
    
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      result = result.filter((item) =>
        columns.some((col) => {
          const value = item[col.key];
          return value?.toString().toLowerCase().includes(lowercasedTerm);
        })
      );
    }
    
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredData(result);
  }, [data, searchTerm, sortConfig, columns]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return (
        <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      );
    }
    
    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 ml-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 ml-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="grid grid-cols-4 gap-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {(title || searchable) && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {title && (
              <div>
                <h3 className="text-sm font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredData.length} {filteredData.length === 1 ? 'mục' : 'mục'}
                </p>
              </div>
            )}
            
            {searchable && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider ${
                    column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
                  } ${column.headerClassName || 'text-left'}`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center justify-center">
                    {column.label}
                    {column.sortable !== false && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
              {actionable && (onEdit || onDelete) && (
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((row, rowIndex) => (
              <tr
                key={row.id !== undefined && row.id !== null ? String(row.id) : `row-${rowIndex}`}
                className={`transition-colors ${
                  rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } ${onRowClick ? 'cursor-pointer hover:bg-gray-100' : 'hover:bg-gray-100'}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => (
                  <td 
                    key={column.key} 
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.className || ''}`}
                  >
                    {column.render 
                      ? column.render(row[column.key], row)
                      : (row[column.key] ?? 'N/A')
                    }
                  </td>
                ))}
                {actionable && (onEdit || onDelete) && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      {onEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(row);
                          }}
                          className="text-blue-600 hover:text-blue-900 font-medium transition-colors"
                        >
                          Sửa
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(row);
                          }}
                          className="text-red-600 hover:text-red-900 font-medium transition-colors"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? 'Không tìm thấy kết quả' : emptyText}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? `Không có dữ liệu phù hợp với "${searchTerm}"` 
                : 'Chưa có dữ liệu để hiển thị'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomTable;