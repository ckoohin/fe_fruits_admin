'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { User } from '@/types/user';
import { Role } from '@/types/role';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UserManagementTableProps {
  users: User[];
  roles?: Role[];
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function UserManagementTable({
  users = [],
  roles = [],
  pagination,
  onPageChange,
}: UserManagementTableProps) {
  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <Badge className="bg-green-600 text-white text-xs">Hoạt động</Badge>;
      case 0:
        return <Badge className="bg-gray-500 text-white text-xs">Ngừng hoạt động</Badge>;
      case 2:
        return <Badge className="bg-red-600 text-white text-xs">Bị khóa</Badge>;
      default:
        return <Badge className="bg-yellow-500 text-white text-xs">Chờ xác thực</Badge>;
    }
  };

  const getUserRole = (roleId: number) => {
    const role = roles.find((r) => Number(r.id) === Number(roleId));
    return role ? role.name : 'Không xác định';
  };

  const handlePrev = () => {
    if (pagination.page > 1) onPageChange(pagination.page - 1);
  };

  const handleNext = () => {
    if (pagination.page < pagination.totalPages) onPageChange(pagination.page + 1);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Tên</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Điện thoại</TableHead>
                <TableHead className="font-semibold">Vai trò</TableHead>
                <TableHead className="font-semibold">Trạng thái</TableHead>
                <TableHead className="font-semibold">Ngày tạo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    Không tìm thấy người dùng nào
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-mono text-sm">{user.id}</TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>{getUserRole(Number(user.roleId))}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString('vi-VN')
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-end items-center gap-2 pt-2">
          <div className="text-sm text-gray-600 mr-4">
            Hiển thị{' '}
            <strong>
              {users.length === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1} -{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </strong>{' '}
            trong <strong>{pagination.total}</strong>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="md"
              onClick={handlePrev}
              disabled={pagination.page === 1}
              className="h-9 w-9 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? 'secondary' : 'outline'}
                    size="md"
                    onClick={() => onPageChange(pageNum)}
                    className="h-9 w-9"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={handleNext}
              disabled={pagination.page === pagination.totalPages}
              className="h-9 w-9 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}