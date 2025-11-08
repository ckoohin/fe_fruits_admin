'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  delay?: number;
  className?: string;
}

export function SearchInput({ 
  placeholder = 'Tìm kiếm...', 
  onSearch, 
  delay = 300,
  className = ''
}: SearchInputProps) {
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchValue);
    }, delay);

    return () => clearTimeout(timer);
  }, [searchValue, onSearch, delay]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        value={searchValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}
