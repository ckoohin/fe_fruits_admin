'use client';
import React, { useState } from 'react';
import CategoryHeader, { CategoryTable } from '@/components/categories/CategoryLayout';
import CategoryModal from '@/components/categories/CategoryModel';
import { useCategories } from '@/hooks/useCategory';
import { Category, CreateCategoryRequest } from '@/types/category';

export default function CategoriesPage() {
  const {
    categories,
    loading,
    currentPage,
    searchQuery,
    filteredCategories,
    currentCategories,
    totalPages,
    itemsPerPage,
    xlsxLoaded,
    setSearchQuery,
    setCurrentPage,
    deleteCategory,
    createCategory,
    updateCategory,
    handleExportExcel,
    handleImportExcel
  } = useCategories();

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: '',
    slug: '',
    parent_id: null,
    description: '',
    image: '',
    sort_order: 0,
    is_active: true
  });

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      parent_id: null,
      description: '',
      image: '',
      sort_order: 0,
      is_active: true
    });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      parent_id: category.parent_id || null,
      description: category.description || '',
      image: category.image || '',
      sort_order: category.sort_order || 0,
      is_active: category.is_active ?? true
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = editingCategory
      ? await updateCategory(editingCategory.id, formData)
      : await createCategory(formData);

    if (success) {
      setShowModal(false);
      resetForm();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = target.checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const handleImageChange = (url: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      image: typeof url === 'string' ? url : (url[0] || '')
    }));
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  return (
    <div className="space-y-0">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <CategoryHeader
          totalCount={categories.length}
          filteredCount={filteredCategories.length}
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

        <CategoryTable
          categories={currentCategories}
          allCategories={categories}
          loading={loading}
          onEdit={handleEdit}
          onDelete={deleteCategory}
        />

        {/* Pagination */}
        <div className="p-4 flex justify-between items-center border-t border-gray-200 bg-gray-50">
          <span className="text-sm text-gray-600 font-medium">
            {searchQuery ? (
              <>Tìm thấy {filteredCategories.length} / {categories.length} danh mục</>
            ) : (
              <>Tổng: {categories.length} danh mục</>
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

      <CategoryModal
        showModal={showModal}
        editingCategory={editingCategory}
        formData={formData}
        categories={categories}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        onSubmit={handleSubmit}
        onInputChange={handleInputChange}
        onImageChange={handleImageChange}
      />
    </div>
  );
}