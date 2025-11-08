'use client';

import { useState } from 'react';
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
        return <Badge className="bg-green-600 text-white">Hoạt động</Badge>;
      case 0:
        return <Badge className="bg-gray-500 text-white">Ngừng hoạt động</Badge>;
      case 2:
        return <Badge className="bg-red-600 text-white">Bị khóa</Badge>;
      default:
        return <Badge className="bg-yellow-500 text-white">Chờ xác thực</Badge>;
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
    if (pagination.page < pagination.totalPages)
      onPageChange(pagination.page + 1);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg overflow-hidden border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Điện thoại</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Không tìm thấy người dùng nào
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || '-'}</TableCell>
                  <TableCell>{getUserRole(user.role_id)}</TableCell>
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

      {/* --- Pagination Controls --- */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center pt-4">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={handlePrev}
          >
            Trang trước
          </Button>

          <span className="text-gray-700 text-sm">
            Trang {pagination.page} / {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            disabled={pagination.page === pagination.totalPages}
            onClick={handleNext}
          >
            Trang tiếp
          </Button>
        </div>
      )}
    </div>
  );
}