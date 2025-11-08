'use client';

import { useState } from 'react';
import { Pencil, Trash2, Key } from 'lucide-react';
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
import { useToast } from '@/hooks/useToast';

interface Permission {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

interface PermissionManagementTableProps {
  permissions: Permission[];
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (permission: Permission) => void;
  onDelete: (permissionId: number) => void;
  onRefresh: () => void;
}

export function PermissionManagementTable({
  permissions,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onRefresh,
}: PermissionManagementTableProps) {
  const [deletePermissionId, setDeletePermissionId] = useState<number | null>(null);
  const { toast } = useToast();

  const handleDeleteConfirm = async () => {
    if (!deletePermissionId) return;

    try {
      await onDelete(deletePermissionId);
      toast({
        title: 'Thành công',
        description: 'Đã xóa quyền hạn thành công',
      });
      onRefresh();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa quyền hạn',
        variant: 'destructive',
      });
    } finally {
      setDeletePermissionId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tên quyền</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Ngày tạo</TableHead>
              {(canEdit || canDelete) && <TableHead>Thao tác</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Chưa có quyền hạn nào
                </TableCell>
              </TableRow>
            ) : (
              permissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell>{permission.id}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-purple-500" />
                      {permission.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{permission.slug}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(permission.created_at).toLocaleDateString('vi-VN')}
                  </TableCell>
                  {(canEdit || canDelete) && (
                    <TableCell>
                      <div className="flex gap-2">
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(permission)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletePermissionId(permission.id)}
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

      <AlertDialog
        open={deletePermissionId !== null}
        onOpenChange={() => setDeletePermissionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa quyền hạn</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa quyền hạn khỏi hệ thống. Bạn có chắc chắn muốn tiếp tục?
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