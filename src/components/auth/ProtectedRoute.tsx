'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredUserType?: number;
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredUserType,
  fallbackPath = '/login'
}) => {
  const { isAuthenticated, isLoading, hasUserType } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      router.push(fallbackPath);
      return;
    }

    if (requiredUserType !== undefined && !hasUserType(requiredUserType)) {
      router.push('/unauthorized');
      return;
    }
  }, [isAuthenticated, isLoading, requiredUserType, hasUserType, router, requireAuth, fallbackPath]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (requiredUserType !== undefined && !hasUserType(requiredUserType)) {
    return null;
  }

  return <>{children}</>;
};