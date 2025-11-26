import React, { useState, useEffect } from 'react';
import CustomTable from '@/components/ui/CustomTable';
import { Branch, BranchInventoryItem } from '@/types/branch';

interface BranchInventoryModalProps {
  showModal: boolean;
  branch: Branch | null;
  onClose: () => void;
  fetchInventory: (branchId: number) => Promise<BranchInventoryItem[]>;
}

export default function BranchInventoryModal({
  showModal,
  branch,
  onClose,
  fetchInventory
}: BranchInventoryModalProps) {
  const [inventory, setInventory] = useState<BranchInventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (showModal && branch) {
      loadInventory();
    }
  }, [showModal, branch]);

  const loadInventory = async () => {
    if (!branch) return;
    
    setLoading(true);
    try {
      const data = await fetchInventory(branch.id);
      setInventory(data);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    return (
      item.product_name.toLowerCase().includes(query) ||
      item.variant_name.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query)
    );
  });

  const totalQuantity = filteredInventory.reduce((sum, item) => sum + item.quantity, 0);
  const totalItems = filteredInventory.length;

  const columns = [
    { 
      key: 'variant_id', 
      label: 'ID', 
      width: '60px',
      sortable: true,
      className: 'text-center'
    },
    { 
      key: 'sku', 
      label: 'MÃ SKU',
      width: '120px',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
          {value}
        </span>
      ),
      className: 'text-center'
    },
    { 
      key: 'product_name', 
      label: 'TÊN SẢN PHẨM',
      sortable: true,
      className: 'text-left font-medium'
    },
    { 
      key: 'variant_name', 
      label: 'PHÂN LOẠI',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-600">{value}</span>
      ),
      className: 'text-left'
    },
    { 
      key: 'quantity', 
      label: 'SỐ LƯỢNG',
      width: '120px',
      sortable: true,
      render: (value: number) => {
        const isLowStock = value < 10;
        const isOutOfStock = value === 0;
        
        return (
          <div className="flex items-center justify-center gap-2">
            <span className={`font-bold text-lg ${
              isOutOfStock ? 'text-red-600' : 
              isLowStock ? 'text-orange-600' : 
              'text-green-600'
            }`}>
              {value}
            </span>
            {isOutOfStock && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                Hết hàng
              </span>
            )}
            {!isOutOfStock && isLowStock && (
              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                Sắp hết
              </span>
            )}
          </div>
        );
      },
      className: 'text-center'
    }
  ];

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col shadow-xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                📦 Tồn kho - {branch?.name}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{branch?.address}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-600 font-medium">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-blue-700">{totalItems}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-sm text-green-600 font-medium">Tổng số lượng</p>
              <p className="text-2xl font-bold text-green-700">{totalQuantity}</p>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên sản phẩm, mã SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-hidden">
          <CustomTable
            columns={columns}
            data={filteredInventory}
            loading={loading}
            searchable={false}
            actionable={false}
            emptyText="Không có sản phẩm nào trong kho"
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Hiển thị {filteredInventory.length} sản phẩm
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}