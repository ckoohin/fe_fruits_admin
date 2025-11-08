export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    currentPage: number;
    totalPages: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequestConfig {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
}

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}