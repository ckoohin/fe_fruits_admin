
export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  description: string | null;
  image: string | null;
  sort_order: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  parent_id?: string | null;
  description?: string | null;
  image?: string | null;
  sort_order?: number;
  is_active: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  parent_id?: string | null;
  description?: string | null;
  image?: string | null;
  sort_order?: number;
  is_active?: boolean;
}