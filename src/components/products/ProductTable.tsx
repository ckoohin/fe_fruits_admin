'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Edit, Search } from 'lucide-react';
import { Product } from '@/types/product';
import {formatProductPrice} from '@/lib/formatters';
interface ProductTableProps {
  products: Product[];
  onDelete: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onEdit: (id: string) => void;
  onManageVariants: (id: string) => void;
  onBulkAction: (ids: string[], action: string) => void;
}

export default function ProductTable({ products, onBulkAction, onSelectAll, onSelectOne, onEdit, onDelete, onManageVariants }: ProductTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  {console.log('Products in table:', products)}

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredProducts.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {selectedIds.length > 0 && (
        <div className="p-4 bg-blue-50 border-b">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              Đã chọn {selectedIds.length} sản phẩm
            </span>
            <button
              onClick={() => onBulkAction(selectedIds, 'delete')}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Xóa
            </button>
            <button
              onClick={() => onBulkAction(selectedIds, 'activate')}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Kích hoạt
            </button>
            <button
              onClick={() => onBulkAction(selectedIds, 'deactivate')}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Vô hiệu hóa
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Hình ảnh</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tên sản phẩm</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Danh mục</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Giá</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tồn kho</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Trạng thái</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(product.id)}
                    onChange={(e) => handleSelectOne(product.id, e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="relative w-16 h-16 rounded overflow-hidden">
                    <Image
                      src={
                        product.images?.thumbnail ||
                        product.images?.gallery?.[0] ||
                        '/placeholder.jpg'
                      }
                      alt={product.name}
                      fill
                      unoptimized 
                      className="object-cover w-full h-full"
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{product.name}</div>
                  <div className="text-sm text-gray-500">{product.slug}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{product.category_name || '—'}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {formatProductPrice(product.price)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{product.stock_quantity}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {product.is_active? 'Còn hàng' : 'Hết Hàng'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => onDelete(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          Không tìm thấy sản phẩm nào
        </div>
      )}
    </div>
  );
}