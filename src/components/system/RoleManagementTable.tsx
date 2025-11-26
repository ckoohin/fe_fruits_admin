'use client';

import { useState } from 'react';
import { Pencil, Trash2, Shield, Key } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alertDialog';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { Role } from '@/types/role';

interface RoleManagementTableProps {
  roles: Role[];
  canEdit: boolean;
  canDelete: boolean;
  canManagePermissions: boolean;
  onEdit: (role: Role) => void;
  onDelete: (roleId: string) => void;
  onManagePermissions: (role: Role) => void;
  onRefresh: () => void;
}

export function RoleManagementTable({
  roles,
  canEdit,
  canDelete,
  canManagePermissions,
  onEdit,
  onDelete,
  onManagePermissions,
  onRefresh,
}: RoleManagementTableProps) {
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    if (!deleteRoleId) return;

    try {
      await onDelete(deleteRoleId);
      toast.success('Đã xóa vai trò thành công!');
      onRefresh();
    } catch (error) {
      toast.error('Không thể xóa vai trò');
    } finally {
      setDeleteRoleId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tên vai trò</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Số quyền</TableHead>
              <TableHead>Ngày tạo</TableHead>
              {(canEdit || canDelete || canManagePermissions) && (
                <TableHead>Thao tác</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Chưa có vai trò nào
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>{role.id}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      {role.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{role.slug}</Badge>
                  </TableCell>
                  <TableCell>{role.description || '-'}</TableCell>
                  <TableCell>
                    <Badge>{role.permission_count || 0} quyền</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(role.created_at).toLocaleDateString('vi-VN')}
                  </TableCell>
                  {(canEdit || canDelete || canManagePermissions) && (
                    <TableCell>
                      <div className="flex gap-2">
                        {canManagePermissions && (
                          <Button
                            variant="ghost"
                            size="md"
                            onClick={() => onManagePermissions(role)}
                            title="Quản lý quyền"
                          >
                            <Key className="h-4 w-4 text-purple-500" />
                          </Button>
                        )}
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="md"
                            onClick={() => onEdit(role)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="md"
                            onClick={() => setDeleteRoleId(role.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteRoleId !== null} onOpenChange={() => setDeleteRoleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa vai trò</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa vai trò khỏi hệ thống. Bạn có chắc chắn muốn tiếp tục?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}