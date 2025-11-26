'use client';
import { useState, useEffect } from 'react';
import { ApiHelper } from '@/utils/api';
import { AuthUtils } from '@/utils/auth';
import { Customer } from '@/types/customer';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    XLSX: any;
  }
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [xlsxLoaded, setXlsxLoaded] = useState(false);
  const itemsPerPage = 10;

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

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      if (!AuthUtils.isAuthenticated()) {
        toast.error('Vui lòng đăng nhập');
        window.location.href = '/login';
        return;
      }

      const response = await ApiHelper.get<any>('api/v1/customers');

      if (response.success && Array.isArray(response.data)) {
        setCustomers(response.data);
      } else if (Array.isArray(response)) {
        setCustomers(response);
      } else {
        console.error('Dữ liệu trả về không hợp lệ:', response);
        toast.error('Không thể tải danh sách khách hàng.');
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Lỗi khi tải khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (data: Partial<Customer>) => {
    try {
      const response = await ApiHelper.post('api/v1/customers', data);
      if (response.success) {
        toast.success('Thêm khách hàng thành công!');
        fetchCustomers();
      } else {
        toast.error(response.message || 'Thêm khách hàng thất bại');
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error('Không thể thêm khách hàng');
    }
  };

  const updateCustomer = async (id: string, data: Partial<Customer>) => {
    try {
      const response = await ApiHelper.put(`api/v1/customers/${id}`, data);
      if (response.success) {
        toast.success('Cập nhật khách hàng thành công!');
        fetchCustomers();
      } else {
        toast.error(response.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Không thể cập nhật khách hàng');
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) return;
    try {
      const response = await ApiHelper.delete(`api/v1/customers/${id}`);
      if (response.success) {
        
        toast.success('Xóa khách hàng thành công!');
        setCustomers(prev => prev.filter(c => c.id !== id));
      } else {
        toast.error(response.message || 'Xóa thất bại');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Không thể xóa khách hàng');
    }
  };

  const getCustomer = async (id: string): Promise<Customer | null> => {
    try {
      const response = await ApiHelper.get(`api/v1/customers/${id}`);
      if (response.success && response.data) {
        return response.data as Customer;
      } 
      // else if (response) {
      //   return response as Customer;
      // }
      return null;
    } catch (error) {
      console.error('Error fetching customer detail:', error);
      toast.error('Không thể tải thông tin khách hàng');
      return null;
    }
  };

  const handleExportExcel = () => {
    if (!window.XLSX) {
      toast.error('Đang tải thư viện Excel, vui lòng thử lại sau.');
      return;
    }

    if (customers.length === 0) {
      toast.error('Không có dữ liệu để xuất Excel.');
      return;
    }

    const exportData = filteredCustomers.map(c => ({
      'ID': c.id,
      'Tên khách hàng': c.name,
      'Email': c.email || '',
      'Số điện thoại': c.phone || '',
      'Địa chỉ': c.address || '',
      'Số đơn hàng': c.order_count ?? 0,
      'Tổng chi tiêu': c.total_spent ?? 0,
      'Ngày đơn cuối': c.last_order_date || ''
    }));

    const worksheet = window.XLSX.utils.json_to_sheet(exportData);
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

    worksheet['!cols'] = [
      { wch: 8 },
      { wch: 30 },
      { wch: 25 },
      { wch: 15 },
      { wch: 40 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 }
    ];

    const fileName = `customers_${new Date().toISOString().split('T')[0]}.xlsx`;
    window.XLSX.writeFile(workbook, fileName);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    toast.error('Chức năng import khách hàng chưa được triển khai.');
    e.target.value = '';
  };

  const filteredCustomers = customers.filter(customer => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      customer.name.toLowerCase().includes(query) ||
      (customer.email && customer.email.toLowerCase().includes(query)) ||
      (customer.phone && customer.phone.includes(query))
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    filteredCustomers,
    currentCustomers,
    loading,
    currentPage,
    searchQuery,
    xlsxLoaded,
    totalPages,
    itemsPerPage,
    setSearchQuery,
    setCurrentPage,
    fetchCustomers,
    handleExportExcel,
    handleImportExcel,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomer,
  };
}