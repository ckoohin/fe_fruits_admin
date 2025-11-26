export interface ImportDetail {
  id?: string;
  import_id?: string;
  product_id: number;
  variant_id: number;
  import_quantity: number;
  import_price?: number;
  manufacture_date?: string | null;
  expiry_date?: string | null;
  lot_number?: string | null;
  product_name?: string;
  variant_name?: string;
  sku?: string;
}

export interface Import {
  id: string;
  import_code: string;
  supplier_id: string | null;
  import_date: string;
  total_amount: string;
  status: ImportStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  paid_amount: string;
  note: string | null;
  requested_by: string | null;
  requested_at: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  payment_status?: 'unpaid' | 'partial' | 'paid' | null;
  received_by?: string | null; // Thêm trường người nhận hàng
  received_at?: string | null; // Thêm trường thời gian nhận hàng
  supplier_name: string | null;
  requested_by_name: string | null; // Thêm tên người yêu cầu
  approved_by_name: string | null; // Thêm tên người phê duyệt
  received_by_name: string | null; // Thêm tên người nhận hàng
  details?: ImportDetail[];
  rejection_reason?: string | null; // Lý do từ chối/hủy
}

export type ImportStatus = 
  | 'requested'    // Chờ xử lý
  | 'approved'     // Đã phê duyệt
  | 'paid'         // Đã thanh toán
  | 'completed'    // Đã nhận hàng
  | 'rejected'     // Từ chối
  | 'cancelled';   // Hủy

export interface KanbanColumn {
  id: ImportStatus;
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface CreateImportRequest {
  import_code: string;
  note?: string;
  details: {
    product_id: number;
    variant_id: number;
    import_quantity: number;
  }[];
}

export interface ApproveImportRequest {
  action: 'approve' | 'reject' | 'cancel';
  supplier_id?: number;
  reason?: string; // Lý do cho mọi hành động
  note?: string;
  details?: {
    id: number;
    import_quantity: number;
    import_price: number;
  }[];
}

export interface PaymentConfirmRequest {
  paid_amount?: number;
  payment_method?: string;
  payment_note?: string;
  reason?: string; // Lý do khi xác nhận thanh toán (có thể giữ hoặc bỏ tùy nhu cầu)
}

export interface ReceiveImportRequest {
  received_note?: string;
  reason?: string; // Lý do khi xác nhận nhận hàng (có thể giữ hoặc bỏ tùy nhu cầu)
}