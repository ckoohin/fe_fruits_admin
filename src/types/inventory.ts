export interface StockCheckItem {
  id: number;
  inventory_check_id: number;
  variant_id: number;
  previous_quantity: number;
  counted_quantity: number;
  adjustment: number;
  variant_name: string;
  sku: string;
}

export interface StockCheck {
  id: number;
  branch_id: number;
  user_id: number;
  check_date: string;
  notes: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  branch_name: string;
  user_name: string;
  items?: StockCheckItem[];
}

export interface BranchStock {
  variant_id: number;
  quantity: number;
  variant_name: string;
  sku: string;
  product_name: string;
}

export interface CreateStockCheckRequest {
  branchId: number;
  notes: string;
}

export interface AddItemToCheckRequest {
  variantId: number;
  countedQuantity: number;
}

export interface UpdateItemQuantityRequest {
  countedQuantity: number;
}
