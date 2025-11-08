'use client';
import { useState, useEffect } from 'react';
import { ApiHelper } from '@/utils/api';
import { AuthUtils } from '@/utils/auth';
import { Product, Category, Unit, CreateProductRequest } from '@/types/product';

declare global {
  interface Window {
    XLSX: any;
  }
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [xlsxLoaded, setXlsxLoaded] = useState(false);
  const itemsPerPage = 10;

  // Load XLSX library
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.XLSX) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      script.onload = () => setXlsxLoaded(true);
      document.head.appendChild(script);
    } else if (window.XLSX) {
      setXlsxLoaded(true);
    }
  }, []);

  // Fetch all data (products, categories, units)
  const fetchData = async () => {
    setLoading(true);
    try {
      if (!AuthUtils.isAuthenticated()) {
        alert('Vui lòng đăng nhập');
        window.location.href = '/login';
        return;
      }

      // Fetch parallel
      const [productsRes, categoriesRes, unitsRes] = await Promise.all([
        ApiHelper.get<any>('api/v1/products'),
        ApiHelper.get<Category[]>('api/v1/categories'),
        ApiHelper.get<Unit[]>('api/v1/units')
      ]);

      if (productsRes.success && productsRes.data) {
        // API trả về { pagination, data }
        const productData = productsRes.data.data || productsRes.data;
        setProducts(Array.isArray(productData) ? productData : []);
      }

      if (categoriesRes.success && categoriesRes.data) {
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
      }

      if (unitsRes.success && unitsRes.data) {
        setUnits(Array.isArray(unitsRes.data) ? unitsRes.data : []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Create product
  const createProduct = async (data: CreateProductRequest) => {
    try {
      console.log('=== CREATE PRODUCT ===');
      console.log('Data:', data);

      const response = await ApiHelper.post('api/v1/products', data);
      if (response.success) {
        alert('Thêm sản phẩm thành công!');
        fetchData();
        return true;
      }
      alert('Lỗi: ' + (response.message || 'Không thể lưu sản phẩm'));
      return false;
    } catch (error: any) {
      console.error('Create error:', error);
      alert('Lỗi: ' + error.message);
      return false;
    }
  };

  // Update product
  const updateProduct = async (id: string, data: CreateProductRequest) => {
    try {
      console.log('=== UPDATE PRODUCT ===');
      console.log('ID:', id);
      console.log('Data:', data);

      const response = await ApiHelper.patch(`api/v1/products/${id}`, data);
      if (response.success) {
        alert('Cập nhật thành công!');
        fetchData();
        return true;
      }
      alert('Lỗi: ' + (response.message || 'Không thể lưu sản phẩm'));
      return false;
    } catch (error: any) {
      console.error('Update error:', error);
      alert('Lỗi: ' + error.message);
      return false;
    }
  };

  // Delete product
  const deleteProduct = async (product: Product) => {
    if (!product || !product.id) {
      alert('Dữ liệu sản phẩm không hợp lệ');
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${product.name}"?`)) return;

    try {
      const response = await ApiHelper.delete(`api/v1/products/${product.id}`);
      if (response.success) {
        alert('Xóa sản phẩm thành công!');
        fetchData();
      } else {
        alert('Lỗi: ' + (response.message || 'Không thể xóa sản phẩm'));
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      alert('Lỗi: ' + error.message);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!window.XLSX) {
      alert('Đang tải thư viện Excel...');
      return;
    }

    const exportData = filteredProducts.map(product => ({
      'ID': product.id,
      'Tên Sản Phẩm': product.name,
      'SKU': product.sku,
      'Danh Mục': product.category_name,
      'Đơn Vị': product.unit_name,
      'Giá Bán': product.price,
      'Giá So Sánh': product.compare_price || '',
      'Tồn Kho': product.stock_quantity,
      'Xuất Xứ': product.origin,
      'Trạng Thái': product.is_active ? 'Hoạt động' : 'Tạm dừng',
      'Nổi Bật': product.is_featured ? 'Có' : 'Không',
      'Ngày Tạo': new Date(product.created_at).toLocaleDateString('vi-VN')
    }));

    const ws = window.XLSX.utils.json_to_sheet(exportData);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Sản Phẩm");
    
    ws['!cols'] = [
      { wch: 8 }, { wch: 30 }, { wch: 15 }, { wch: 20 },
      { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 10 },
      { wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 12 }
    ];

    window.XLSX.writeFile(wb, `san-pham_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Import from Excel
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !window.XLSX) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const wb = window.XLSX.read(event.target?.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonData = window.XLSX.utils.sheet_to_json(ws);

        if (jsonData.length === 0) {
          alert('File Excel trống');
          return;
        }

        const importData = jsonData.map((row: any) => {
          // Map category name to ID
          const category = categories.find(c => 
            c.name.toLowerCase() === row['Danh Mục']?.toLowerCase()
          );
          
          // Map unit name to ID
          const unit = units.find(u => 
            u.name.toLowerCase() === row['Đơn Vị']?.toLowerCase()
          );

          return {
            name: row['Tên Sản Phẩm'] || '',
            slug: row['SKU']?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '',
            category_id: category ? parseInt(category.id) : 1,
            unit_id: unit ? parseInt(unit.id) : 1,
            price: parseFloat(row['Giá Bán']) || 0,
            stock_quantity: parseInt(row['Tồn Kho']) || 0,
            short_description: row['Mô Tả Ngắn'] || '',
            description: row['Mô Tả Chi Tiết'] || '',
            origin: row['Xuất Xứ'] || 'Việt Nam',
            is_active: row['Trạng Thái'] === 'Hoạt động',
            is_featured: row['Nổi Bật'] === 'Có',
            compare_price: row['Giá So Sánh'] ? parseFloat(row['Giá So Sánh']) : undefined
          };
        });

        if (!confirm(`Import ${importData.length} sản phẩm?`)) return;

        let success = 0, error = 0;
        for (const product of importData) {
          try {
            const res = await ApiHelper.post('api/v1/products', product);
            if (res.success) success++;
            else error++;
          } catch {
            error++;
          }
        }

        alert(`Thành công: ${success}\nThất bại: ${error}`);
        fetchData();
      } catch (error) {
        alert('Lỗi đọc file Excel');
      }
    };
    
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    return (
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query) ||
      product.category_name.toLowerCase().includes(query) ||
      product.origin.toLowerCase().includes(query)
    );
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchData();
  }, []);

  return {
    products,
    categories,
    units,
    filteredProducts,
    currentProducts,
    loading,
    currentPage,
    searchQuery,
    xlsxLoaded,
    totalPages,
    itemsPerPage,
    setSearchQuery,
    setCurrentPage,
    fetchData,
    createProduct,
    updateProduct,
    deleteProduct,
    handleExportExcel,
    handleImportExcel
  };
}