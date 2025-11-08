// 'use client';
// import { useState, useEffect } from 'react';
// import { ApiHelper } from '@/utils/api';
// import { AuthUtils } from '@/utils/auth';
// import { InventoryItem, InventoryCheck, StockRequest, CreateInventoryCheckRequest, AddCheckItemRequest } from '@/types/inventory';

// declare global {
//   interface Window {
//     XLSX: any;
//   }
// }

// export function useInventory() {
//   const [inventory, setInventory] = useState<InventoryItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [xlsxLoaded, setXlsxLoaded] = useState(false);
//   const [currentBranchId, setCurrentBranchId] = useState<number | null>(null);
//   const itemsPerPage = 10;

//   useEffect(() => {
//     if (typeof window !== 'undefined' && !window.XLSX) {
//       const script = document.createElement('script');
//       script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
//       script.onload = () => setXlsxLoaded(true);
//       document.head.appendChild(script);
//     } else if (window.XLSX) {
//       setXlsxLoaded(true);
//     }
//   }, []);

//   const fetchInventory = async (branchId?: number) => {
//     setLoading(true);
//     try {
//       if (!AuthUtils.isAuthenticated()) {
//         alert('Vui lòng đăng nhập');
//         window.location.href = '/login';
//         return;
//       }

//       // Nếu không truyền branchId, lấy từ user
//       let finalBranchId = branchId;
//       if (!finalBranchId) {
//         const user = AuthUtils.getUser();
//         finalBranchId = user?.branchId || 1;
//       }

//       setCurrentBranchId(finalBranchId);

//       const response = await ApiHelper.get<InventoryItem[]>(
//         `api/v1/inventory/branches/${finalBranchId}`
//       );
      
//       if (response.success && response.data) {
//         setInventory(Array.isArray(response.data) ? response.data : []);
//       } else {
//         alert(response.message || 'Không thể tải dữ liệu tồn kho');
//         setInventory([]);
//       }
//     } catch (error) {
//       alert('Lỗi khi tải tồn kho');
//       setInventory([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteInventoryItem = async (item: InventoryItem) => {
//     if (!confirm(`Xóa sản phẩm "${item.product_name} - ${item.variant_name}"?`)) return;
//     try {
//       const response = await ApiHelper.delete(`api/v1/inventory/${item.variant_id}`);
//       if (response.success) {
//         alert('Xóa thành công!');
//         fetchInventory(currentBranchId || undefined);
//       } else {
//         alert('Lỗi: ' + response.message);
//       }
//     } catch (error: any) {
//       alert('Lỗi: ' + error.message);
//     }
//   };

//   const createInventoryCheck = async (data: CreateInventoryCheckRequest) => {
//     try {
//       const response = await ApiHelper.post('api/v1/inventory/checks', data);
//       if (response.success) {
//         alert('Bắt đầu kiểm kê thành công!');
//         fetchInventory(currentBranchId || undefined);
//         return true;
//       }
//       alert('Lỗi: ' + response.message);
//       return false;
//     } catch (error: any) {
//       alert('Lỗi: ' + error.message);
//       return false;
//     }
//   };

//   const addCheckItem = async (checkId: number, item: AddCheckItemRequest) => {
//     try {
//       const response = await ApiHelper.post(`api/v1/inventory/checks/${checkId}/items`, item);
//       if (response.success) {
//         alert('Thêm item kiểm kê thành công!');
//         return true;
//       }
//       alert('Lỗi: ' + response.message);
//       return false;
//     } catch (error: any) {
//       alert('Lỗi: ' + error.message);
//       return false;
//     }
//   };

//   const submitStockRequest = async (data: StockRequest) => {
//     try {
//       const response = await ApiHelper.post('api/v1/inventory/stock-requests', data);
//       if (response.success) {
//         alert(`Yêu cầu ${data.type === 'import' ? 'nhập' : 'xuất'} kho thành công!`);
//         fetchInventory(currentBranchId || undefined);
//         return true;
//       }
//       alert('Lỗi: ' + response.message);
//       return false;
//     } catch (error: any) {
//       alert('Lỗi: ' + error.message);
//       return false;
//     }
//   };

//   const handleExportExcel = () => {
//     if (!window.XLSX) {
//       alert('Đang tải thư viện...');
//       return;
//     }
//     const exportData = filteredInventory.map(item => ({
//       'ID Biến thể': item.variant_id,
//       'Tên Sản phẩm': item.product_name,
//       'Biến thể': item.variant_name,
//       'SKU': item.sku,
//       'Số lượng': item.quantity
//     }));
//     const ws = window.XLSX.utils.json_to_sheet(exportData);
//     const wb = window.XLSX.utils.book_new();
//     window.XLSX.utils.book_append_sheet(wb, ws, "Tồn Kho");
//     ws['!cols'] = [{ wch: 8 }, { wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 12 }];
//     window.XLSX.writeFile(wb, `ton-kho_${new Date().toISOString().split('T')[0]}.xlsx`);
//   };

//   const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file || !window.XLSX) return;

//     const reader = new FileReader();
//     reader.onload = async (event) => {
//       try {
//         const wb = window.XLSX.read(event.target?.result, { type: 'binary' });
//         const ws = wb.Sheets[wb.SheetNames[0]];
//         const jsonData = window.XLSX.utils.sheet_to_json(ws);
        
//         if (jsonData.length === 0) {
//           alert('File trống');
//           return;
//         }

//         const importData = jsonData.map((row: any) => ({
//           variant_id: row['ID Biến thể'] || 0,
//           product_name: row['Tên Sản phẩm'] || '',
//           variant_name: row['Biến thể'] || '',
//           sku: row['SKU'] || '',
//           quantity: Number(row['Số lượng']) || 0
//         }));

//         if (!confirm(`Import ${importData.length} sản phẩm?`)) return;

//         let success = 0, error = 0;
//         for (const item of importData) {
//           try {
//             const res = await ApiHelper.post('api/v1/inventory', item);
//             if (res.success) success++;
//             else error++;
//           } catch {
//             error++;
//           }
//         }
//         alert(`Thành công: ${success}\nThất bại: ${error}`);
//         fetchInventory(currentBranchId || undefined);
//       } catch (error) {
//         alert('Lỗi đọc file');
//       }
//     };
//     reader.readAsBinaryString(file);
//     e.target.value = '';
//   };

//   const filteredInventory = inventory.filter(item => {
//     const query = searchQuery.toLowerCase().trim();
//     if (!query) return true;
//     return (
//       item.product_name.toLowerCase().includes(query) ||
//       item.variant_name.toLowerCase().includes(query) ||
//       item.sku.toLowerCase().includes(query)
//     );
//   });

//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentInventory = filteredInventory.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchQuery]);

//   // Auto load inventory khi mount (lấy từ user)
//   useEffect(() => {
//     const user = AuthUtils.getUser();
//     if (user?.branchId) {
//       fetchInventory(user.branchId);
//     }
//   }, []);

//   return {
//     inventory,
//     loading,
//     currentPage,
//     searchQuery,
//     filteredInventory,
//     currentInventory,
//     totalPages,
//     itemsPerPage,
//     xlsxLoaded,
//     currentBranchId,
//     setSearchQuery,
//     setCurrentPage,
//     fetchInventory,
//     deleteInventoryItem,
//     createInventoryCheck,
//     addCheckItem,
//     submitStockRequest,
//     handleExportExcel,
//     handleImportExcel
//   };
// }