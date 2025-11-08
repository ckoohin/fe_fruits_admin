'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  striped?: boolean;
  hover?: boolean;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, striped = false, hover = false, ...props }, ref) => (
    <div className="overflow-x-auto">
      <table
        ref={ref}
        className={cn(
          'min-w-full divide-y divide-gray-200',
          striped && 'bg-white',
          className
        )}
        {...props}
      />
    </div>
  )
);

Table.displayName = 'Table';

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn('bg-gray-50', className)}
      {...props}
    />
  )
);

TableHeader.displayName = 'TableHeader';

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  striped?: boolean;
  hover?: boolean;
}

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, striped = false, hover = false, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn(
        'bg-white divide-y divide-gray-200',
        striped && 'even:bg-gray-50',
        className
      )}
      {...props}
    />
  )
);

TableBody.displayName = 'TableBody';

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  hover?: boolean;
  selected?: boolean;
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, hover = false, selected = false, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        hover && 'hover:bg-gray-50',
        selected && 'bg-blue-50',
        className
      )}
      {...props}
    />
  )
);

TableRow.displayName = 'TableRow';

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, sortable = false, sortDirection, onSort, children, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider',
        sortable && 'cursor-pointer hover:bg-gray-100 select-none',
        className
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className="flex items-left space-x-1">
        <span>{children}</span>
        {sortable && (
          <span className="text-gray-400">
            {sortDirection === 'asc' ? '↑' : sortDirection === 'desc' ? '↓' : '↕'}
          </span>
        )}
      </div>
    </th>
  )
);

TableHead.displayName = 'TableHead';

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn('px-3 py-3 whitespace-nowrap text-sm text-gray-900', className)}
      {...props}
    />
  )
);

TableCell.displayName = 'TableCell';

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
};
