"use client";

import { useState, useEffect } from "react";
import { Shield, Key, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { RoleManagementTable } from "@/components/system/RoleManagementTable";
import { RoleFormDialog } from "@/components/system/RoleFormDialog";
import { PermissionManagementTable } from "@/components/system/PermissionManagementTable";
import { PermissionFormDialog } from "@/components/system/PermissionFormDialog";
import { PermissionAssignmentDialog } from "@/components/system/PermissionAssignmentDialog";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useRoles } from "@/hooks/useRole";
import { usePermissions } from "@/hooks/usePermission";
import { Role } from "@/types/role";
import { Permission } from "@/types/permission";
import toast from "react-hot-toast";

export default function RolesPage() {
  const { hasPermission } = useAdminAuth();

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
    currentPage,
    totalPages,
    itemsPerPage,
    searchQuery,
    currentPermissions,
    filteredPermissions,
    setCurrentPage,
    setSearchQuery,
    fetchPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    loading: loadingPermissions,
  } = usePermissions();

  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null
  );
  const [managingRole, setManagingRole] = useState<Role | null>(null);
  const [assignedPermissions, setAssignedPermissions] = useState<Permission[]>(
    []
  );

  const canManageRoles = hasPermission("manage-roles");
  const canManagePermissions = hasPermission("manage-permissions");

  useEffect(() => {
    if (!canManageRoles && !canManagePermissions) {
      toast.error('Bạn không có quyền truy cập trang này');
      return;
    }
    fetchRoles();
    fetchPermissions();
  }, [canManageRoles, canManagePermissions]);

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
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
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
                  <CardDescription>
                    Tổng số: {roles.length} vai trò
                  </CardDescription>
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
                  onDelete={(roleId) => {
                    const role = roles?.find(r => r.id === String(roleId));
                    if (role) deleteRole(role);
                  }}
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
                  permissions={currentPermissions}
                  canEdit={canManagePermissions}
                  canDelete={canManagePermissions}
                  onEdit={(permission) => {
                    setEditingPermission(permission);
                    setIsPermissionDialogOpen(true);
                  }}
                  onDelete={(permissionId) => deletePermission(Number(permissionId))}
                  onRefresh={fetchPermissions}
                />
              )}
            </CardContent>
            <div className="p-4 flex justify-between items-center border-t border-gray-200 bg-gray-50">
              <span className="text-sm text-gray-600 font-medium">
                {searchQuery ? (
                  <>
                    Tìm thấy {filteredPermissions.length} / {permissions.length}{" "}
                    quyền
                  </>
                ) : (
                  <>Tổng: {permissions.length} quyền</>
                )}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          currentPage === page
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-gray-700 hover:bg-white"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
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
          onAssign={async (roleId, permissionId) => void await assignPermissionToRole(roleId, permissionId)}
          onRevoke={async (roleId, permissionId) => void await revokePermissionFromRole(roleId, permissionId)}
          onRefresh={fetchRoles}
        />
      )}
    </div>
  );
}
