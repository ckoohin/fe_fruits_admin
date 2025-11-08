export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: number; // 1: Active, 2: Inactive (giả định)
  branch_id: number;
  role_name: string;
  branch_name: string;
}

export interface CreateStaffRequest {
  name: string;
  email: string;
  role_id: number;
  branch_id: number;
}

export interface UpdateStaffRequest {
  name?: string;
  role_id?: number;
  status?: number;
}