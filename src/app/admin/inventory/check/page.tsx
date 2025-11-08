'use client';
import React from 'react';
import StockCheckHeader from '@/components/inventory/StockCheckHeader';
import { StockCheckTable } from '@/components/inventory/StockCheckTable';
import { useStockChecks } from '@/hooks/useStockCheck';
import { StockCheck } from '@/types/inventory';

export default function StockChecksPage() {
  const {
    stockChecks,
    loading,
    currentPage,
    searchQuery,
    filteredStockChecks,
    currentStockChecks,
    totalPages,
    itemsPerPage,
    userBranchId,
    setSearchQuery,
    setCurrentPage,
    completeStockCheck,
    cancelStockCheck
  } = useStockChecks();

  const handleComplete = async (check: StockCheck) => {
    if (!confirm(`Hoàn thành phiếu kiểm #${check.id}? Tồn kho sẽ được cập nhật.`)) return;
    await completeStockCheck(check.id);
  };

  const handleCancel = async (check: StockCheck) => {
    await cancelStockCheck(check.id);
  };

  // Lấy tên chi nhánh từ phiếu đầu tiên (vì user chỉ thuộc 1 chi nhánh)
  const branchName = stockChecks.length > 0 ? stockChecks[0].branch_name : '';

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <StockCheckHeader
          totalCount={stockChecks.length}
          filteredCount={filteredStockChecks.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          branchName={branchName}
        />

        <StockCheckTable
          stockChecks={currentStockChecks}
          loading={loading}
          onComplete={handleComplete}
          onCancel={handleCancel}
        />

        {/* Pagination */}
        <div className="p-4 flex justify-between items-center border-t border-gray-200 bg-gray-50">
          <span className="text-sm text-gray-600 font-medium">
            {searchQuery ? (
              <>Tìm thấy {filteredStockChecks.length} / {stockChecks.length} phiếu</>
            ) : (
              <>Tổng: {stockChecks.length} phiếu kiểm kho</>
            )}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium ${
                    currentPage === page
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-white'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}