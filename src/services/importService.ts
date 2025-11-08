import { ApiHelper } from '@/utils/api';
import { 
  Import, 
  CreateImportRequest, 
  ApproveImportRequest, 
  PaymentConfirmRequest,
  ReceiveImportRequest 
} from '@/types/import';
import { ApiResponse } from '@/types/api';

export class ImportService {
  private static readonly BASE_PATH = 'api/v1/inventory/imports';

  static async getAll(page: number = 1, limit: number = 100): Promise<ApiResponse<Import[]>> {
    return ApiHelper.get<Import[]>(`${this.BASE_PATH}?page=${page}&limit=${limit}`);
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