export interface Order {
  id: string;
  order_code?: string;
  order_number?: string | null;
  order_date?: string | null;
  order_status: OrderStatus;
  total_amount: string | number;
  customer_name?: string;
  customer_phone?: string;
  recipient_name?: string;
  recipient_phone?: string;
  payment_method?: string | null;
  payment_status?: string;
  customer_real_name?: string;
  shipping_address?: string;
  shipping_province?: string;
  shipping_district?: string;
  shipping_ward?: string;
  subtotal?: string;
  shipping_fee?: string;
  discount_amount?: string;
  tax_amount?: string;
  required_date?: string | null;
  shipping_status?: string;
  coupon_code?: string | null;
  notes?: string;
  internal_notes?: string | null;
  assigned_to?: string | null;
  confirmed_by?: string | null;
  confirmed_at?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
  cancel_reason?: string | null;
  created_by?: string | null;
  updated_at?: string;
  items?: OrderItem[];
  history?: OrderHistory[];
  shipment?: Shipment;
  payments?: Payment[];
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'completed' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  batch_number?: string | null;
  expiry_date?: string | null;
  image?: string[];
}

export interface OrderHistory {
  id: string;
  order_id: string;
  from_status: string | null;
  to_status: string;
  notes: string;
  changed_by: string | null;
  created_at: string;
  changed_by_name: string | null;
}

export interface Shipment {
  id: string;
  order_id: string;
  carrier_id: string | null;
  tracking_number: string;
  shipping_method: string | null;
  estimated_delivery: string | null;
  actual_delivery: string | null;
  shipping_cost: string;
  status: string;
  delivery_notes: string | null;
  carrier_code: string;
  estimated_delivery_date: string;
}

export interface Payment {
  id: string;
  order_id: string;
  payment_method: string;
  amount: number;
  transaction_id: string | null;
  gateway: string | null;
  status: string;
  payment_date: string | null;
  notes: string | null;
}

export interface Address {
  id?: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface OrderFilters {
  search?: string;
  status?: OrderStatus;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

export interface CreateOrderData {
  customerId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  shippingAddress: Address;
  billingAddress?: Address;
  notes?: string;
}