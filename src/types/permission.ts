export interface Permission {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePermissionRequest {
  name: string;
  slug: string;
  description?: string | null;
}

export interface UpdatePermissionRequest {
  name?: string;
  slug?: string;
  description?: string | null;
}