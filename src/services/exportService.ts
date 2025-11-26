import { ApiHelper } from '@/utils/api';
import { Export, CreateExportRequest, CancelExportRequest, ReviewBranchRequest, ReviewWarehouseRequest } from '@/types/export';
import { ApiResponse } from '@/types/api';
interface RawExportResponse {
  data: Export[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

export interface ExportPaginatedResponse {
  items: Export[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

export class ExportService {
  private static readonly BASE_PATH = 'api/v1/inventory/exports';

  static async getAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    branch_id?: string;
    warehouse_id?: string;
    from_date?: string;
    to_date?: string;
  } = {}): Promise<ApiResponse<ExportPaginatedResponse>> {
    const {
      page = 1,
      limit = 15,
      search = '',
      status = '',
      branch_id = '',
      warehouse_id = '',
      from_date = '',
      to_date = '',
    } = params;

    // Tạo query string
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(search && { search }),
      ...(status && status !== 'all' && { status }),
      ...(branch_id && { branch_id }),
      ...(warehouse_id && { warehouse_id }),
      ...(from_date && { from_date }),
      ...(to_date && { to_date }),
    });

    try {
      const response = await ApiHelper.get<any>(`${this.BASE_PATH}?${query.toString()}`);

      // XỬ LÝ CHÍNH XÁC cấu trúc lồng 2 lớp: response.data.data + response.data.pagination
      if (response.success && response.data) {
        const raw: RawExportResponse = response.data;

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

      // Nếu backend trả lỗi
      return {
        success: false,
        data: {
          items: [],
          pagination: { currentPage: page, totalPages: 1, totalItems: 0, limit },
        },
        message: response.message || 'Không thể tải dữ liệu',
      };
    } catch (error: any) {
      console.error('ExportService.getAll error:', error);
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

  static async getById(id: string): Promise<ApiResponse<Export>> {
    return ApiHelper.get<Export>(`${this.BASE_PATH}/${id}`);
  }

  static async requestTransfer(data: CreateExportRequest): Promise<ApiResponse<Export>> {
    return ApiHelper.post<Export>(`${this.BASE_PATH}/request-transfer`, data);
  }

  static async reviewBranch(id: string, data: ReviewBranchRequest): Promise<ApiResponse<Export>> {
    return ApiHelper.patch<Export>(`${this.BASE_PATH}/${id}/review-branch`, data);
  }

  static async reviewWarehouse(id: string, data: ReviewWarehouseRequest): Promise<ApiResponse<Export>> {
    return ApiHelper.patch<Export>(`${this.BASE_PATH}/${id}/review-warehouse`, data);
  }

  static async shipTransfer(id: string): Promise<ApiResponse<Export>> {
    return ApiHelper.post<Export>(`${this.BASE_PATH}/${id}/ship`, {});
  }

  static async receiveTransfer(id: string): Promise<ApiResponse<Export>> {
    return ApiHelper.post<Export>(`${this.BASE_PATH}/${id}/receive-shipment`, {});
  }

  static async cancelExport(id: string, data: CancelExportRequest): Promise<ApiResponse<Export>> {
    return ApiHelper.patch<Export>(`${this.BASE_PATH}/${id}/cancel-transfer`, data);
  }

  static async delete(id: string): Promise<ApiResponse<void>> {
    return ApiHelper.delete(`${this.BASE_PATH}/${id}`);
  }
}