// 'use client';

// import React, { useEffect, ReactNode } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAdminAuth } from '@/hook/useAdminAuth';
// import { usePermissions } from '@/hook/usePermissions';
// import { LoadingPage } from '@/components/ui';

// interface ProtectedRouteProps {
//   children: React.ReactNode;
//   requiredPermissions?: (string | number)[];
//   requiredRoles?: string[];
//   requireAll?: boolean; // true = cần tất cả quyền, false = cần ít nhất 1 quyền
//   fallbackUrl?: string;
//   fallback?: React.ReactNode;
// }

// export default function ProtectedRoute({
//   children,
//   requiredPermissions = [],
//   requiredRoles = [],
//   requireAll = false,
//   fallbackUrl = '/unauthorized',
//   fallback,
// }: ProtectedRouteProps) {
//   const router = useRouter();
//   const { isAuthenticated, isLoading, user, hasPermission, hasAnyRole } = useAdminAuth();
//   const { hasAnyPermission, hasAllPermissions } = usePermissions();

//   const hasPermissionAccess =
//     requiredPermissions.length === 0
//       ? true
//       : typeof requiredPermissions[0] === 'number'
//       ? requireAll
//         ? hasAllPermissions(requiredPermissions as number[])
//         : hasAnyPermission(requiredPermissions as number[])
//       : requireAll
//       ? (requiredPermissions as string[]).every(p => hasPermission(p))
//       : (requiredPermissions as string[]).some(p => hasPermission(p));

//   const hasRoleAccess =
//     requiredRoles.length === 0 ? true : hasAnyRole(requiredRoles);

//   const hasAccess = hasPermissionAccess && hasRoleAccess;

//   // Redirect nếu không hợp lệ
//   useEffect(() => {
//     if (!isLoading) {
//       if (!isAuthenticated) {
//         router.push('/login');
//       } else if (!hasAccess) {
//         router.push(fallbackUrl);
//       }
//     }
//   }, [isAuthenticated, isLoading, hasAccess, router, fallbackUrl]);

//   if (isLoading) {
//     return fallback || <LoadingPage text="Đang xác thực..." />;
//   }

//   if (!isAuthenticated) {
//     return null;
//   }

//   if (!hasAccess) {
//     return (
//       fallback || (
//         <div className="flex items-center justify-center min-h-screen">
//           <div className="text-center">
//             <p className="text-gray-600">Bạn không có quyền truy cập trang này</p>
//           </div>
//         </div>
//       )
//     );
//   }
//   return <>{children}</>;
// }

// export function withAuth<P extends object>(
//   Component: React.ComponentType<P>,
//   options?: {
//     requiredPermissions?: (string | number)[];
//     requiredRoles?: string[];
//     requireAll?: boolean;
//     fallbackUrl?: string;
//     fallback?: React.ReactNode;
//   }
// ) {
//   return function AuthenticatedComponent(props: P) {
//     return (
//       <ProtectedRoute
//         requiredPermissions={options?.requiredPermissions}
//         requiredRoles={options?.requiredRoles}
//         requireAll={options?.requireAll}
//         fallbackUrl={options?.fallbackUrl}
//         fallback={options?.fallback}
//       >
//         <Component {...props} />
//       </ProtectedRoute>
//     );
//   };
// }

// interface PermissionGuardProps {
//   children: ReactNode;
//   requiredPermissions?: number[];
//   requireAll?: boolean;
//   fallback?: ReactNode;
// }

// export function PermissionGuard({
//   children,
//   requiredPermissions = [],
//   requireAll = false,
//   fallback = null,
// }: PermissionGuardProps) {
//   const { hasAnyPermission, hasAllPermissions } = usePermissions();

//   const hasAccess = requireAll
//     ? hasAllPermissions(requiredPermissions)
//     : hasAnyPermission(requiredPermissions);

//   if (!hasAccess) {
//     return <>{fallback}</>;
//   }

//   return <>{children}</>;
// }


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
  const { isAuthenticated, loading, hasUserType } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (requireAuth && !isAuthenticated) {
      router.push(fallbackPath);
      return;
    }

    if (requiredUserType !== undefined && !hasUserType(requiredUserType)) {
      router.push('/unauthorized');
      return;
    }
  }, [isAuthenticated, loading, requiredUserType, hasUserType, router, requireAuth, fallbackPath]);

  if (loading) {
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