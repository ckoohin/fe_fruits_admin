export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  order_count: number;
  total_spent: string; // "0.00"
  last_order_date: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
}