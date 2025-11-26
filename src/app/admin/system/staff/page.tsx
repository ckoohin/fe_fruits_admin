'use client';
import React, { useState, useEffect } from 'react';
import StaffHeader, { StaffTable } from '@/components/system/StaffLayout';
import StaffModal from '@/components/system/StaffModel';
import { useStaff } from '@/hooks/useStaff';
import { Staff, CreateStaffRequest } from '@/types/staff';
import { ApiHelper } from '@/utils/api'; 

export default function StaffPage() {
  const {
    staff,
    loading,
    currentPage,
    searchQuery,
    filteredStaff,
    currentStaff,
    totalPages,
    itemsPerPage,
    xlsxLoaded,
    setSearchQuery,
    setCurrentPage,
    deleteStaff,
    createStaff,
    updateStaff,
    handleExportExcel,
    handleImportExcel,
  } = useStaff();

  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<CreateStaffRequest>({
    name: '',
    email: '',
    role_id: 0,
    branch_id: 0,
  });
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await ApiHelper.get('/api/v1/roles');
        if (response.success && Array.isArray(response.data)) {
          setRoles(response.data);
        } else {
          alert('Không thể tải danh sách vai trò: ' + response.message);
          console.error('Dữ liệu roles không hợp lệ:', response.message);
        }
      } catch (error: any) {
        alert('Lỗi khi tải danh sách vai trò: ' + error.message);
        console.error('Lỗi khi fetch roles:', error);
      }
    };

    const fetchBranches = async () => {
      try {
        const response = await ApiHelper.get('/api/v1/branches');
        if (response.success && Array.isArray(response.data)) {
          setBranches(response.data);
        } else {
          alert('Không thể tải danh sách chi nhánh: ' + response.message);
          console.error('Dữ liệu branches không hợp lệ:', response.message);
        }
      } catch (error: any) {
        alert('Lỗi khi tải danh sách chi nhánh: ' + error.message);
        console.error('Lỗi khi fetch branches:', error);
      }
    };

    fetchRoles();
    fetchBranches();
  }, []);

  const resetForm = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      email: '',
      role_id: 0,
      branch_id: 0,
    });
  };

  const handleEdit = (staffItem: Staff) => {
    setEditingStaff(staffItem);
    
    const role = roles.find(r => r.name === staffItem.role_name);
    setFormData({
      name: staffItem.name || '',
      email: staffItem.email || '',
      role_id: role ? role.id : 0,
      branch_id: staffItem.branch_id,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = editingStaff
      ? await updateStaff(editingStaff.id, {
          name: formData.name,
          role_id: formData.role_id,
          status: formData.role_id ? 1 : 2, // Mặc định status, có thể điều chỉnh
        })
      : await createStaff(formData);

    if (success) {
      setShowModal(false);
      resetForm();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'role_id' || name === 'branch_id' ? Number(value) : value,
    }));
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <StaffHeader
          totalCount={staff.length}
          filteredCount={filteredStaff.length}
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

        <StaffTable
          staff={currentStaff}
          loading={loading}
          onEdit={handleEdit}
          onDelete={deleteStaff}
        />

        {/* Pagination */}
        <div className="p-4 flex justify-between items-center border-t border-gray-200 bg-gray-50">
          <span className="text-sm text-gray-600 font-medium">
            Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredStaff.length)} của {filteredStaff.length} nhân viên
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

      <StaffModal
        showModal={showModal}
        editingStaff={editingStaff}
        formData={formData}
        roles={roles}
        branches={branches}
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