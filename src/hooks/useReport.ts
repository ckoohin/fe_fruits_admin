'use client';
import { useState, useEffect } from 'react';
import { ReportService } from '@/services/reportService';
import {
  RevenueOverview, RevenueByPeriod, RevenueByPaymentMethod, RevenueByProvince,
  OrderStatusCount, TopSellingProduct, RevenueByCategory, TopCustomer,
  NewCustomerTrend, StockLevel, InventoryValue, ImportHistory, ExportHistory,
  InventoryAdjustment, ReportPagination
} from '@/types/report';

export function useReports() {
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2025-12-31');
  const [loading, setLoading] = useState(false);

  const [revenueOverview, setRevenueOverview] = useState<RevenueOverview | null>(null);
  const [revenueByPeriod, setRevenueByPeriod] = useState<RevenueByPeriod[]>([]);
  const [revenueByPaymentMethod, setRevenueByPaymentMethod] = useState<RevenueByPaymentMethod[]>([]);
  const [revenueByProvince, setRevenueByProvince] = useState<RevenueByProvince[]>([]);
  const [orderStatusCounts, setOrderStatusCounts] = useState<OrderStatusCount[]>([]);
  const [topSellingProducts, setTopSellingProducts] = useState<TopSellingProduct[]>([]);
  const [revenueByCategory, setRevenueByCategory] = useState<RevenueByCategory[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [newCustomerTrend, setNewCustomerTrend] = useState<NewCustomerTrend[]>([]);
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [inventoryValue, setInventoryValue] = useState<InventoryValue | null>(null);
  const [importHistory, setImportHistory] = useState<{ data: ImportHistory[]; pagination: ReportPagination }>({ data: [], pagination: { currentPage: 1, limit: 10, totalPages: 1, totalItems: 0 } });
  const [exportHistory, setExportHistory] = useState<{ data: ExportHistory[]; pagination: ReportPagination }>({ data: [], pagination: { currentPage: 1, limit: 10, totalPages: 1, totalItems: 0 } });
  const [inventoryAdjustments, setInventoryAdjustments] = useState<{ data: InventoryAdjustment[]; pagination: ReportPagination }>({ data: [], pagination: { currentPage: 1, limit: 20, totalPages: 1, totalItems: 0 } });

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      // Gọi tất cả API song song
      const [
        overviewRes, byPeriodRes, byPaymentRes, byProvinceRes,
        statusCountRes, topProductsRes, byCategoryRes, topCustomersRes,
        newCustomerTrendRes, stockLevelsRes, inventoryValueRes,
        importHistoryRes, exportHistoryRes, inventoryAdjustmentsRes
      ] = await Promise.all([
        ReportService.getRevenueOverview(startDate, endDate),
        ReportService.getRevenueByPeriod(startDate, endDate, 'month'),
        ReportService.getRevenueByPaymentMethod(startDate, endDate),
        ReportService.getRevenueByProvince(startDate, endDate),
        ReportService.getOrderStatusCounts(startDate, endDate),
        ReportService.getTopSellingProducts(startDate, endDate, 5, 'revenue'),
        ReportService.getRevenueByCategory(startDate, endDate),
        ReportService.getTopCustomers(startDate, endDate, 5, 'revenue'),
        ReportService.getNewCustomerTrend(startDate, endDate, 'month'),
        ReportService.getStockLevels(0, false, ''),
        ReportService.getInventoryValue(0),
        ReportService.getImportHistory(startDate, endDate, 1, 10),
        ReportService.getExportHistory(startDate, endDate, 1, 10, 0, 3),
        ReportService.getInventoryAdjustments(startDate, endDate, 1, 20, 0),
      ]);

      // Xử lý dữ liệu trả về
      setRevenueOverview(overviewRes.data || null);
      setRevenueByPeriod(byPeriodRes.data || []);
      setRevenueByPaymentMethod(byPaymentRes.data || []);
      setRevenueByProvince(byProvinceRes.data || []);
      setOrderStatusCounts(statusCountRes.data || []);
      setTopSellingProducts(topProductsRes.data || []);
      setRevenueByCategory(byCategoryRes.data || []);
      setTopCustomers(topCustomersRes.data || []);
      setNewCustomerTrend(newCustomerTrendRes.data || []);
      setStockLevels(stockLevelsRes.data || []);
      setInventoryValue(inventoryValueRes.data || null);
      setImportHistory(importHistoryRes.data || { data: [], pagination: { currentPage: 1, limit: 10, totalPages: 1, totalItems: 0 } });
      setExportHistory(exportHistoryRes.data || { data: [], pagination: { currentPage: 1, limit: 10, totalPages: 1, totalItems: 0 } });
      setInventoryAdjustments(inventoryAdjustmentsRes.data || { data: [], pagination: { currentPage: 1, limit: 20, totalPages: 1, totalItems: 0 } });
    } catch (error) {
      console.error('Error fetching reports:', error);
      alert('Lỗi khi tải báo cáo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReports();
  }, [startDate, endDate]);

  return {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    loading,
    revenueOverview,
    revenueByPeriod,
    revenueByPaymentMethod,
    revenueByProvince,
    orderStatusCounts,
    topSellingProducts,
    revenueByCategory,
    topCustomers,
    newCustomerTrend,
    stockLevels,
    inventoryValue,
    importHistory,
    exportHistory,
    inventoryAdjustments,
    refetch: fetchAllReports,
  };
}