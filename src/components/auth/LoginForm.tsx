'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { loginSchema, LoginFormData } from '@/lib/validations';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAdminAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validated = loginSchema.parse(formData);
      
      await login(validated);
    
      router.push('/admin/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.errors) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          if (err.path[0]) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      } 
      else if (error.message) {
        setErrors({ general: error.message });
      } 
      else {
        setErrors({ general: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.' });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Đăng nhập thất bại</p>
            <p className="text-sm mt-1">{errors.general}</p>
          </div>
        </div>
      )}

      <Card className="border-0 shadow-md">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-bold text-center text-gray-900">
            Đăng nhập
          </CardTitle>
          <p className="text-sm text-center text-gray-500">
            Nhập thông tin để truy cập hệ thống
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              leftIcon={<Mail className="h-4 w-4 text-gray-400" />}
              placeholder="admin@example.com"
              disabled={isLoading}
              required
              autoComplete="email"
              className="transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <Input
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              placeholder="••••••••"
              disabled={isLoading}
              required
              autoComplete="current-password"
              className="transition-all duration-200"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={isLoading}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer transition-colors"
              />
              <label 
                htmlFor="rememberMe" 
                className="ml-2 text-sm text-gray-700 cursor-pointer select-none"
              >
                Ghi nhớ đăng nhập
              </label>
            </div>
            
            <a 
              href="/forgot-password" 
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              Quên mật khẩu?
            </a>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-2">
          <Button 
            type="submit" 
            className="w-full h-11 text-base font-semibold shadow-sm hover:shadow transition-all duration-200" 
            loading={isLoading} 
            disabled={isLoading}
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </CardFooter>
      </Card>

      <p className="text-center text-xs text-gray-500">
        Bằng việc đăng nhập, bạn đồng ý với{' '}
        <a href="/terms" className="text-blue-600 hover:underline">
          Điều khoản sử dụng
        </a>{' '}
        của chúng tôi
      </p>
    </form>
  );
}