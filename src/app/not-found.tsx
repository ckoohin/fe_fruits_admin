'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <FileQuestion className="w-8 h-8 text-gray-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Trang không tìm thấy
          </h1>
          <p className="text-gray-600">
            Xin lỗi, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/admin/dashboard">
            <Button className="w-full" leftIcon={<Home className="w-4 h-4" />}>
              Về trang chủ
            </Button>
          </Link>
          
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full"
          >
            Quay lại
          </Button>
        </div>
      </div>
    </div>
  );
}
