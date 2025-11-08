
export interface Branch {
  id: number;
  name: string;
  address: string;
  created_at: string;
  is_active: boolean;
}

export interface CreateBranchRequest {
  name: string;
  address: string;
  is_active: boolean;
}

export interface UpdateBranchRequest {
  name?: string;
  address?: string;
  is_active?: boolean;
}
export interface BranchInventoryItem {
  variant_id: number;
  quantity: number;
  variant_name: string;
  sku: string;
  product_name: string;
}