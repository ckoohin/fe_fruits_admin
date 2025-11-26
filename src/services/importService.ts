import { ApiHelper } from '@/utils/api';
import { 
  Import, 
  CreateImportRequest, 
  ApproveImportRequest, 
  PaymentConfirmRequest,
  ReceiveImportRequest 
} from '@/types/import';
import { ApiResponse } from '@/types/api';
interface RawImportResponse {
  data: Import[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

export interface ImportPaginatedResponse {
  items: Import[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}
export class ImportService {
  private static readonly BASE_PATH = 'api/v1/inventory/imports';

  static async getAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    supplier_id?: string;
    from_date?: string;
    to_date?: string;
  } = {}): Promise<ApiResponse<ImportPaginatedResponse>> {
    const {
      page = 1,
      limit = 15,
      search = '',
      status = '',
      supplier_id = '',
      from_date = '',
      to_date = '',
    } = params;

    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(search && { search }),
      ...(status && status !== 'all' && { status }),
      ...(supplier_id && { supplier_id }),
      ...(from_date && { from_date }),
      ...(to_date && { to_date }),
    });

    try {
      const response = await ApiHelper.get<any>(`${this.BASE_PATH}?${query.toString()}`);

      if (response.success && response.data) {
        const raw: RawImportResponse = response.data;

        return {
          success: true,
          data: {
            items: Array.isArray(raw.data) ? raw.data : [],
            pagination: {
              currentPage: raw.pagination?.currentPage || page,
              totalPages: raw.pagination?.totalPages || 1,
              totalItems: raw.pagination?.totalItems || raw.data?.length || 0,
              limit: raw.pagination?.limit || limit,
            },
          },
          message: response.message || 'Thành công',
        };
      }

      return {
        success: false,
        data: {
          items: [],
          pagination: { currentPage: page, totalPages: 1, totalItems: 0, limit },
        },
        message: response.message || 'Không thể tải dữ liệu',
      };
    } catch (error: any) {
      console.error('ImportService.getAll error:', error);
      return {
        success: false,
        data: {
          items: [],
          pagination: { currentPage: page, totalPages: 1, totalItems: 0, limit },
        },
        message: error.message || 'Lỗi kết nối server',
      };
    }
  }

  static async getById(id: string): Promise<ApiResponse<Import>> {
    return ApiHelper.get<Import>(`${this.BASE_PATH}/${id}`);
  }

  static async createRequest(data: CreateImportRequest): Promise<ApiResponse<Import>> {
    return ApiHelper.post<Import>(`${this.BASE_PATH}/request`, data);
  }

  static async review(id: string, data: ApproveImportRequest): Promise<ApiResponse<Import>> {
    return ApiHelper.patch<Import>(`${this.BASE_PATH}/${id}/review`, data);
  }

  static async confirmPayment(id: string): Promise<ApiResponse<Import>> {
    return ApiHelper.patch<Import>(`${this.BASE_PATH}/${id}/payment`, {});
  }

  static async confirmReceive(id: string): Promise<ApiResponse<Import>> {
    return ApiHelper.post<Import>(`${this.BASE_PATH}/${id}/receive`, {});
  }

  static async delete(id: string): Promise<ApiResponse<void>> {
    return ApiHelper.delete(`${this.BASE_PATH}/${id}`);
  }
}