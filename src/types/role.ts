export interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  permission_count?: number;
}

export interface CreateRoleRequest {
  name: string;
  slug: string;
  description?: string | null;
}

export interface UpdateRoleRequest {
  name?: string;
  slug?: string;
  description?: string | null;
}