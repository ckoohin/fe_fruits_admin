'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { useToast } from '@/hooks/useToast';
import { Loader2 } from 'lucide-react';

interface Permission {
  id: number;
  name: string;
  slug: string;
}

interface PermissionAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roleId: number;
  roleName: string;
  allPermissions: Permission[];
  assignedPermissions: Permission[];
  onAssign: (roleId: number, permissionId: number) => Promise<void>;
  onRevoke: (roleId: number, permissionId: number) => Promise<void>;
  onRefresh: () => void;
}

export function PermissionAssignmentDialog({
  isOpen,
  onClose,
  roleId,
  roleName,
  allPermissions,
  assignedPermissions,
  onAssign,
  onRevoke,
  onRefresh,
}: PermissionAssignmentDialogProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const assigned = new Set(assignedPermissions.map((p) => p.id));
      setSelectedPermissions(assigned);
    }
  }, [assignedPermissions, isOpen]);

  const handleTogglePermission = (permissionId: number) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const currentAssigned = new Set(assignedPermissions.map((p) => p.id));
      
      // Tìm quyền cần gán (có trong selected nhưng không có trong assigned)
      const toAssign = Array.from(selectedPermissions).filter(
        (id) => !currentAssigned.has(id)
      );
      
      // Tìm quyền cần thu hồi (có trong assigned nhưng không có trong selected)
      const toRevoke = Array.from(currentAssigned).filter(
        (id) => !selectedPermissions.has(id)
      );

      // Thực hiện gán quyền
      for (const permissionId of toAssign) {
        await onAssign(roleId, permissionId);
      }

      // Thực hiện thu hồi quyền
      for (const permissionId of toRevoke) {
        await onRevoke(roleId, permissionId);
      }

      toast({
        title: 'Thành công',
        description: 'Đã cập nhật quyền hạn cho vai trò',
      });
      
      onRefresh();
      onClose();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật quyền hạn',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Quản lý quyền hạn cho vai trò: {roleName}</DialogTitle>
          <DialogDescription>
            Chọn các quyền mà vai trò này có thể thực hiện
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {allPermissions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Chưa có quyền hạn nào trong hệ thống
              </p>
            ) : (
              allPermissions.map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50"
                >
                  <Checkbox
                    id={`permission-${permission.id}`}
                    checked={selectedPermissions.has(permission.id)}
                    onCheckedChange={() => handleTogglePermission(permission.id)}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`permission-${permission.id}`}
                      className="font-medium cursor-pointer"
                    >
                      {permission.name}
                    </Label>
                    <p className="text-sm text-gray-500">{permission.slug}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              'Lưu thay đổi'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}