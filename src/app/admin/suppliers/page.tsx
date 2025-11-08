'use client';
import React, { useState } from 'react';
import SupplierHeader, { SupplierTable } from '@/components/suppliers/SupplierLayout';
import SupplierModal from '@/components/suppliers/SupplierModel';
import { useSuppliers } from '@/hooks/useSupplier';
import { Supplier, CreateSupplierRequest } from '@/types/supplier';

export default function SuppliersPage() {
  const {
    suppliers,
    loading,
    currentPage,
    searchQuery,
    filteredSuppliers,
    currentSuppliers,
    totalPages,
    itemsPerPage,
    xlsxLoaded,
    setSearchQuery,
    setCurrentPage,
    deleteSupplier,
    createSupplier,
    updateSupplier,
    handleExportExcel,
    handleImportExcel
  } = useSuppliers();

  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState<CreateSupplierRequest>({
    name: '',
    code: '',
    phone: null,
    address: null,
    email: null,
    province: null,
    district: null,
    ward: null,
    contact_person: null,
    tax_code: null,
    bank_account: null,
    bank_name: null,
    status: true
  });

  const resetForm = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      code: '',
      phone: null,
      address: null,
      email: null,
      province: null,
      district: null,
      ward: null,
      contact_person: null,
      tax_code: null,
      bank_account: null,
      bank_name: null,
      status: true
    });
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name || '',
      code: supplier.code || '',
      phone: supplier.phone || null,
      address: supplier.address || null,
      email: supplier.email || null,
      province: supplier.province || null,
      district: supplier.district || null,
      ward: supplier.ward || null,
      contact_person: supplier.contact_person || null,
      tax_code: supplier.tax_code || null,
      bank_account: supplier.bank_account || null,
      bank_name: supplier.bank_name || null,
      status: supplier.status ?? true
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = editingSupplier
      ? await updateSupplier(editingSupplier.id, formData)
      : await createSupplier(formData);

    if (success) {
      setShowModal(false);
      resetForm();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: target.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value || null
      }));
    }

    // Auto-generate code from name
    if (name === 'name' && !editingSupplier) {
      const code = value
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/Đ/g, 'D')
        .replace(/[^A-Z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '')
        .substring(0, 6) + '001';
      
      setFormData(prev => ({
        ...prev,
        code: code
      }));
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <SupplierHeader
          totalCount={suppliers.length}
          filteredCount={filteredSuppliers.length}
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

        <SupplierTable
          suppliers={currentSuppliers}
          loading={loading}
          onEdit={handleEdit}
          onDelete={deleteSupplier}
        />

        {/* Pagination */}
        <div className="p-4 flex justify-between items-center border-t border-gray-200 bg-gray-50">
          <span className="text-sm text-gray-600 font-medium">
            {searchQuery ? (
              <>Tìm thấy {filteredSuppliers.length} / {suppliers.length} nhà cung cấp</>
            ) : (
              <>Tổng: {suppliers.length} nhà cung cấp</>
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

      <SupplierModal
        showModal={showModal}
        editingSupplier={editingSupplier}
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