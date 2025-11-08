'use client';

import React from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {ProtectedRoute} from '@/components/auth/ProtectedRoute';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminHeader from '@/components/layout/AdminHeader';
import Breadcrumb from '@/components/layout/Breadcrumb';

interface ProductLayoutProps {
  children: React.ReactNode;
}

export default function ProductLayout({ children }: ProductLayoutProps) {
  const { user, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <AdminHeader />
          
          {/* Breadcrumb */}
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <Breadcrumb />
          </div>
          
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}