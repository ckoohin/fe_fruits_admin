export interface PostCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePostCategoryRequest {
  name: string;
  slug: string;
  description: string;
}

export interface UpdatePostCategoryRequest {
  name?: string;
}