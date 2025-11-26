'use client';

import React from 'react';
import { useLogs } from '@/hooks/useLog';
import { LogHeader, LogTable } from '@/components/system/LogStaff';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
} from 'lucide-react';

export default function LogsPage() {
  const {
    logs,
    loading,
    currentPage,
    totalPages,
    totalItems,
    fetchLogs,
    setCurrentPage,
  } = useLogs();

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="container mx-auto space-y-6 py-6">
      <Card className="border shadow-sm">

        <CardContent className="p-0">
          <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4">
            <LogHeader onRefresh={() => fetchLogs(currentPage)} />
          </div>

          <div className="min-h-[500px]">
            <LogTable logs={logs} loading={loading} />
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600 font-medium">
                Trang <span className="font-bold text-gray-900">{currentPage}</span> /{' '}
                <span className="font-bold text-gray-900">{totalPages}</span>
                {totalItems !== undefined && (
                  <> • Tổng <span className="font-bold">{totalItems}</span> bản ghi</>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-9 h-9"
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(1)}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-9 h-9"
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {(() => {
                  const pages = [];
                  const start = Math.max(1, currentPage - 2);
                  const end = Math.min(totalPages, currentPage + 2);

                  if (start > 1) {
                    pages.push(1);
                    if (start > 2) pages.push('...');
                  }

                  for (let i = start; i <= end; i++) {
                    pages.push(i);
                  }

                  if (end < totalPages) {
                    if (end < totalPages - 1) pages.push('...');
                    pages.push(totalPages);
                  }

                  return pages.map((page, idx) =>
                    page === '...' ? (
                      <span key={idx} className="px-3 py-2 text-gray-500">
                        ...
                      </span>
                    ) : (
                      <Button
                        key={page}
                        variant={currentPage === page ? "secondary" : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(page as number)}
                        className={
                          currentPage === page
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : ''
                        }
                      >
                        {page}
                      </Button>
                    )
                  );
                })()}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-9 h-9"
                  disabled={currentPage >= totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-9 h-9"
                  disabled={currentPage >= totalPages}
                  onClick={() => handlePageChange(totalPages)}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}