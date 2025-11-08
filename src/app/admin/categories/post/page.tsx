'use client';
import React, { useState, useEffect } from 'react';
import PostCategoryHeader, { PostCategoryTable } from '@/components/categories/PostCategoryLayout';
import PostCategoryModal from '@/components/categories/PostCategoryModel';
import { usePostCategories } from '@/hooks/usePostCategory';
import { PostCategory, CreatePostCategoryRequest } from '@/types/postCategory';

export default function PostCategoriesPage() {
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
    handleImportExcel,
  } = usePostCategories();

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PostCategory | null>(null);
  const [formData, setFormData] = useState<CreatePostCategoryRequest>({
    name: '',
    slug: '',
    description: '',
  });

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
    });
  };

  const handleEdit = (category: PostCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = editingCategory
      ? await updateCategory(editingCategory.id, { name: formData.name })
      : await createCategory(formData);

    if (success) {
      setShowModal(false);
      resetForm();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <PostCategoryHeader
          totalCount={categories.length}
          filteredCount={filteredCategories.length}
          searchQuery={searchQuery}
          onSearchChange={(query) => setSearchQuery(query)}
          onImport={handleImportExcel}
          onExport={handleExportExcel}
          onAdd={() => {
            resetForm();
            setShowModal(true);
          }}
          xlsxLoaded={xlsxLoaded}
        />

        <PostCategoryTable
          categories={currentCategories}
          loading={loading}
          onEdit={handleEdit}
          onDelete={deleteCategory}
        />

        <div className="p-4 flex justify-between items-center border-t border-gray-200 bg-gray-50">
          <span className="text-sm text-gray-600 font-medium">
            {searchQuery ? (
              <>Tìm thấy {filteredCategories.length} danh mục bài viết</>
            ) : (
              <>Tổng {categories.length} danh mục bài viết</>
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

      <PostCategoryModal
        showModal={showModal}
        editingCategory={editingCategory}
        formData={formData}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        onSubmit={handleSubmit}
        onInputChange={handleInputChange}
      />
    </div>
  );
}