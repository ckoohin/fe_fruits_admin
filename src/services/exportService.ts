import { ApiHelper } from '@/utils/api';
import { Export, CreateExportRequest, CancelExportRequest, ReviewBranchRequest, ReviewWarehouseRequest } from '@/types/export';
import { ApiResponse } from '@/types/api';

export class ExportService {
  private static readonly BASE_PATH = 'api/v1/inventory/exports';

  static async getAll(page: number = 1, limit: number = 100): Promise<ApiResponse<Export[]>> {
    return ApiHelper.get<Export[]>(`${this.BASE_PATH}?page=${page}&limit=${limit}`);
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