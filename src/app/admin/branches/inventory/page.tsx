'use client';
import React from 'react';
import BranchStockHeader, { BranchStockTable } from '@/components/branches/BranchStockLayout';
import { useBranchStock } from '@/hooks/useBranchStock';
import { BranchStock } from '@/types/inventory';

export default function BranchStockPage() {
  const {
    branchStock,
    branchName,
    loading,
    currentPage,
    searchQuery,
    filteredBranchStock,
    currentBranchStock,
    totalPages,
    itemsPerPage,
    userBranchId,
    setSearchQuery,
    setCurrentPage,
    handleExportExcel
  } = useBranchStock();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <BranchStockHeader
          totalCount={branchStock.length}
          filteredCount={filteredBranchStock.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onExport={handleExportExcel}
          xlsxLoaded={typeof window !== 'undefined' && !!window.XLSX}
          branchName={branchName}
        />

        <BranchStockTable
          branchStock={currentBranchStock}
          loading={loading}
        />

        <div className="p-4 flex justify-between items-center border-t border-gray-200 bg-gray-50">
          <span className="text-sm text-gray-600 font-medium">
            {searchQuery ? (
              <>Tìm thấy {filteredBranchStock.length} / {branchStock.length} sản phẩm</>
            ) : (
              <>Tổng: {branchStock.length} sản phẩm</>
            )}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                  className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${
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
              className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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