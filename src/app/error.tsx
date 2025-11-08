'use client';

import React from 'react';
import { Button } from '@/components/ui';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Đã xảy ra lỗi
          </h1>
          <p className="text-gray-600">
            Có vẻ như đã xảy ra lỗi không mong muốn. Vui lòng thử lại.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-left">
            <h3 className="text-sm font-medium text-red-800 mb-2">
              Chi tiết lỗi (Development):
            </h3>
            <pre className="text-xs text-red-700 whitespace-pre-wrap">
              {error.message}
            </pre>
            {error.digest && (
              <p className="text-xs text-red-600 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={reset}
            className="w-full"
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Thử lại
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
}
