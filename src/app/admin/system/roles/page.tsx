'use client';

import { useState, useEffect } from 'react';
import { Shield, Key, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useToast } from '@/hooks/useToast';
import { RoleManagementTable } from '@/components/system/RoleManagementTable';
import { RoleFormDialog } from '@/components/system/RoleFormDialog';
import { PermissionManagementTable } from '@/components/system/PermissionManagementTable';
import { PermissionFormDialog } from '@/components/system/PermissionFormDialog';
import { PermissionAssignmentDialog } from '@/components/system/PermissionAssignmentDialog';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useRoles } from '@/hooks/useRole';
import { usePermissions } from '@/hooks/usePermission';
import { Role } from '@/types/role';
import { Permission } from '@/types/permission';

export default function RolesPage() {
  const { toast } = useToast();
  const { hasPermission } = useAdminAuth();

  // ✅ Hooks dữ liệu
  const {
    roles,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    assignPermissionToRole,
    revokePermissionFromRole,
    getRolePermissions,
    loading: loadingRoles,
  } = useRoles();

  const {
    permissions,
    fetchPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    loading: loadingPermissions,
  } = usePermissions();

  // ✅ UI state
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [managingRole, setManagingRole] = useState<Role | null>(null);
  const [assignedPermissions, setAssignedPermissions] = useState<Permission[]>([]);

  const canManageRoles = hasPermission('manage-roles');
  const canManagePermissions = hasPermission('manage-permissions');

  useEffect(() => {
    if (!canManageRoles && !canManagePermissions) {
      toast({
        title: 'Không có quyền truy cập',
        description: 'Bạn không có quyền xem trang này',
        variant: 'destructive',
      });
      return;
    }
    fetchRoles();
    fetchPermissions();
  }, [canManageRoles, canManagePermissions]);

  // ✅ Mở dialog gán quyền
  const openManagePermissions = async (role: Role) => {
    setManagingRole(role);
    const data = await getRolePermissions(role.id.toString());
    setAssignedPermissions(data || []);
    setIsAssignDialogOpen(true);
  };

  if (!canManageRoles && !canManagePermissions) {
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
    <div className="container mx-auto space-y-6">
      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles" disabled={!canManageRoles}>
            <Shield className="mr-2 h-4 w-4" />
            Vai trò
          </TabsTrigger>
          <TabsTrigger value="permissions" disabled={!canManagePermissions}>
            <Key className="mr-2 h-4 w-4" />
            Quyền hạn
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Quản lý vai trò</CardTitle>
                  <CardDescription>Tổng số: {roles.length} vai trò</CardDescription>
                </div>
                {canManageRoles && (
                  <Button onClick={() => setIsRoleDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo vai trò mới
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {loadingRoles ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <RoleManagementTable
                  roles={roles}
                  canEdit={canManageRoles}
                  canDelete={canManageRoles}
                  canManagePermissions={canManagePermissions}
                  onEdit={(role) => {
                    setEditingRole(role);
                    setIsRoleDialogOpen(true);
                  }}
                  onDelete={deleteRole}
                  onManagePermissions={openManagePermissions}
                  onRefresh={fetchRoles}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Quản lý quyền hạn</CardTitle>
                  <CardDescription>
                    Tổng số: {permissions.length} quyền hạn
                  </CardDescription>
                </div>
                {canManagePermissions && (
                  <Button onClick={() => setIsPermissionDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo quyền hạn mới
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {loadingPermissions ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <PermissionManagementTable
                  permissions={permissions}
                  canEdit={canManagePermissions}
                  canDelete={canManagePermissions}
                  onEdit={(permission) => {
                    setEditingPermission(permission);
                    setIsPermissionDialogOpen(true);
                  }}
                  onDelete={deletePermission}
                  onRefresh={fetchPermissions}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <RoleFormDialog
        isOpen={isRoleDialogOpen}
        onClose={() => {
          setIsRoleDialogOpen(false);
          setEditingRole(null);
        }}
        onSubmit={async (data) => {
          if (editingRole) await updateRole(editingRole.id.toString(), data);
          else await createRole(data);
        }}
        role={editingRole}
        isEditing={!!editingRole}
      />

      <PermissionFormDialog
        isOpen={isPermissionDialogOpen}
        onClose={() => {
          setIsPermissionDialogOpen(false);
          setEditingPermission(null);
        }}
        onSubmit={async (data) => {
          if (editingPermission)
            await updatePermission(editingPermission.id.toString(), data);
          else await createPermission(data);
        }}
        permission={editingPermission}
        isEditing={!!editingPermission}
      />

      {managingRole && (
        <PermissionAssignmentDialog
          isOpen={isAssignDialogOpen}
          onClose={() => {
            setIsAssignDialogOpen(false);
            setManagingRole(null);
            setAssignedPermissions([]);
          }}
          roleId={managingRole.id}
          roleName={managingRole.name}
          allPermissions={permissions}
          assignedPermissions={assignedPermissions}
          onAssign={assignPermissionToRole}
          onRevoke={revokePermissionFromRole}
          onRefresh={fetchRoles}
        />
      )}
    </div>
  );
}
