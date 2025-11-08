'use client';
import { useState, useEffect } from 'react';
import { ApiHelper } from '@/utils/api';
import { AuthUtils } from '@/utils/auth';
import { Coupon, CreateCouponRequest } from '@/types/coupon';

declare global {
  interface Window {
    XLSX: any;
  }
}

export function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
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

  // Fetch coupons
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      if (!AuthUtils.isAuthenticated()) {
        alert('Vui lòng đăng nhập');
        window.location.href = '/login';
        return;
      }
      
      const response = await ApiHelper.get<Coupon[]>('api/v1/coupons');
      
      if (response.success && response.data) {
        setCoupons(Array.isArray(response.data) ? response.data : []);
      } else {
        alert(response.message || 'Không thể tải dữ liệu khuyến mãi');
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      alert('Lỗi khi tải khuyến mãi');
    } finally {
      setLoading(false);
    }
  };

  // Delete coupon
  const deleteCoupon = async (coupon: Coupon) => {
    if (!coupon || !coupon.id) {
      alert('Dữ liệu khuyến mãi không hợp lệ');
      return;
    }
    
    if (!confirm(`Bạn có chắc muốn xóa mã khuyến mãi "${coupon.name}"?`)) return;

    try {
      const response = await ApiHelper.delete(`api/v1/coupons/${coupon.id}`);
      if (response.success) {
        alert('Xóa mã khuyến mãi thành công!');
        fetchCoupons();
      } else {
        alert('Lỗi: ' + (response.message || 'Không thể xóa mã khuyến mãi'));
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      alert('Lỗi: ' + error.message);
    }
  };

  // Create coupon
  const createCoupon = async (data: CreateCouponRequest) => {
    try {
      console.log('=== CREATE COUPON ===');
      console.log('Data:', data);
      
      const response = await ApiHelper.post('api/v1/coupons', data);
      if (response.success) {
        alert('Thêm mã khuyến mãi thành công!');
        fetchCoupons();
        return true;
      }
      alert('Lỗi: ' + (response.message || 'Không thể lưu mã khuyến mãi'));
      return false;
    } catch (error: any) {
      console.error('Create error:', error);
      alert('Lỗi: ' + error.message);
      return false;
    }
  };

  // Update coupon
  const updateCoupon = async (id: string, data: CreateCouponRequest) => {
    try {
      const updateData: any = {
        name: data.name,
        type: data.type,
        value: data.value,
        is_active: data.is_active
      };
      
      // Add optional fields only if they have values
      if (data.description?.trim()) updateData.description = data.description;
      if (data.minimum_amount) updateData.minimum_amount = data.minimum_amount;
      if (data.maximum_amount) updateData.maximum_amount = data.maximum_amount;
      if (data.usage_limit !== null) updateData.usage_limit = data.usage_limit;
      if (data.usage_limit_per_customer !== null) updateData.usage_limit_per_customer = data.usage_limit_per_customer;
      if (data.start_date) updateData.start_date = data.start_date;
      if (data.end_date) updateData.end_date = data.end_date;
      if (data.applicable_categories) updateData.applicable_categories = data.applicable_categories;
      if (data.applicable_products) updateData.applicable_products = data.applicable_products;
      
      console.log('=== UPDATE COUPON ===');
      console.log('ID:', id);
      console.log('Data:', updateData);
      
      const response = await ApiHelper.patch(`api/v1/coupons/${id}`, updateData);
      if (response.success) {
        alert('Cập nhật thành công!');
        fetchCoupons();
        return true;
      }
      alert('Lỗi: ' + (response.message || 'Không thể lưu mã khuyến mãi'));
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

    const exportData = filteredCoupons.map(coupon => ({
      'ID': coupon.id,
      'Mã KM': coupon.name,
      'Mô tả': coupon.description || '',
      'Loại': coupon.type === 'percentage' ? 'Phần trăm' : 'Số tiền cố định',
      'Giá trị': coupon.value,
      'Đơn tối thiểu': coupon.minimum_amount || '',
      'Giảm tối đa': coupon.maximum_amount || '',
      'Giới hạn sử dụng': coupon.usage_limit || '',
      'Đã dùng': coupon.used_count,
      'Giới hạn/KH': coupon.usage_limit_per_customer || '',
      'Ngày bắt đầu': coupon.start_date ? new Date(coupon.start_date).toLocaleDateString('vi-VN') : '',
      'Ngày kết thúc': coupon.end_date ? new Date(coupon.end_date).toLocaleDateString('vi-VN') : '',
      'Trạng thái': coupon.is_active ? 'Hoạt động' : 'Tạm dừng',
      'Ngày tạo': new Date(coupon.created_at).toLocaleDateString('vi-VN')
    }));

    const worksheet = window.XLSX.utils.json_to_sheet(exportData);
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, "Coupons");
    
    const colWidths = [
      { wch: 8 },   // ID
      { wch: 20 },  // Mã KM
      { wch: 40 },  // Mô tả
      { wch: 15 },  // Loại
      { wch: 12 },  // Giá trị
      { wch: 15 },  // Đơn tối thiểu
      { wch: 15 },  // Giảm tối đa
      { wch: 15 },  // Giới hạn sử dụng
      { wch: 10 },  // Đã dùng
      { wch: 12 },  // Giới hạn/KH
      { wch: 15 },  // Ngày bắt đầu
      { wch: 15 },  // Ngày kết thúc
      { wch: 12 },  // Trạng thái
      { wch: 12 }   // Ngày tạo
    ];
    worksheet['!cols'] = colWidths;

    const fileName = `coupons_${new Date().toISOString().split('T')[0]}.xlsx`;
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
        
        const importedCoupons = jsonData.map((row: any) => ({
          name: row['Mã KM'] || '',
          description: row['Mô tả'] || null,
          type: row['Loại'] === 'Phần trăm' ? 'percentage' : 'fixed_amount',
          value: row['Giá trị'] || '0',
          minimum_amount: row['Đơn tối thiểu'] || null,
          maximum_amount: row['Giảm tối đa'] || null,
          usage_limit: row['Giới hạn sử dụng'] || null,
          usage_limit_per_customer: row['Giới hạn/KH'] || null,
          start_date: row['Ngày bắt đầu'] || null,
          end_date: row['Ngày kết thúc'] || null,
          applicable_categories: null,
          applicable_products: null,
          is_active: row['Trạng thái'] === 'Hoạt động'
        }));

        if (!confirm(`Bạn có muốn import ${importedCoupons.length} mã khuyến mãi không?`)) {
          return;
        }

        let successCount = 0;
        let errorCount = 0;

        for (const coupon of importedCoupons) {
          try {
            const response = await ApiHelper.post('api/v1/coupons', coupon);
            if (response.success) {
              successCount++;
            } else {
              errorCount++;
              console.error('Error importing coupon:', coupon.name, response.message);
            }
          } catch (error) {
            errorCount++;
            console.error('Error importing coupon:', coupon.name, error);
          }
        }

        alert(`Import hoàn tất!\nThành công: ${successCount}\nThất bại: ${errorCount}`);
        fetchCoupons();

      } catch (error) {
        console.error('Error importing file:', error);
        alert('Lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng file.');
      }
    };
    
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Filter coupons based on search query
  const filteredCoupons = coupons.filter(coupon => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    return (
      coupon.name.toLowerCase().includes(query) ||
      (coupon.description && coupon.description.toLowerCase().includes(query)) ||
      coupon.type.toLowerCase().includes(query)
    );
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCoupons = filteredCoupons.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Fetch coupons on mount
  useEffect(() => {
    fetchCoupons();
  }, []);

  return {
    coupons,
    filteredCoupons,
    currentCoupons,
    loading,
    currentPage,
    searchQuery,
    xlsxLoaded,
    totalPages,
    itemsPerPage,
    setSearchQuery,
    setCurrentPage,
    fetchCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    handleExportExcel,
    handleImportExcel
  };
}