'use client';
import React, { useState } from 'react';
import CouponHeader, { CouponTable } from '@/components/coupons/CouponLayout';
import CouponModal from '@/components/coupons/CouponModel';
import { useCoupons } from '@/hooks/useCoupon';
import { Coupon, CreateCouponRequest } from '@/types/coupon';

export default function CouponsPage() {
  const {
    coupons,
    loading,
    currentPage,
    searchQuery,
    filteredCoupons,
    currentCoupons,
    totalPages,
    itemsPerPage,
    xlsxLoaded,
    setSearchQuery,
    setCurrentPage,
    deleteCoupon,
    createCoupon,
    updateCoupon,
    handleExportExcel,
    handleImportExcel
  } = useCoupons();

  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CreateCouponRequest>({
    name: '',
    description: null,
    type: 'percentage',
    value: '0',
    minimum_amount: null,
    maximum_amount: null,
    usage_limit: null,
    usage_limit_per_customer: null,
    start_date: null,
    end_date: null,
    applicable_categories: null,
    applicable_products: null,
    is_active: true
  });

  const resetForm = () => {
    setEditingCoupon(null);
    setFormData({
      name: '',
      description: null,
      type: 'percentage',
      value: '0',
      minimum_amount: null,
      maximum_amount: null,
      usage_limit: null,
      usage_limit_per_customer: null,
      start_date: null,
      end_date: null,
      applicable_categories: null,
      applicable_products: null,
      is_active: true
    });
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      name: coupon.name || '',
      description: coupon.description || null,
      type: coupon.type || 'percentage',
      value: coupon.value || '0',
      minimum_amount: coupon.minimum_amount || null,
      maximum_amount: coupon.maximum_amount || null,
      usage_limit: coupon.usage_limit || null,
      usage_limit_per_customer: coupon.usage_limit_per_customer || null,
      start_date: coupon.start_date ? coupon.start_date.substring(0, 16) : null,
      end_date: coupon.end_date ? coupon.end_date.substring(0, 16) : null,
      applicable_categories: coupon.applicable_categories || null,
      applicable_products: coupon.applicable_products || null,
      is_active: coupon.is_active ?? true
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = editingCoupon
      ? await updateCoupon(editingCoupon.id, formData)
      : await createCoupon(formData);

    if (success) {
      setShowModal(false);
      resetForm();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: target.checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value ? value : null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value || null
      }));
    }

    // Reset maximum_amount when type changes to fixed_amount
    if (name === 'type' && value === 'fixed_amount') {
      setFormData(prev => ({
        ...prev,
        maximum_amount: null
      }));
    }

    // Auto-uppercase coupon name
    if (name === 'name') {
      setFormData(prev => ({
        ...prev,
        name: value.toUpperCase()
      }));
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <CouponHeader
          totalCount={coupons.length}
          filteredCount={filteredCoupons.length}
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

        <CouponTable
          coupons={currentCoupons}
          loading={loading}
          onEdit={handleEdit}
          onDelete={deleteCoupon}
        />

        {/* Pagination */}
        <div className="p-4 flex justify-between items-center border-t border-gray-200 bg-gray-50">
          <span className="text-sm text-gray-600 font-medium">
            Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredCoupons.length)} của {filteredCoupons.length} mã khuyến mãi
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

      <CouponModal
        showModal={showModal}
        editingCoupon={editingCoupon}
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