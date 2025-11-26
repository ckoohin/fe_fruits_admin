'use client';
import { useState, useEffect } from 'react';
import { ApiHelper } from '@/utils/api';
import { AuthUtils } from '@/utils/auth';
import { Banner, CreateBannerRequest } from '@/types/banner';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    XLSX: any;
  }
}

export function useBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
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

  const fetchBanners = async () => {
    setLoading(true);
    try {
      if (!AuthUtils.isAuthenticated()) {
        toast.error('Vui lòng đăng nhập');
        window.location.href = '/login';
        return;
      }
      
      const response = await ApiHelper.get<Banner[]>('api/v1/banners/manage');
      
      if (response.success && response.data) {
        setBanners(Array.isArray(response.data) ? response.data : []);
      } else {
        toast.error(response.message || 'Không thể tải dữ liệu banner');
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Lỗi khi tải banner');
    } finally {
      setLoading(false);
    }
  };

  const deleteBanner = async (banner: Banner) => {
    if (!banner || !banner.id) {
      toast.error('Dữ liệu banner không hợp lệ');
      return;
    }
    
    if (!confirm(`Bạn có chắc muốn xóa banner "${banner.title}"?`)) return;

    try {
      const response = await ApiHelper.delete(`api/v1/banners/manage/${banner.id}`);
      if (response.success) {
       toast.success('Xóa banner thành công!');
        fetchBanners();
      } else {
        toast.error('Lỗi: ' + (response.message || 'Không thể xóa banner'));
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Lỗi: ' + error.message);
    }
  };

  
  const createBanner = async (data: CreateBannerRequest) => {
    try {
      const response = await ApiHelper.post('api/v1/banners/manage', data);
      if (response.success) {
        toast.success('Thêm banner thành công!');
        fetchBanners();
        return true;
      }
      toast.error('Lỗi: ' + (response.message || 'Không thể lưu banner'));
      return false;
    } catch (error: any) {
      console.error('Create error:', error);
      toast.error('Lỗi: ' + error.message);
      return false;
    }
  };

  const updateBanner = async (id: string, data: CreateBannerRequest) => {
    try {
      const updateData: any = {
        title: data.title,
        image: data.image,
        position: data.position,
        sort_order: data.sort_order,
        is_active: data.is_active
      };
      
      if (data.link?.trim()) {
        updateData.link = data.link;
      }
      
      if (data.start_date) {
        updateData.start_date = data.start_date;
      }
      if (data.end_date) {
        updateData.end_date = data.end_date;
      }
      
      const response = await ApiHelper.patch(`api/v1/banners/manage/${id}`, updateData);
      if (response.success) {
        toast.success('Cập nhật thành công!');
        fetchBanners();
        return true;
      }
      toast.error('Lỗi: ' + (response.message || 'Không thể lưu banner'));
      return false;
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error('Lỗi: ' + error.message);
      return false;
    }
  };

  const handleExportExcel = () => {
    if (!window.XLSX) {
      toast.loading('Đang tải thư viện Excel, vui lòng thử lại sau giây lát...');
      return;
    }

    const exportData = filteredBanners.map(banner => {
      const positionMap: { [key: string]: string } = {
        'homepage-main': 'Trang chủ - Chính',
        'homepage-sidebar': 'Trang chủ - Sidebar',
        'category-top': 'Danh mục - Top',
      };

      return {
        'ID': banner.id,
        'Tiêu Đề': banner.title,
        'Vị Trí': positionMap[banner.position] || banner.position,
        'Link': banner.link || '',
        'Hình Ảnh': banner.image || '',
        'Thứ Tự': banner.sort_order || 0,
        'Trạng Thái': banner.is_active ? 'Hoạt động' : 'Tạm dừng',
        'Ngày Tạo': new Date(banner.created_at).toLocaleDateString('vi-VN')
      };
    });

    const worksheet = window.XLSX.utils.json_to_sheet(exportData);
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, "Banner");
    
    const colWidths = [
      { wch: 8 },   // ID
      { wch: 30 },  // Tiêu Đề
      { wch: 15 },  // Vị Trí
      { wch: 40 },  // Link
      { wch: 50 },  // Hình Ảnh
      { wch: 10 },  // Thứ Tự
      { wch: 12 },  // Trạng Thái
      { wch: 12 }   // Ngày Tạo
    ];
    worksheet['!cols'] = colWidths;

    const fileName = `banner_${new Date().toISOString().split('T')[0]}.xlsx`;
    window.XLSX.writeFile(workbook, fileName);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.XLSX) {
      toast.loading('Đang tải thư viện Excel, vui lòng thử lại sau giây lát...');
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
          toast.error('File Excel trống hoặc không có dữ liệu');
          return;
        }
        
        const importedBanners = jsonData.map((row: any) => {
          const positionMap: { [key: string]: string } = {
            'Trang chủ - Chính': 'homepage-main',
            'Trang chủ - Sidebar': 'homepage-sidebar',
            'Danh mục - Top': 'category-top',
          };
          
          const excelPosition = row['Vị Trí'] || '';
          const position = positionMap[excelPosition] || 'homepage-main';

          return {
            title: row['Tiêu Đề'] || '',
            image: row['Hình Ảnh'] || '',
            link: row['Link'] || '',
            position: position,
            sort_order: Number(row['Thứ Tự']) || 0,
            is_active: row['Trạng Thái'] === 'Hoạt động'
          };
        });

        if (!confirm(`Bạn có muốn import ${importedBanners.length} banner không?`)) {
          return;
        }

        let successCount = 0;
        let errorCount = 0;

        for (const banner of importedBanners) {
          try {
            const response = await ApiHelper.post('api/v1/banners/manage', banner);
            if (response.success) {
              successCount++;
            } else {
              errorCount++;
              console.error('Error importing banner:', banner.title, response.message);
            }
          } catch (error) {
            errorCount++;
            console.error('Error importing banner:', banner.title, error);
          }
        }

        alert(`Import hoàn tất!\nThành công: ${successCount}\nThất bại: ${errorCount}`);
        fetchBanners();

      } catch (error) {
        console.error('Error importing file:', error);
        toast.error('Lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng file.');
      }
    };
    
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Filter banners based on search query
  const filteredBanners = banners.filter(banner => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    return (
      banner.title.toLowerCase().includes(query) ||
      banner.position.toLowerCase().includes(query) ||
      (banner.link && banner.link.toLowerCase().includes(query))
    );
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBanners = filteredBanners.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBanners.length / itemsPerPage);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Fetch banners on mount
  useEffect(() => {
    fetchBanners();
  }, []);

  return {
    banners,
    filteredBanners,
    currentBanners,
    loading,
    currentPage,
    searchQuery,
    xlsxLoaded,
    totalPages,
    itemsPerPage,
    setSearchQuery,
    setCurrentPage,
    fetchBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    handleExportExcel,
    handleImportExcel
  };
}