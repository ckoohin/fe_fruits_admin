export interface RevenueOverview {
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  net_sales: number;
  total_shipping: number;
  total_discount: number;
}

export interface RevenueByPeriod {
  period: string; // e.g., "2025-09"
  revenue: number;
  order_count: number;
  [key: string]: any; // Bổ sung cho LineChart
}

export interface RevenueByPaymentMethod {
  payment_method: string;
  order_count: number;
  total_revenue: number;
  [key: string]: any; // Bổ sung cho PieChart
}

export interface RevenueByProvince {
  province: string;
  order_count: number;
  total_revenue: number;
  [key: string]: any; // Bổ sung cho BarChart
}

export interface OrderStatusCount {
  order_status: string;
  count: number;
  [key: string]: any; // Bổ sung cho PieChart (Đây là lỗi chính)
}

export interface TopSellingProduct {
  variant_id: string;
  product_name: string;
  sku: string;
  image: string | null;
  total_quantity_sold: number;
  total_revenue_generated: number;
  [key: string]: any; // Bổ sung cho BarChart
}

export interface RevenueByCategory {
  category_id: string;
  category_name: string;
  total_revenue_generated: number;
  total_quantity_sold: number;
  [key: string]: any; // Bổ sung cho PieChart
}

export interface TopCustomer {
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  total_orders: number;
  total_spent: number;
  [key: string]: any; // Bổ sung cho BarChart
}

export interface NewCustomerTrend {
  period: string;
  new_customer_count: number;
  [key: string]: any; // Bổ sung cho LineChart
}

export interface StockLevel {
  branch_id: number;
  branch_name: string;
  variant_id: number;
  sku: string;
  product_name: string;
  variant_name: string;
  quantity: number;
  min_stock: number;
  price: number;
  image: string | null;
  cost_price: number;
  updated_at: string;
}

export interface InventoryValue {
  total_inventory_value: number;
}

export interface ImportHistory {
  id: string;
  import_code: string;
  import_date: string;
  status: string;
  total_amount: number;
  supplier_name: string;
  requested_by_name: string;
}

export interface ExportHistory {
  id: string;
  export_code: string;
  export_date: string;
  status: string;
  type: number;
  total_quantity: number;
  from_branch_name: string;
  to_branch_name: string;
  created_by_name: string;
}

export interface InventoryAdjustment {
  id: string;
  adjustment_date: string;
  type: 'increase' | 'decrease';
  quantity: number;
  reason: string;
  adjusted_by: string;
}

export interface ReportPagination {
  currentPage: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}