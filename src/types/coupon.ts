export interface Coupon {
  id: string;
  name: string;
  description: string | null;
  type: 'percentage' | 'fixed_amount';
  value: string;
  minimum_amount: string | null;
  maximum_amount: string | null;
  usage_limit: number | null;
  used_count: number;
  usage_limit_per_customer: number | null;
  start_date: string | null;
  end_date: string | null;
  applicable_categories: string | null;
  applicable_products: string | null;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCouponRequest {
  name: string;
  description: string | null;
  type: 'percentage' | 'fixed_amount';
  value: string;
  minimum_amount: string | null;
  maximum_amount: string | null;
  usage_limit: number | null;
  usage_limit_per_customer: number | null;
  start_date: string | null;
  end_date: string | null;
  applicable_categories: string | null;
  applicable_products: string | null;
  is_active: boolean;
}