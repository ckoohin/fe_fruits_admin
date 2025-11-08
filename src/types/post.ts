export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  category_id: string | number;
  views: number;
  is_featured: boolean;
  is_published: boolean;
  published_at: string;
  seo_title: string | null;
  seo_description: string | null;
  author_id: string | number;
  created_at: string;
  updated_at: string;
  author_name: string;
  category_name: string;
}

export interface CreatePostRequest {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category_id: string | number;
  is_published: boolean;
  published_at?: string;
  tags?: number[];
}

export interface UpdatePostRequest {
  title?: string;
  is_featured?: boolean;
  tags?: number[];
}