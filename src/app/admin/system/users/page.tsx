'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { UserManagementTable } from '@/components/system/UserManagementTable';
import { useUsers } from '@/hooks/useUsers';
import { Button } from '@/components/ui/Button';

export default function UsersPage() {
  const {
    users,
    roles,
    loading,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    pagination,
    setPage,
    canViewUsers,
    fetchUsers,
  } = useUsers();

  if (!canViewUsers) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Không có quyền truy cập</CardTitle>
            <CardDescription>Bạn không có quyền xem trang này</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-5 rounded-lg shadow-sm">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select
            value={statusFilter || 'all'}
            onValueChange={(val) => setStatusFilter(val === 'all' ? undefined : val)}
          >
            <SelectTrigger className="w-[160px] bg-gray-100 border border-gray-300 text-gray-700 rounded-lg">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="1">Hoạt động</SelectItem>
              <SelectItem value="0">Ngừng hoạt động</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-xl">Danh sách người dùng</CardTitle>
            <CardDescription>
              Tổng cộng: <strong>{pagination.total}</strong> người dùng
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            Làm mới
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <UserManagementTable
              users={users}
              roles={roles}
              pagination={pagination}
              onPageChange={setPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}