import { ApiHelper } from '@/utils/api';
import { Order, OrderStatus } from '@/types/order';
import { ApiResponse } from '@/types/api';
interface RawOrderResponse {
  data: Order[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

export interface OrderPaginatedResponse {
  items: Order[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}
export class OrderService {
  private static readonly BASE_PATH = '/api/v1/orders/manage';

  static async getAllOrders(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    payment_status?: string;
    from_date?: string;
    to_date?: string;
  } = {}): Promise<ApiResponse<OrderPaginatedResponse>> {
    const {
      page = 1,
      limit = 15,
      search = '',
      status = '',
      payment_status = '',
      from_date = '',
      to_date = '',
    } = params;

    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(search && { search }),
      ...(status && status !== 'all' && { status }),
      ...(payment_status && payment_status !== 'all' && { payment_status }),
      ...(from_date && { from_date }),
      ...(to_date && { to_date }),
    });

    try {
      const response = await ApiHelper.get<any>(`${this.BASE_PATH}?${query.toString()}`);

      if (response.success && response.data) {
        const raw: RawOrderResponse = response.data;

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
        message: response.message || 'Không thể tải dữ liệu đơn hàng',
      };
    } catch (error: any) {
      console.error('OrderService.getAllOrders error:', error);
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

  static async getOrderById(id: string): Promise<ApiResponse<Order>> {
    return ApiHelper.get<Order>(`${this.BASE_PATH}/${id}`);
  }

  static async updateOrderStatus(id: string, status: OrderStatus): Promise<ApiResponse<Order>> {
    return ApiHelper.patch<Order>(`${this.BASE_PATH}/${id}/status`, { status });
  }
}