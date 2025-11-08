import { useState, useEffect } from 'react';
import { ProductVariant } from '@/types/product';

interface VariantFormProps {
    variant: ProductVariant | null;
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

export default function VariantForm({ variant, onSubmit, onCancel }: VariantFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        price: '',
        stock_quantity: '',
        weight: '',
        length: '',
        width: '',
        height: '',
        attributes: ''
    });

    useEffect(() => {
        if (variant) {
            setFormData({
                name: variant.name || '',
                sku: variant.sku || '',
                price: variant.price?.toString() || '',
                stock_quantity: variant.stock_quantity?.toString() || '',
                weight: variant.weight?.toString() || '',
                length: variant.length?.toString() || '',
                width: variant.width?.toString() || '',
                height: variant.height?.toString() || '',
                attributes: variant.attributes ? JSON.stringify(variant.attributes) : ''
            });
        }
    }, [variant]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const data: any = {
            name: formData.name,
            sku: formData.sku || null,
            price: parseFloat(formData.price) || 0,
            stock_quantity: parseInt(formData.stock_quantity) || 0,
        };

        if (formData.weight) data.weight = parseFloat(formData.weight);
        if (formData.length) data.length = parseFloat(formData.length);
        if (formData.width) data.width = parseFloat(formData.width);
        if (formData.height) data.height = parseFloat(formData.height);

        if (formData.attributes) {
            try {
                data.attributes = JSON.parse(formData.attributes);
            } catch (e) {
                alert('Định dạng JSON attributes không hợp lệ');
                return;
            }
        }

        onSubmit(data);
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
                {variant ? 'Chỉnh sửa phiên bản' : 'Thêm phiên bản mới'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên phiên bản <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="VD: Màu đỏ - Size L"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            SKU
                        </label>
                        <input
                            type="text"
                            name="sku"
                            value={formData.sku}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="VD: PROD-RED-L"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Giá (VNĐ) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="100000"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tồn kho <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="stock_quantity"
                            value={formData.stock_quantity}
                            onChange={handleChange}
                            required
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cân nặng (kg)
                        </label>
                        <input
                            type="number"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="1.5"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Chiều dài (cm)
                        </label>
                        <input
                            type="number"
                            name="length"
                            value={formData.length}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="30"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Chiều rộng (cm)
                        </label>
                        <input
                            type="number"
                            name="width"
                            value={formData.width}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="20"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Chiều cao (cm)
                        </label>
                        <input
                            type="number"
                            name="height"
                            value={formData.height}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="10"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Attributes (JSON)
                    </label>
                    <textarea
                        name="attributes"
                        value={formData.attributes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        placeholder='{"color": "red", "size": "L"}'
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Nhập dữ liệu JSON hợp lệ. VD: {`{"color": "red", "size": "L"}`}
                    </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        {variant ? 'Cập nhật' : 'Tạo mới'}
                    </button>
                </div>
            </form>
        </div>
    );
}