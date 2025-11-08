import { ApiHelper } from '@/utils/api';
import { DashboardStats } from '@/types/dashboard';

export class DashboardService {
  // Get dashboard statistics
  static async getDashboardStats() {
    return ApiHelper.get<DashboardStats>('api/v1/admin/dashboard/stats');
  }

  // Get recent activities
  static async getRecentActivities() {
    return ApiHelper.get('api/v1/admin/dashboard/activities');
  }

  // Get user growth data
  static async getUserGrowthData(period: 'week' | 'month' | 'year' = 'month') {
    return ApiHelper.get(`api/v1/admin/dashboard/user-growth?period=${period}`);
  }
}
