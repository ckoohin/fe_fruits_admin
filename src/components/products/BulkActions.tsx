'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface BulkActionsProps {
  selectedIds: string[];
  onAction: (action: string) => void;
  onClearSelection: () => void;
}

export default function BulkActions({ selectedIds, onAction, onClearSelection }: BulkActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (selectedIds.length === 0) return null;

  const actions = [
    { value: 'delete', label: 'Xóa', color: 'text-red-600 hover:bg-red-50' },
    { value: 'activate', label: 'Kích hoạt', color: 'text-green-600 hover:bg-green-50' },
    { value: 'deactivate', label: 'Vô hiệu hóa', color: 'text-gray-600 hover:bg-gray-50' },
    { value: 'export', label: 'Xuất Excel', color: 'text-blue-600 hover:bg-blue-50' },
  ];

  return (
    <div className="flex items-center gap-4 p-4 bg-blue-50 border-b border-blue-100">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={true}
          onChange={onClearSelection}
          className="w-4 h-4 rounded border-gray-300"
        />
        <span className="text-sm font-medium text-gray-900">
          Đã chọn {selectedIds.length} sản phẩm
        </span>
      </div>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <span className="text-sm font-medium">Thao tác</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
              {actions.map((action) => (
                <button
                  key={action.value}
                  onClick={() => {
                    onAction(action.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm ${action.color} first:rounded-t-lg last:rounded-b-lg`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <button
        onClick={onClearSelection}
        className="text-sm text-gray-600 hover:text-gray-900"
      >
        Bỏ chọn
      </button>
    </div>
  );
}