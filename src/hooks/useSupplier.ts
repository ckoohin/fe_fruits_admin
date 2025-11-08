'use client';
import { useState, useEffect } from 'react';
import { ApiHelper } from '@/utils/api';
import { AuthUtils } from '@/utils/auth';
import { Supplier, CreateSupplierRequest } from '@/types/supplier';

declare global {
  interface Window {
    XLSX: any;
  }
}

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
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

  // Fetch suppliers
  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      if (!AuthUtils.isAuthenticated()) {
        alert('Vui lòng đăng nhập');
        window.location.href = '/login';
        return;
      }
      
      const response = await ApiHelper.get<Supplier[]>('api/v1/suppliers');
      
      if (response.success && response.data) {
        setSuppliers(Array.isArray(response.data) ? response.data : []);
      } else {
        alert(response.message || 'Không thể tải dữ liệu nhà cung cấp');
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      alert('Lỗi khi tải nhà cung cấp');
    } finally {
      setLoading(false);
    }
  };

  // Delete supplier
  const deleteSupplier = async (supplier: Supplier) => {
    if (!supplier || !supplier.id) {
      alert('Dữ liệu nhà cung cấp không hợp lệ');
      return;
    }
    
    if (!confirm(`Bạn có chắc muốn xóa nhà cung cấp "${supplier.name}"?`)) return;

    try {
      const response = await ApiHelper.delete(`api/v1/suppliers/${supplier.id}`);
      if (response.success) {
        alert('Xóa nhà cung cấp thành công!');
        fetchSuppliers();
      } else {
        alert('Lỗi: ' + (response.message || 'Không thể xóa nhà cung cấp'));
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      alert('Lỗi: ' + error.message);
    }
  };

  // Create supplier
  const createSupplier = async (data: CreateSupplierRequest) => {
    try {
      console.log('=== CREATE SUPPLIER ===');
      console.log('Data:', data);
      
      const response = await ApiHelper.post('api/v1/suppliers', data);
      if (response.success) {
        alert('Thêm nhà cung cấp thành công!');
        fetchSuppliers();
        return true;
      }
      alert('Lỗi: ' + (response.message || 'Không thể lưu nhà cung cấp'));
      return false;
    } catch (error: any) {
      console.error('Create error:', error);
      alert('Lỗi: ' + error.message);
      return false;
    }
  };

  // Update supplier
  const updateSupplier = async (id: string, data: CreateSupplierRequest) => {
    try {
      const updateData: any = {
        name: data.name,
        code: data.code,
        status: data.status
      };
      
      // Add optional fields only if they have values
      if (data.phone?.trim()) updateData.phone = data.phone;
      if (data.address?.trim()) updateData.address = data.address;
      if (data.email?.trim()) updateData.email = data.email;
      if (data.province?.trim()) updateData.province = data.province;
      if (data.district?.trim()) updateData.district = data.district;
      if (data.ward?.trim()) updateData.ward = data.ward;
      if (data.contact_person?.trim()) updateData.contact_person = data.contact_person;
      if (data.tax_code?.trim()) updateData.tax_code = data.tax_code;
      if (data.bank_account?.trim()) updateData.bank_account = data.bank_account;
      if (data.bank_name?.trim()) updateData.bank_name = data.bank_name;
      
      console.log('=== UPDATE SUPPLIER ===');
      console.log('ID:', id);
      console.log('Data:', updateData);
      
      const response = await ApiHelper.patch(`api/v1/suppliers/${id}`, updateData);
      if (response.success) {
        alert('Cập nhật thành công!');
        fetchSuppliers();
        return true;
      }
      alert('Lỗi: ' + (response.message || 'Không thể lưu nhà cung cấp'));
      return false;
    } catch (error: any) {
      console.error('Update error:', error);
      alert('Lỗi: ' + error.message);
      return false;
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!window.XLSX) {
      alert('Đang tải thư viện Excel, vui lòng thử lại sau giây lát...');
      return;
    }

    const exportData = filteredSuppliers.map(supplier => ({
      'ID': supplier.id,
      'Tên NCC': supplier.name,
      'Mã NCC': supplier.code,
      'Email': supplier.email || '',
      'Số điện thoại': supplier.phone || '',
      'Người liên hệ': supplier.contact_person || '',
      'Địa chỉ': supplier.address || '',
      'Tỉnh/TP': supplier.province || '',
      'Quận/Huyện': supplier.district || '',
      'Phường/Xã': supplier.ward || '',
      'Mã số thuế': supplier.tax_code || '',
      'Tài khoản NH': supplier.bank_account || '',
      'Ngân hàng': supplier.bank_name || '',
      'Trạng thái': supplier.status ? 'Hoạt động' : 'Tạm dừng',
      'Ngày tạo': new Date(supplier.created_at).toLocaleDateString('vi-VN')
    }));

    const worksheet = window.XLSX.utils.json_to_sheet(exportData);
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, "Suppliers");
    
    const colWidths = [
      { wch: 8 },   // ID
      { wch: 30 },  // Tên NCC
      { wch: 15 },  // Mã NCC
      { wch: 25 },  // Email
      { wch: 15 },  // Số điện thoại
      { wch: 20 },  // Người liên hệ
      { wch: 40 },  // Địa chỉ
      { wch: 15 },  // Tỉnh/TP
      { wch: 15 },  // Quận/Huyện
      { wch: 15 },  // Phường/Xã
      { wch: 15 },  // Mã số thuế
      { wch: 20 },  // Tài khoản NH
      { wch: 20 },  // Ngân hàng
      { wch: 12 },  // Trạng thái
      { wch: 12 }   // Ngày tạo
    ];
    worksheet['!cols'] = colWidths;

    const fileName = `suppliers_${new Date().toISOString().split('T')[0]}.xlsx`;
    window.XLSX.writeFile(workbook, fileName);
  };

  // Import from Excel
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.XLSX) {
      alert('Đang tải thư viện Excel, vui lòng thử lại sau giây lát...');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const binaryStr = event.target?.result;
        const workbook = window.XLSX.read(binaryStr, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = window.XLSX.utils.sheet_to_json(firstSheet);
        
        if (jsonData.length === 0) {
          alert('File Excel trống hoặc không có dữ liệu');
          return;
        }
        
        const importedSuppliers = jsonData.map((row: any) => ({
          name: row['Tên NCC'] || '',
          code: row['Mã NCC'] || '',
          email: row['Email'] || null,
          phone: row['Số điện thoại'] || null,
          contact_person: row['Người liên hệ'] || null,
          address: row['Địa chỉ'] || null,
          province: row['Tỉnh/TP'] || null,
          district: row['Quận/Huyện'] || null,
          ward: row['Phường/Xã'] || null,
          tax_code: row['Mã số thuế'] || null,
          bank_account: row['Tài khoản NH'] || null,
          bank_name: row['Ngân hàng'] || null,
          status: row['Trạng thái'] === 'Hoạt động'
        }));

        if (!confirm(`Bạn có muốn import ${importedSuppliers.length} nhà cung cấp không?`)) {
          return;
        }

        let successCount = 0;
        let errorCount = 0;

        for (const supplier of importedSuppliers) {
          try {
            const response = await ApiHelper.post('api/v1/suppliers', supplier);
            if (response.success) {
              successCount++;
            } else {
              errorCount++;
              console.error('Error importing supplier:', supplier.name, response.message);
            }
          } catch (error) {
            errorCount++;
            console.error('Error importing supplier:', supplier.name, error);
          }
        }

        alert(`Import hoàn tất!\nThành công: ${successCount}\nThất bại: ${errorCount}`);
        fetchSuppliers();

      } catch (error) {
        console.error('Error importing file:', error);
        alert('Lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng file.');
      }
    };
    
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Filter suppliers based on search query
  const filteredSuppliers = suppliers.filter(supplier => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    return (
      supplier.name.toLowerCase().includes(query) ||
      supplier.code.toLowerCase().includes(query) ||
      (supplier.email && supplier.email.toLowerCase().includes(query)) ||
      (supplier.phone && supplier.phone.toLowerCase().includes(query)) ||
      (supplier.contact_person && supplier.contact_person.toLowerCase().includes(query))
    );
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSuppliers = filteredSuppliers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Fetch suppliers on mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  return {
    suppliers,
    filteredSuppliers,
    currentSuppliers,
    loading,
    currentPage,
    searchQuery,
    xlsxLoaded,
    totalPages,
    itemsPerPage,
    setSearchQuery,
    setCurrentPage,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    handleExportExcel,
    handleImportExcel
  };
}