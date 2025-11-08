'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import LoginForm from '@/components/auth/LoginForm';
import { Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAdminAuth();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center">
          <div className="relative inline-flex">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <Shield className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-sm text-gray-600 font-medium">Đang kiểm tra xác thực...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600 font-medium">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-500/50 transform hover:scale-105 transition-transform duration-300">
            <Shield className="h-10 w-10 text-white" strokeWidth={2} />
          </div>
          <p className="mt-2 text-sm text-gray-600 font-medium">
            Fruits Admin Dashboard
          </p>
          <div className="mt-1 flex items-center justify-center gap-2">
            <div className="h-1 w-1 rounded-full bg-blue-600"></div>
            <div className="h-1 w-1 rounded-full bg-blue-400"></div>
            <div className="h-1 w-1 rounded-full bg-blue-300"></div>
          </div>
        </div>

        <div className="mt-8 bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
          <LoginForm />
        </div>

        <div className="text-center space-y-3">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Fruits Admin. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}