import { ApiHelper } from '@/utils/api';
import { Order, OrderStatus } from '@/types/order';
import { ApiResponse } from '@/types/api';

export class OrderService {
  private static readonly BASE_PATH = '/api/v1/orders/manage';

  static async getAllOrders(page: number = 1, limit: number = 10): Promise<ApiResponse<Order[]>> {
    return ApiHelper.get<Order[]>(`${this.BASE_PATH}?page=${page}&limit=${limit}`);
  }

  static async getOrderById(id: string): Promise<ApiResponse<Order>> {
    return ApiHelper.get<Order>(`${this.BASE_PATH}/${id}`);
  }

  static async updateOrderStatus(id: string, status: OrderStatus): Promise<ApiResponse<Order>> {
    return ApiHelper.patch<Order>(`${this.BASE_PATH}/${id}/status`, { status });
  }
}