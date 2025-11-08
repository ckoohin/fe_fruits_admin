export interface ExportDetail {
  id?: string;
  export_id?: string;
  product_id: number;
  variant_id: number;
  quantity: number;
  product_name?: string;
  variant_name?: string;
  sku?: string;
  variant_image?: string;
}

export interface Export {
  id: string;
  export_code: string;
  type: ExportType;
  reference_id: string | null;
  export_date: string | null;
  total_quantity: number;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  status: ExportStatus;
  to_branch_id: number | null;
  from_branch_id: string;
  requested_by: string | null;
  requested_at: string | null;
  branch_manager_id: string | null;
  branch_reviewed_at: string | null;
  warehouse_manager_id: string | null;
  warehouse_reviewed_at: string | null;
  shipped_by: string | null;
  shipped_at: string | null;
  received_by: string | null;
  received_at: string | null;
  requested_by_name: string | null;
  branch_manager_name: string | null;
  warehouse_manager_name: string | null;
  shipped_by_name: string | null;
  received_by_name: string | null;
  from_branch_name: string;
  to_branch_name: string | null;
  details?: ExportDetail[];
  cancellation_reason?: string | null;
}

export type ExportType = 1 | 2 | 3; // 1: Bán hàng, 2: Hủy hàng, 3: Chuyển kho

export type ExportStatus =
  | 'branch_pending'    // Chờ duyệt chi nhánh
  | 'warehouse_pending' // Chờ duyệt kho tổng
  | 'processing'        // Đang xử lý
  | 'shipped'           // Đã gửi
  | 'completed'         // Đã hoàn thành
  | 'cancelled';        // Đã hủy

export interface KanbanColumn {
  id: ExportStatus;
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface CreateExportRequest {
  from_branch_id: number;
  notes?: string;
  details: {
    product_id: number;
    variant_id: number;
    quantity: number;
  }[];
}

export interface ReviewBranchRequest {
  action: 'approve' | 'reject';
  note?: string;
}

export interface ReviewWarehouseRequest {
  action: 'approve' | 'reject';
  note?: string;
}

export interface CancelExportRequest {
  reason: string;
}