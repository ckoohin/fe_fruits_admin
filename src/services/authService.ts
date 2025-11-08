// src/services/authService.ts
import { ApiHelper } from '@/utils/api';

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
    expires_at: string;
  };
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  password_confirmation: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export const AuthService = {
  /**
   * Gửi email quên mật khẩu
   */
  forgotPassword: async (data: ForgotPasswordRequest) => {
    try {
      const response = await ApiHelper.fetch('api/v1/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return {
        success: response.success || false,
        message: response.message || 'Gửi email thành công',
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Gửi email thất bại',
      };
    }
  },

  /**
   * Đặt lại mật khẩu
   */
  resetPassword: async (data: ResetPasswordRequest) => {
    try {
      const response = await ApiHelper.fetch('api/v1/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return {
        success: response.success || false,
        message: response.message || 'Đặt lại mật khẩu thành công',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Đặt lại mật khẩu thất bại',
      };
    }
  },

  /**
   * Kiểm tra token reset password có hợp lệ không
   */
  validateResetToken: async (token: string) => {
    try {
      const response = await ApiHelper.fetch(
        `api/v1/auth/validate-reset-token?token=${token}`,
        {
          method: 'GET',
        }
      );

      return { 
        valid: response.success || false, 
        message: response.message 
      };
    } catch (error: any) {
      return { 
        valid: false, 
        message: error.message || 'Token không hợp lệ' 
      };
    }
  },
};