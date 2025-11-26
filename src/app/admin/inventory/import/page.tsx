'use client';
import React, { useEffect, useState } from 'react';
import ImportKanbanBoard from '@/components/inventory/ImportKanban';
import ImportDetailModal from '@/components/inventory/ImportDetailModel';
import CreateImportModal from '@/components/inventory/CreateImportModel';
import { useImports } from '@/hooks/useImport';
import { CreateImportRequest, ApproveImportRequest } from '@/types/import';
import { AuthUtils } from '@/utils/auth';
import { ApiHelper } from '@/utils/api';
import toast from 'react-hot-toast';

const useUserPermissions = () => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const user = AuthUtils.getUser();
        if (!user || !user.roleId) {
          console.error('User chưa login hoặc không có role');
          setPermissions([]);
          setLoading(false);
          return;
        }

        const cachedPermissions = AuthUtils.getPermissions();
        if (cachedPermissions && cachedPermissions.length > 0) {
          const slugs = cachedPermissions.map((p) => p.slug);
          setPermissions(slugs);
          console.log('Loaded permissions from cache:', slugs);
        } else {
          console.log('Fetching permissions for roleId:', user.roleId);
          const response = await ApiHelper.get(`api/v1/roles/${user.roleId}/permissions`);
          if (response.success && response.data) {
            AuthUtils.setPermissions(response.data);
            const slugs = response.data.map((p: any) => p.slug);
            setPermissions(slugs);
            console.log('Fetched permissions:', slugs);
          } else {
            console.error('Failed to fetch permissions:', response.message);
            setPermissions([]);
          }
        }
      } catch (error) {
        console.error('Error loading permissions:', error);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, []);

  return { permissions, loading };
};

const usePermissionCheck = (permissions: string[]) => {
  return {
    canView: permissions.includes('view-inventory') || permissions.includes('manage-inventory'),
    canRequest: permissions.includes('request-import'),
    canApprove: permissions.includes('approve-import'),
    canManagePayment: permissions.includes('manage-payment'),
    canReceive: permissions.includes('receive-import'),
  };
};

export default function ImportsPage() {
  const {
    imports,
    loading,
    selectedImport,
    showDetailModal,
    showCreateModal,
    setShowCreateModal,
    fetchImports,
    createImportRequest,
    reviewImport,
    confirmPayment,
    confirmReceive,
    openDetailModal,
    closeDetailModal,
    getImportsByStatus,
  } = useImports();

  const { permissions, loading: loadingPermissions } = useUserPermissions();
  const { canView, canRequest, canApprove, canManagePayment, canReceive } = usePermissionCheck(permissions);

  const handleCreateImport = async (data: CreateImportRequest) => {
    if (!canRequest) {
      toast.error('Bạn không có quyền tạo yêu cầu nhập kho');
      return;
    }
    const success = await createImportRequest(data);
    if (success) {
      setShowCreateModal(false);
      fetchImports();
    }
  };

  const handleApprove = async (id: string, data: { supplier_id?: number; details: { id: number; import_quantity: number; import_price: number }[] }) => {
    if (!canApprove) {
      toast.error('Bạn không có quyền phê duyệt');
      return;
    }
    const approveData: ApproveImportRequest = {
      action: 'approve',
      supplier_id: data.supplier_id,
      details: data.details,
    };
    const success = await reviewImport(id, approveData);
    if (success) {
      closeDetailModal();
      fetchImports();
    }
  };

  const handleReject = async (id: string, reason: string) => {
    if (!canApprove) {
      toast.error('Bạn không có quyền từ chối');
      return;
    }
    const success = await reviewImport(id, { action: 'reject', note: reason });
    if (success) {
      closeDetailModal();
      fetchImports();
    }
  };

  const handleCancel = async (id: string, reason: string) => {
    if (!canApprove) {
      toast.error('Bạn không có quyền hủy');
      return;
    }
    const success = await reviewImport(id, { action: 'cancel', note: reason });
    if (success) {
      closeDetailModal();
      fetchImports();
    }
  };

  const handleConfirmPayment = async (id: string) => {
    if (!canManagePayment) {
      toast.error('Bạn không có quyền xác nhận thanh toán');
      return;
    }
    const success = await confirmPayment(id);
    if (success) {
      closeDetailModal();
      fetchImports();
    }
  };

  const handleConfirmReceive = async (id: string) => {
    if (!canReceive) {
      toast.error('Bạn không có quyền xác nhận nhận hàng');
      return;
    }
    const success = await confirmReceive(id);
    if (success) {
      closeDetailModal();
      fetchImports();
    }
  };

  if (loadingPermissions || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h2>
          <p className="text-gray-600 mb-6">Bạn không có quyền xem trang quản lý nhập kho</p>
          <a href="/admin" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 inline-block">
            Về trang chủ
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-2xl font-bold text-gray-900">Quản lý nhập kho</h4>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-400">Quyền:</span>
                <div className="flex flex-wrap gap-1">
                  {canRequest && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Phê duyệt</span>}
                  {canApprove && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">Nhận hàng</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Tổng phiếu</p>
                  <p className="text-lg font-bold text-gray-900">{imports.length}</p>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Chờ xử lý</p>
                  <p className="text-lg font-bold text-yellow-600">{getImportsByStatus('requested').length}</p>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Hoàn thành</p>
                  <p className="text-lg font-bold text-green-600">{getImportsByStatus('completed').length}</p>
                </div>
              </div>

              <button
                onClick={() => fetchImports()}
                className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                title="Làm mới"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              {canRequest && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Tạo yêu cầu nhập</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ImportKanbanBoard imports={imports} loading={loading} onCardClick={openDetailModal} getImportsByStatus={getImportsByStatus} />

      <ImportDetailModal
        show={showDetailModal}
        importItem={selectedImport}
        onClose={closeDetailModal}
        onApprove={canApprove ? handleApprove : undefined}
        onReject={canApprove ? handleReject : undefined}
        onCancel={canApprove ? handleCancel : undefined}
        onConfirmPayment={canManagePayment ? handleConfirmPayment : undefined}
        onConfirmReceive={canReceive ? handleConfirmReceive : undefined}
        permissions={{ canApprove, canManagePayment, canReceive }}
      />

      {canRequest && <CreateImportModal show={showCreateModal} onClose={() => setShowCreateModal(false)} onSubmit={handleCreateImport} />}
    </div>
  );
}