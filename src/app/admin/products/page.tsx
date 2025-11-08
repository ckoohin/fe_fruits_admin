'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Download, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProductTable from '@/components/products/ProductTable';
import { adminApi } from '@/lib/adminApi';
import { Product, Category, ProductVariant, Unit } from '@/types/product';

export default function ProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const [loading, setLoading] = useState(false);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // === LOAD PRODUCTS ===
  const loadProducts = useCallback(async (params?: { page?: number; search?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getProducts({
        page: params?.page || 1,
        limit: 10,
        search: params?.search || ''
      });
      console.log("Data",response); 
      setProducts(response.data || []); 
      setCurrentPage(response.pagination?.currentPage || 1);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (err: any) {
      console.error('Load products error:', err);
      setError(err.message || 'Không thể tải danh sách sản phẩm');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // === LOAD CATEGORIES & UNITS ===
  const loadCategories = useCallback(async () => {
    try {
      const response = await adminApi.getCategories();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Load categories error:', err);
    }
  }, []);

  const loadUnits = useCallback(async () => {
    try {
      const response = await adminApi.getUnits();
      setUnits(response.data || []);
    } catch (err) {
      console.error('Load units error:', err);
    }
  }, []);

  // === INITIAL LOAD ===
  useEffect(() => {
    loadProducts({ page: 1 });
    loadCategories();
    loadUnits();
  }, [loadProducts, loadCategories, loadUnits]);

  // === SEARCH ===
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await loadProducts({ search: searchTerm, page: 1 });
  };

  // === DELETE PRODUCT ===
  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    try {
      await adminApi.deleteProduct(id);
      alert('Xóa sản phẩm thành công');
      await loadProducts({ page: currentPage, search: searchTerm });
    } catch (err) {
      console.error('Delete error:', err);
      alert('Có lỗi xảy ra khi xóa sản phẩm');
    }
  };

  // === BULK ACTION ===
  const handleBulkAction = async (action: string) => {
    if (selectedIds.length === 0) return;

    if (!confirm(`Bạn có chắc muốn ${action === 'delete' ? 'xóa' : 'thực hiện'} ${selectedIds.length} sản phẩm?`)) return;

    try {
      await adminApi.bulkAction(selectedIds, action);
      alert('Thao tác thành công');
      setSelectedIds([]);
      await loadProducts({ page: currentPage });
    } catch (err) {
      console.error('Bulk action error:', err);
      alert('Có lỗi xảy ra khi thực hiện thao tác');
    }
  };

  // === EXPORT EXCEL ===
  const handleExportExcel = async () => {
    try {
      const blob = await adminApi.exportProducts();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products_${new Date().toISOString()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Có lỗi xảy ra khi xuất file Excel');
    }
  };

  // === PAGINATION ===
  const handlePageChange = async (page: number) => {
    if (page >= 1 && page <= totalPages) {
      await loadProducts({ page, search: searchTerm });
    }
  };

  // === IMPORT EXCEL ===
  const handleImportExcel = async () => {
    alert('Chức năng nhập Excel đang được phát triển.');
  };

  return (
    <div className="container mx-auto px-4">
      <div className="bg-white rounded-lg shadow">
        {/* HEADER */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Danh sách sản phẩm</h2>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin/products/create')}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#B5DEFF] text-[#2e0cd6] rounded-lg hover:bg-[#A5D4F8] transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Thêm sản phẩm</span>
              </button>

              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#B5DEFF] text-[#2e0cd6] rounded-lg hover:bg-[#A5D4F8] transition-colors"
              >
                <span className="font-medium">📊 Xuất Excel</span>
              </button>

              <button
                onClick={handleImportExcel}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#B5DEFF] text-[#2e0cd6] rounded-lg hover:bg-[#A5D4F8] transition-colors"
              >
                <Download className="w-5 h-5" />
                <span className="font-medium">Nhập Excel</span>
              </button>
            </div>

            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </form>
          </div>
        </div>

        {/* CONTENT */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => loadProducts({ page: 1 })}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <>
              <ProductTable
                products={products}
                onDelete={handleDelete}
                onBulkAction={handleBulkAction}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
              />

              {totalPages > 1 && (
                <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Trang <strong>{currentPage}</strong> / {totalPages}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (pageNum) =>
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                      )
                      .map((pageNum, idx, arr) => {
                        const prev = arr[idx - 1];
                        const showDots = prev && pageNum - prev > 1;
                        return (
                          <span key={pageNum} className="flex items-center">
                            {showDots && <span className="px-2 text-gray-400">...</span>}
                            <button
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-1 rounded-lg transition-colors ${
                                currentPage === pageNum
                                  ? 'bg-[#211C84] text-[#ffffff] font-medium'
                                  : 'border border-gray-300 hover:bg-gray-100 text-gray-900'
                              }`}
                            >
                              {pageNum}
                            </button>
                          </span>
                        );
                      })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}