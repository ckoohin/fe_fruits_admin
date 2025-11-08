'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {ProtectedRoute} from '@/components/auth/ProtectedRoute';
import { ProductForm } from '@/components/products';
import { adminApi } from '@/lib/adminApi';
import { usePermissions } from '@/hooks/usePermissions';

export default function CreateProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catRes, unitRes] = await Promise.all([
          adminApi.getCategories(),
          adminApi.getUnits(),
        ]);
        setCategories(catRes.data || []);
        setUnits(unitRes.data || []);
      } catch (error) {
        console.error('Lỗi tải danh mục/đơn vị:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <p className="text-center py-8">Đang tải dữ liệu...</p>;

  return (
    <ProtectedRoute hasPermission="create-products">
      <div className="container mx-auto px-2 py-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-semibold mb-6 text-gray-800">
            Thêm sản phẩm mới
          </h1>
          <ProductForm
            categories={categories}
            units={units}
            onSubmit={async (data) => {
              await adminApi.createProduct(data);
              router.push('/admin/products');
            }}
            onCancel={() => router.push('/admin/products')}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}