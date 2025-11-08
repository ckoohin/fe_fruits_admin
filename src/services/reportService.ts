import { ApiHelper } from '@/utils/api';
import {
  RevenueOverview, RevenueByPeriod, RevenueByPaymentMethod, RevenueByProvince,
  OrderStatusCount, TopSellingProduct, RevenueByCategory, TopCustomer,
  NewCustomerTrend, StockLevel, InventoryValue, ImportHistory, ExportHistory,
  InventoryAdjustment, ReportPagination
} from '@/types/report';
import { ApiResponse } from '@/types/api';

export class ReportService {
  private static readonly BASE_PATH = '/api/v1/reports';

  static async getRevenueOverview(startDate: string, endDate: string): Promise<ApiResponse<RevenueOverview>> {
    return ApiHelper.get<RevenueOverview>(`${this.BASE_PATH}/revenue/overview?startDate=${startDate}&endDate=${endDate}`);
  }

  static async getRevenueByPeriod(startDate: string, endDate: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<RevenueByPeriod[]>> {
    return ApiHelper.get<RevenueByPeriod[]>(`${this.BASE_PATH}/revenue/by-period?startDate=${startDate}&endDate=${endDate}&period=${period}`);
  }

  static async getRevenueByPaymentMethod(startDate: string, endDate: string): Promise<ApiResponse<RevenueByPaymentMethod[]>> {
    return ApiHelper.get<RevenueByPaymentMethod[]>(`${this.BASE_PATH}/revenue/by-payment-method?startDate=${startDate}&endDate=${endDate}`);
  }

  static async getRevenueByProvince(startDate: string, endDate: string): Promise<ApiResponse<RevenueByProvince[]>> {
    return ApiHelper.get<RevenueByProvince[]>(`${this.BASE_PATH}/revenue/by-province?startDate=${startDate}&endDate=${endDate}`);
  }

  static async getOrderStatusCounts(startDate: string, endDate: string): Promise<ApiResponse<OrderStatusCount[]>> {
    return ApiHelper.get<OrderStatusCount[]>(`${this.BASE_PATH}/orders/status-counts?startDate=${startDate}&endDate=${endDate}`);
  }

  static async getTopSellingProducts(startDate: string, endDate: string, limit = 5, sortBy: 'revenue' | 'quantity' = 'revenue'): Promise<ApiResponse<TopSellingProduct[]>> {
    return ApiHelper.get<TopSellingProduct[]>(`${this.BASE_PATH}/products/top-selling?startDate=${startDate}&endDate=${endDate}&limit=${limit}&sortBy=${sortBy}`);
  }

  static async getRevenueByCategory(startDate: string, endDate: string): Promise<ApiResponse<RevenueByCategory[]>> {
    return ApiHelper.get<RevenueByCategory[]>(`${this.BASE_PATH}/products/revenue-by-category?startDate=${startDate}&endDate=${endDate}`);
  }

  static async getTopCustomers(startDate: string, endDate: string, limit = 5, sortBy: 'revenue' | 'orders' = 'revenue'): Promise<ApiResponse<TopCustomer[]>> {
    return ApiHelper.get<TopCustomer[]>(`${this.BASE_PATH}/customers/top?startDate=${startDate}&endDate=${endDate}&limit=${limit}&sortBy=${sortBy}`);
  }

  static async getNewCustomerTrend(startDate: string, endDate: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<NewCustomerTrend[]>> {
    return ApiHelper.get<NewCustomerTrend[]>(`${this.BASE_PATH}/customers/new-trend?startDate=${startDate}&endDate=${endDate}&period=${period}`);
  }

  static async getStockLevels(branchId = 0, lowStock = false, search = ''): Promise<ApiResponse<StockLevel[]>> {
    let url = `${this.BASE_PATH}/inventory/stock-levels?branchId=${branchId}`;
    if (lowStock) url += '&lowStock=true';
    if (search) url += `&search=${search}`;
    return ApiHelper.get<StockLevel[]>(url);
  }

  static async getInventoryValue(branchId = 0): Promise<ApiResponse<InventoryValue>> {
    return ApiHelper.get<InventoryValue>(`${this.BASE_PATH}/inventory/value?branchId=${branchId}`);
  }

  static async getImportHistory(startDate: string, endDate: string, page = 1, limit = 10): Promise<ApiResponse<{ data: ImportHistory[]; pagination: ReportPagination }>> {
    return ApiHelper.get<{ data: ImportHistory[]; pagination: ReportPagination }>(`${this.BASE_PATH}/inventory/imports?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`);
  }

  static async getExportHistory(startDate: string, endDate: string, page = 1, limit = 10, branchId = 0, type = 3): Promise<ApiResponse<{ data: ExportHistory[]; pagination: ReportPagination }>> {
    return ApiHelper.get<{ data: ExportHistory[]; pagination: ReportPagination }>(`${this.BASE_PATH}/inventory/exports?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}&branchId=${branchId}&type=${type}`);
  }

  static async getInventoryAdjustments(startDate: string, endDate: string, page = 1, limit = 20, branchId = 0): Promise<ApiResponse<{ data: InventoryAdjustment[]; pagination: ReportPagination }>> {
    return ApiHelper.get<{ data: InventoryAdjustment[]; pagination: ReportPagination }>(`${this.BASE_PATH}/inventory/adjustments?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}&branchId=${branchId}`);
  }
}