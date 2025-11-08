
'use client';
import React, { useState } from 'react';
import BannerHeader, { BannerTable } from '@/components/banners/BannerLayout';
import BannerModal from '@/components/banners/BannerModel';
import { useBanners } from '@/hooks/useBanner';
import { Banner, CreateBannerRequest } from '@/types/banner';

export default function BannersPage() {
  const {
    banners,
    loading,
    currentPage,
    searchQuery,
    filteredBanners,
    currentBanners,
    totalPages,
    itemsPerPage,
    xlsxLoaded,
    setSearchQuery,
    setCurrentPage,
    deleteBanner,
    createBanner,
    updateBanner,
    handleExportExcel,
    handleImportExcel
  } = useBanners();

  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<CreateBannerRequest>({
    title: '',
    image: '',
    link: '',
    position: 'home',
    sort_order: 0,
    is_active: true
  });

  const resetForm = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      image: '',
      link: '',
      position: 'home',
      sort_order: 0,
      is_active: true
    });
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      image: banner.image || '',
      link: banner.link || '',
      position: banner.position || 'home',
      sort_order: banner.sort_order || 0,
      is_active: banner.is_active ?? true
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = editingBanner
      ? await updateBanner(editingBanner.id, formData)
      : await createBanner(formData);

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

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <BannerHeader
          totalCount={banners.length}
          filteredCount={filteredBanners.length}
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

        <BannerTable
          banners={currentBanners}
          loading={loading}
          onEdit={handleEdit}
          onDelete={deleteBanner}
        />

        {/* Pagination */}
        <div className="p-4 flex justify-between items-center border-t border-gray-200 bg-gray-50">
          <span className="text-sm text-gray-600 font-medium">
            Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredBanners.length)} của {filteredBanners.length} banner
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

      <BannerModal
        showModal={showModal}
        editingBanner={editingBanner}
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