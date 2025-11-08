import { API_CONFIG } from './constants';
import { ApiResponse, PaginatedResponse, UploadResponse } from '@/types/api';

class AdminApiError extends Error {
  public status?: number;
  public code?: string;
  public details?: any;

  constructor(message: string, status?: number, code?: string, details?: any) {
    super(message);
    this.name = 'AdminApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

class AdminApi {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const token = this.getAuthToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const text = await response.text();
        let errorData = {};
        try {
          errorData = text ? JSON.parse(text) : {};
        } catch {
          errorData = {};
        }

        let errorMessage =
          (errorData as any).message ||
          `HTTP ${response.status}: ${response.statusText}`;

        if (response.status === 401) {
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          this.removeAuthToken();
        } else if (response.status === 403) {
          errorMessage = 'Bạn không có quyền truy cập tài nguyên này.';
        } else if (response.status === 404) {
          errorMessage = 'Không tìm thấy tài nguyên.';
        } else if (response.status === 500) {
          errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
        }

        throw new AdminApiError(
          errorMessage,
          response.status,
          (errorData as any).code,
          errorData
        );
      }

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      return data;
    } catch (error) {
      if (error instanceof AdminApiError) throw error;

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new AdminApiError('Yêu cầu quá thời gian chờ', 408);
        }
        throw new AdminApiError(error.message, 0);
      }

      throw new AdminApiError('Đã xảy ra lỗi không xác định', 0);
    }
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_token');
    }
    return null;
  }

  private removeAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
  }

  async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category_id?: number;
    status?: string;
  }): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category_id) queryParams.append('category_id', params.category_id.toString());
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    const response = await this.request<PaginatedResponse<any>>(
      `/v1/products${query ? `?${query}` : ''}`
    );

    return response;
  }

  async getProduct(id: number): Promise<ApiResponse<any>> {
    return this.request(`/v1/products/${id}`);
  }

  async createProduct(data: any): Promise<ApiResponse<any>> {
    return this.request('/v1/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: number, data: any): Promise<ApiResponse<any>> {
    return this.request(`/v1/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: number): Promise<ApiResponse<void>> {
    return this.request(`/v1/products/${id}`, {
      method: 'DELETE',
    });
  }

  async getProductVariants(productId: number): Promise<ApiResponse<any[]>> {
    return this.request(`/v1/products/${productId}/variants`);
  }

  async createProductVariant(productId: number, data: any): Promise<ApiResponse<any>> {
    return this.request(`/v1/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProductVariant(productId: number, variantId: number, data: any): Promise<ApiResponse<any>> {
    return this.request(`/v1/products/${productId}/variants/${variantId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProductVariant(productId: number, variantId: number): Promise<ApiResponse<void>> {
    return this.request(`/v1/products/${productId}/variants/${variantId}`, {
      method: 'DELETE',
    });
  }

  async bulkAction(ids: string[], action: string) {
    return this.request('/v1/products/bulk', {
      method: 'POST',
      body: JSON.stringify({ ids, action }),
    });
  }

  async exportProducts(): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/v1/products/export`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new AdminApiError(`Lỗi xuất Excel: ${response.statusText}`, response.status);
    }

    return await response.blob(); 
  }

  async getCategories(): Promise<ApiResponse<any[]>> {
    return this.request('/v1/categories');
  }

  async getCategory(id: number): Promise<ApiResponse<any>> {
    return this.request(`/v1/categories/${id}`);
  }

  async createCategory(data: any): Promise<ApiResponse<any>> {
    return this.request('/v1/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: number, data: any): Promise<ApiResponse<any>> {
    return this.request(`/v1/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: number): Promise<ApiResponse<void>> {
    return this.request(`/v1/categories/${id}`, {
      method: 'DELETE',
    });
  }

  async getCustomers(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    const response = await this.request<PaginatedResponse<any>>(`/v1/customers${query ? `?${query}` : ''}`);
    return response.data;
  }

  async getCustomer(id: number): Promise<ApiResponse<any>> {
    return this.request(`/v1/customers/${id}`);
  }

  async createCustomer(data: any): Promise<ApiResponse<any>> {
    return this.request('/v1/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCustomer(id: number, data: any): Promise<ApiResponse<any>> {
    return this.request(`/v1/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCustomer(id: number): Promise<ApiResponse<void>> {
    return this.request(`/v1/customers/${id}`, {
      method: 'DELETE',
    });
  }

  async getInventory(params?: {
    page?: number;
    limit?: number;
    search?: string;
    product_id?: number;
  }): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.product_id) queryParams.append('product_id', params.product_id.toString());

    const query = queryParams.toString();
    const response = await this.request<PaginatedResponse<any>>(`/v1/inventory${query ? `?${query}` : ''}`);
    return response.data;
  }

  async updateInventory(id: number, data: any): Promise<ApiResponse<any>> {
    return this.request(`/v1/inventory/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getSuppliers(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    const response = await this.request<PaginatedResponse<any>>(`/v1/suppliers${query ? `?${query}` : ''}`);
    return response.data;
  }

  async getSupplier(id: number): Promise<ApiResponse<any>> {
    return this.request(`/v1/suppliers/${id}`);
  }

  async createSupplier(data: any): Promise<ApiResponse<any>> {
    return this.request('/v1/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSupplier(id: number, data: any): Promise<ApiResponse<any>> {
    return this.request(`/v1/suppliers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteSupplier(id: number): Promise<ApiResponse<void>> {
    return this.request(`/v1/suppliers/${id}`, {
      method: 'DELETE',
    });
  }

  async getReports(params?: {
    type?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const query = queryParams.toString();
    return this.request(`/v1/users${query ? `?${query}` : ''}`);
  }

  async getDashboardStats(): Promise<ApiResponse<any>> {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const end = today.toISOString().split('T')[0];

    return this.request(`/v1/reports/daily-sales?startDate=${start}&endDate=${end}`);
  }


  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const token = this.getAuthToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (onProgress) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response.data);
            } catch (error) {
              reject(new AdminApiError('Invalid response format', xhr.status));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new AdminApiError(
                errorData.message || 'Upload failed',
                xhr.status,
                errorData.code
              ));
            } catch {
              reject(new AdminApiError('Upload failed', xhr.status));
            }
          }
        });

        xhr.addEventListener('error', () => {
          reject(new AdminApiError('Network error during upload', 0));
        });

        xhr.open('POST', `${this.baseURL}/v1/uploads`);
        
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        xhr.send(formData);
      });
    }

    const response = await this.request<UploadResponse>('/v1/uploads', {
      method: 'POST',
      headers,
      body: formData,
    });

    return response.data;
  }

  async getUnits(): Promise<ApiResponse<any[]>> {
    return this.request('/v1/units');
  }

  async getSettings(): Promise<ApiResponse<any>> {
    return this.request('/v1/settings');
  }

  async updateSettings(data: any): Promise<ApiResponse<any>> {
    return this.request('/v1/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getOrders(params?: {
    page?: number;
    limit?: number;
    search?: string;
    order_status?: string;
    payment_status?: string;
    payment_method?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.order_status) queryParams.append('order_status', params.order_status);
    if (params?.payment_status) queryParams.append('payment_status', params.payment_status);
    if (params?.payment_method) queryParams.append('payment_method', params.payment_method);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const query = queryParams.toString();
    const response = await this.request<PaginatedResponse<any>>(`/v1/orders${query ? `?${query}` : ''}`);
    return response.data;
  }

  async getOrder(id: number): Promise<ApiResponse<any>> {
    return this.request(`/v1/orders/${id}`);
  }

  async updateOrderStatus(id: number, data: {
    order_status?: string;
    payment_status?: string;
    notes?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`/v1/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getOrderItems(orderId: number): Promise<ApiResponse<any[]>> {
    return this.request(`/v1/orders/${orderId}/items`);
  }

  async getOrderStatusHistory(orderId: number): Promise<ApiResponse<any[]>> {
    return this.request(`/v1/orders/${orderId}/status-history`);
  }

  async cancelOrder(id: number, reason?: string): Promise<ApiResponse<void>> {
    return this.request(`/v1/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role_id?: number;
    status?: string;
  }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role_id) queryParams.append('role_id', params.role_id.toString());
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    const response = await this.request<any[]>(
      `/v1/users${query ? `?${query}` : ''}`
    );
    return response.data;
  }

  async getUser(id: number): Promise<ApiResponse<any>> {
    return this.request(`/v1/users/${id}`);
  }

  async createUser(data: any): Promise<ApiResponse<any>> {
    return this.request('/v1/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: number, data: any): Promise<ApiResponse<any>> {
    return this.request(`/v1/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: number): Promise<ApiResponse<void>> {
    return this.request(`/v1/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getStaffList(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    const response = await this.request<PaginatedResponse<any>>(
      `/v1/staff${query ? `?${query}` : ''}`
    );
    return response.data;
  }

  async getStaff(id: number): Promise<ApiResponse<any>> {
    return this.request(`/v1/staff/${id}`);
  }

  async createStaff(data: {
    name: string;
    email: string;
    role_id: number;
    branch_id?: number;
  }): Promise<ApiResponse<any>> {
    return this.request('/v1/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStaff(
    id: number,
    data: Partial<{ name: string; email: string; role_id: number; branch_id: number; status: number }>
  ): Promise<ApiResponse<any>> {
    return this.request(`/v1/staff/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteStaff(id: number): Promise<ApiResponse<void>> {
    return this.request(`/v1/staff/${id}`, {
      method: 'DELETE',
    });
  }
}

export const adminApi = new AdminApi();
export { AdminApiError };