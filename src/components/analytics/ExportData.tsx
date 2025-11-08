'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Download } from 'lucide-react';

interface ExportDataProps {
  onExport: (format: 'excel' | 'csv' | 'pdf') => void;
}

export function ExportData({ onExport }: ExportDataProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleExport = async (format: 'excel' | 'csv' | 'pdf') => {
    try {
      setIsExporting(true);
      await onExport(format);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isExporting}
        className="flex items-center space-x-2"
      >
        <Download className="h-4 w-4" />
        <span>{isExporting ? 'Đang xuất...' : 'Xuất dữ liệu'}</span>
      </Button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            <button
              onClick={() => handleExport('excel')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <span className="mr-2">📊</span>
              Xuất Excel (.xlsx)
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <span className="mr-2">📄</span>
              Xuất CSV (.csv)
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <span className="mr-2">📋</span>
              Xuất PDF (.pdf)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
