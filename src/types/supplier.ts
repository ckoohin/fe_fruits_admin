export interface Supplier {
  id: string;
  name: string;
  code: string;
  phone: string | null;
  address: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
  email: string | null;
  province: string | null;
  district: string | null;
  ward: string | null;
  contact_person: string | null;
  tax_code: string | null;
  bank_account: string | null;
  bank_name: string | null;
  deleted_at: string | null;
}

export interface CreateSupplierRequest {
  name: string;
  code: string;
  phone?: string | null;
  address?: string | null;
  email?: string | null;
  province?: string | null;
  district?: string | null;
  ward?: string | null;
  contact_person?: string | null;
  tax_code?: string | null;
  bank_account?: string | null;
  bank_name?: string | null;
  status: boolean;
}