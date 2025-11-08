'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import VariantList from '@/components/products/variants/VariantList';
import VariantForm from '@/components/products/variants/VariantForm';
import { ProductVariant } from '@/types/product';
import { toast } from 'react-hot-toast';
import { API_CONFIG } from '@/lib/constants';

export default function ProductVariantsPage() {
    const searchParams = useSearchParams();
    const productId = searchParams.get('productId');
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);

    useEffect(() => {
        if (productId) {
            fetchVariants();
        }
    }, [productId]);

    const fetchVariants = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_CONFIG.BASE_URL}/v1/products/${productId}/variants`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch variants');
            const data = await response.json();
            setVariants(data);
        } catch (error) {
            toast.error('Không thể tải danh sách phiên bản sản phẩm');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingVariant(null);
        setShowForm(true);
    };

    const handleEdit = (variant: ProductVariant) => {
        setEditingVariant(variant);
        setShowForm(true);
    };

    const handleDelete = async (variantId: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa phiên bản này?')) return;

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/v1/variants/${variantId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete variant');
            
            toast.success('Xóa phiên bản thành công');
            fetchVariants();
        } catch (error) {
            toast.error('Không thể xóa phiên bản');
            console.error(error);
        }
    };

    const handleFormSubmit = async (data: any) => {
        try {
            const url = editingVariant 
                ? `${API_CONFIG.BASE_URL}/v1/variants/${editingVariant.id}`
                : `${API_CONFIG.BASE_URL}/v1/products/${productId}/variants`;
            
            const method = editingVariant ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to save variant');

            toast.success(editingVariant ? 'Cập nhật thành công' : 'Tạo mới thành công');
            setShowForm(false);
            setEditingVariant(null);
            fetchVariants();
        } catch (error) {
            toast.error('Không thể lưu phiên bản');
            console.error(error);
        }
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingVariant(null);
    };

    if (!productId) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    Không tìm thấy ID sản phẩm. Vui lòng chọn sản phẩm từ danh sách.
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý phiên bản sản phẩm</h1>
                    <p className="text-gray-600 mt-1">Product ID: {productId}</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    + Thêm phiên bản mới
                </button>
            </div>

            {showForm && (
                <div className="mb-6">
                    <VariantForm
                        variant={editingVariant}
                        onSubmit={handleFormSubmit}
                        onCancel={handleFormCancel}
                    />
                </div>
            )}

            <VariantList
                variants={variants}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
}