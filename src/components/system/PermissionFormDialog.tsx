'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import toast from 'react-hot-toast';

interface PermissionFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void> | void;
  permission?: Permission | null;
  isEditing?: boolean;
}

interface Permission {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export function PermissionFormDialog({
  isOpen,
  onClose,
  onSubmit,
  permission,
  isEditing = false,
}: PermissionFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });

  useEffect(() => {
    if (permission) {
      setFormData({
        name: permission.name || '',
        slug: permission.slug || '',
        description: permission.description || '',
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
      });
    }
  }, [permission]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error('Vui lòng nhập đầy đủ tên và mã quyền');
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
      if (isEditing) {
        toast.success('Quyền đã được cập nhật thành công');
      } else {
        toast.success('Quyền mới đã được thêm thành công');
      }
    } catch (error) {
      toast.error('Đã có lỗi xảy ra khi lưu quyền');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white rounded-2xl shadow-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Chỉnh sửa quyền' : 'Thêm quyền mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Cập nhật thông tin quyền trong hệ thống'
              : 'Tạo quyền truy cập mới cho hệ thống'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Tên quyền</Label>
            <Input
              id="name"
              name="name"
              placeholder="Nhập tên quyền (VD: Quản lý người dùng)"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="slug">Mã quyền (slug)</Label>
            <Input
              id="slug"
              name="slug"
              placeholder="VD: manage_users"
              value={formData.slug}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Mô tả ngắn về quyền này..."
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            className="bg-[#B5DEFF] text-[#2e0cd6] hover:bg-[#A2D3FF] active:bg-[#8EC8FF]"
          >
            {isEditing ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}