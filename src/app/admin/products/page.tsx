'use client';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import ProductHeader, { ProductTable } from '@/components/products/ProductLayout';
import ProductModal from '@/components/products/ProductModal';
import ProductDetailModal from '@/components/products/ProductDetailModel';
import { useProducts } from '@/hooks/useProducts';
import { Product, CreateProductRequest, Category, Unit, ProductImageStructure } from '@/types/product';

export default function ProductsPage() {
  const {
    products,
    categories,
    units,
    loading,
    currentPage,
    searchQuery,
    filteredProducts,
    currentProducts,
    totalPages,
    totalItems,
    itemsPerPage,
    xlsxLoaded,
    setSearchQuery,
    fetchData,
    setCurrentPage,
    deleteProduct,
    createProduct,
    updateProduct,
    handleExportExcel,
    handleImportExcel
  } = useProducts();

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailProductId, setDetailProductId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateProductRequest>({
    name: '',
    slug: '',
    category_id: 0,
    unit_id: 0,
    price: 0,
    stock_quantity: 0,
    short_description: '',
    description: '',
    origin: 'Việt Nam',
    is_active: true,
    is_featured: false,
    images: { thumbnail: '', gallery: [] } 
  });

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      category_id: 0,
      unit_id: 0,
      price: 0,
      stock_quantity: 0,
      short_description: '',
      description: '',
      origin: 'Việt Nam',
      is_active: true,
      is_featured: false,
      images: { thumbnail: '', gallery: [] } 
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);

    let imagesData: ProductImageStructure = { thumbnail: '', gallery: [] };

    if (product.images) {
      if (Array.isArray(product.images)) {
        console.warn("Product images are in old array format, converting..."); 
        imagesData.thumbnail = product.images[0] || '';
        imagesData.gallery = product.images.slice(1);
      }
      else if (typeof product.images === 'object' && product.images !== null) {
        imagesData.thumbnail = product.images.thumbnail || '';
        imagesData.gallery = product.images.gallery || [];
      }
    }

    setFormData({
      name: product.name,
      slug: product.slug,
      category_id: typeof product.category_id === 'string' ? parseInt(product.category_id, 10) : product.category_id,
      unit_id: typeof product.unit_id === 'string' ? parseInt(product.unit_id, 10) : product.unit_id,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      stock_quantity: product.stock_quantity,
      short_description: product.short_description || '', 
      description: product.description || '',
      origin: product.origin || 'Việt Nam',
      is_active: product.is_active,
      is_featured: product.is_featured,
      images: imagesData, 
      compare_price: product.compare_price ? parseFloat(product.compare_price) : undefined,
      cost_price: product.cost_price ? parseFloat(product.cost_price) : undefined,
      weight: product.weight || '', 
      is_fresh: product.is_fresh,
      shelf_life_days: product.shelf_life_days || 0, 
      storage_conditions: product.storage_conditions || '', 
      harvest_season: product.harvest_season || '',
      organic_certified: product.organic_certified,
      specifications: product.specifications
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category_id || !formData.unit_id) {
      toast.error('Vui lòng chọn danh mục và đơn vị');
      return;
    }

    const cleanData: CreateProductRequest = {
      ...formData,
      price: formData.price ? parseFloat(formData.price as any) : 0,
      stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity as any, 10) : 0,
      compare_price: formData.compare_price 
        ? parseFloat(formData.compare_price as any) 
        : undefined,
      images: formData.images || { thumbnail: '', gallery: [] },
    };

    if (isNaN(cleanData.price) || cleanData.price < 0) {
      toast.error('Giá bán phải là số dương');
      return;
    }
    if (isNaN(cleanData.stock_quantity) || cleanData.stock_quantity < 0) {
      toast.error('Tồn kho phải là số nguyên không âm');
      return;
    }

    const success = editingProduct
      ? await updateProduct(editingProduct.id, cleanData)
      : await createProduct(cleanData);

    if (success) {
      setShowModal(false);
      resetForm();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked; 

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleThumbnailChange = (url: string) => {
    setFormData(prev => {
      const currentImages = (prev.images && typeof prev.images === 'object' && !Array.isArray(prev.images))
                             ? prev.images
                             : { thumbnail: '', gallery: [] };
      return {
        ...prev,
        images: {
          ...(currentImages as ProductImageStructure), 
          thumbnail: url
        }
      };
    });
  };

  const handleGalleryChange = (urls: string[]) => {
    setFormData(prev => {
      const currentImages = (prev.images && typeof prev.images === 'object' && !Array.isArray(prev.images))
                             ? prev.images
                             : { thumbnail: '', gallery: [] };
      return {
        ...prev,
        images: {
          ...(currentImages as ProductImageStructure), 
          gallery: urls
        }
      };
    });
  };

  const handleRowClick = (product: Product) => {
    setDetailProductId(product.id != null ? String(product.id) : null);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <ProductHeader
          totalCount={totalItems}
          filteredCount={totalItems}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onImport={handleImportExcel}
          onExport={handleExportExcel}
          onAdd={() => {
            resetForm();
            setShowModal(true);
          }}
          xlsxLoaded={xlsxLoaded}
        />

        <ProductTable
          products={currentProducts}
          loading={loading}
          onEdit={handleEdit}
          onDelete={deleteProduct}
          onRowClick={handleRowClick}
        />

        {/* Pagination */}
        <div className="p-4 flex justify-between items-center border-t border-gray-200 bg-gray-50">
          <span className="text-sm text-gray-600 font-medium">
  {searchQuery 
    ? `Tìm thấy ${totalItems} sản phẩm` 
    : `Tổng: ${totalItems} sản phẩm`}

  {" "} • Trang {currentPage} / {totalPages}
</span>
          <div className="flex items-center space-x-2">
            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)} className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium ${currentPage === page ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-700 hover:bg-white'}`}>{page}</button>
              ))}
            </div>
            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>

      <ProductModal
        showModal={showModal}
        editingProduct={editingProduct}
        formData={formData}
        categories={categories}
        units={units}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        onSubmit={handleSubmit}
        onInputChange={handleInputChange}
        onThumbnailChange={handleThumbnailChange}
        onGalleryChange={handleGalleryChange}
      />

      <ProductDetailModal
        productId={detailProductId}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onEdit={handleEdit}
        onDelete={deleteProduct}
      />
    </div>
  );
}