export interface Banner {
  id: string;
  title: string;
  image: string;
  link?: string;
  position: string;
  sort_order: number;
  start_date?: string | null;
  end_date?: string | null;
  click_count: number;
  view_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBannerRequest {
  title: string;
  image: string;
  link?: string;
  position: string;
  sort_order: number;
  start_date?: string | null;
  end_date?: string | null;
  is_active: boolean;
}

export interface UpdateBannerRequest {
  title?: string;
  image?: string;
  link?: string;
  position?: string;
  sort_order?: number;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
}