'use client';

import React, { useState } from 'react';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onChange: (startDate: Date, endDate: Date) => void;
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = new Date(e.target.value);
    setLocalStartDate(newStartDate);
    onChange(newStartDate, localEndDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = new Date(e.target.value);
    setLocalEndDate(newEndDate);
    onChange(localStartDate, newEndDate);
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const setPresetRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    setLocalStartDate(start);
    setLocalEndDate(end);
    onChange(start, end);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">Từ ngày:</label>
        <input
          type="date"
          value={formatDate(localStartDate)}
          onChange={handleStartDateChange}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">Đến ngày:</label>
        <input
          type="date"
          value={formatDate(localEndDate)}
          onChange={handleEndDateChange}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Nhanh:</span>
        <div className="flex space-x-1">
          <button
            onClick={() => setPresetRange(7)}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            7 ngày
          </button>
          <button
            onClick={() => setPresetRange(30)}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            30 ngày
          </button>
          <button
            onClick={() => setPresetRange(90)}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            3 tháng
          </button>
        </div>
      </div>
    </div>
  );
}
