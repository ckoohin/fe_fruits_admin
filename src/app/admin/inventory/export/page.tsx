'use client';
import React, { useEffect, useState } from 'react';
import ExportKanbanBoard from '@/components/inventory/ExportKanban';
import ExportDetailModal from '@/components/inventory/ExportDetailModel';
import CreateExportModal from '@/components/inventory/CreateExportModel';
import { useExports } from '@/hooks/useExport';
import { CreateExportRequest } from '@/types/export';
import { AuthUtils } from '@/utils/auth';
import { ApiHelper } from '@/utils/api';

const useUserPermissions = () => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const user = AuthUtils.getUser();
        if (!user || !user.roleId) {
          console.error('❌ User chưa login hoặc không có role');
          setPermissions([]);
          setLoading(false);
          return;
        }

        const cachedPermissions = AuthUtils.getPermissions();
        if (cachedPermissions && cachedPermissions.length > 0) {
          const slugs = cachedPermissions.map((p) => p.slug);
          setPermissions(slugs);
          console.log('✅ Loaded permissions from cache:', slugs);
        } else {
          console.log('🔄 Fetching permissions for roleId:', user.roleId);
          const response = await ApiHelper.get(`api/v1/roles/${user.roleId}/permissions`);
          if (response.success && response.data) {
            AuthUtils.setPermissions(response.data);
            const slugs = response.data.map((p: any) => p.slug);
            setPermissions(slugs);
            console.log('✅ Fetched permissions:', slugs);
          } else {
            console.error('❌ Failed to fetch permissions:', response.message);
            setPermissions([]);
          }
        }
      } catch (error) {
        console.error('❌ Error loading permissions:', error);
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
    canCreate: permissions.includes('request-transfer'),
    canCancel: permissions.includes('cancel-transfer') ,
    canReviewBranch: permissions.includes('review-branch-transfer') ,
    canReviewWarehouse: permissions.includes('review-warehouse-transfer'),
    canShip: permissions.includes('ship-transfer'),
    canReceive: permissions.includes('receive-transfer'),
  };
};

export default function ExportsPage() {
  const {
    exports,
    loading,
    selectedExport,
    showDetailModal,
    showCreateModal,
    setShowCreateModal,
    fetchExports,
    requestTransfer,
    reviewBranch,
    reviewWarehouse,
    shipTransfer,
    receiveTransfer,
    cancelExport,
    openDetailModal,
    closeDetailModal,
    getExportsByStatus,
  } = useExports();

  const { permissions, loading: loadingPermissions } = useUserPermissions();
  const { canView, canCreate, canCancel, canReviewBranch, canReviewWarehouse, canShip, canReceive } = usePermissionCheck(permissions);

  const user = AuthUtils.getUser();
  const hasValidBranch = user && user.branchId !== undefined && user.branchId !== 0;

  const handleCreateExport = async (data: CreateExportRequest): Promise<boolean> => {
    if (!canCreate) {
      alert('⚠️ Bạn không có quyền tạo yêu cầu chuyển kho');
      setShowCreateModal(false);
      return Promise.resolve(false);
    }
    console.log('Gửi yêu cầu:', data);
    try {
      const success = await requestTransfer(data);
      console.log('Kết quả requestTransfer:', success);
      if (success) {
        alert('✅ Tạo yêu cầu chuyển kho thành công');
        await fetchExports(); // Đảm bảo fetchExports là async nếu cần
      } else {
        alert('❌ Tạo yêu cầu chuyển kho thất bại. Vui lòng thử lại.');
      }
      return Promise.resolve(success);
    } catch (error) {
      console.error('❌ Lỗi khi tạo yêu cầu chuyển kho:', error);
      alert('❌ Đã xảy ra lỗi khi tạo yêu cầu chuyển kho. Vui lòng thử lại.');
      return Promise.resolve(false);
    } finally {
      setShowCreateModal(false); // Luôn đóng modal
    }
  };

  const handleCancelExport = async (id: string, reason: string) => {
    if (!canCancel) {
      alert('⚠️ Bạn không có quyền hủy yêu cầu chuyển kho');
      return;
    }
    try {
      const success = await cancelExport(id, { reason });
      if (success) {
        alert('✅ Hủy yêu cầu chuyển kho thành công');
        fetchExports();
        closeDetailModal();
      } else {
        alert('❌ Hủy yêu cầu chuyển kho thất bại');
      }
    } catch (error) {
      console.error('❌ Lỗi khi hủy yêu cầu chuyển kho:', error);
      alert('❌ Đã xảy ra lỗi khi hủy yêu cầu chuyển kho');
    }
  };

  const handleReviewBranch = async (id: string, data: { action: 'approve' | 'reject'; note?: string }) => {
    if (!canReviewBranch) {
      alert('⚠️ Bạn không có quyền duyệt yêu cầu chi nhánh');
      return;
    }
    try {
      const success = await reviewBranch(id, data);
      if (success) {
        alert('✅ Duyệt yêu cầu chi nhánh thành công');
        fetchExports();
        closeDetailModal();
      } else {
        alert('❌ Duyệt yêu cầu chi nhánh thất bại');
      }
    } catch (error) {
      console.error('❌ Lỗi khi duyệt yêu cầu chi nhánh:', error);
      alert('❌ Đã xảy ra lỗi khi duyệt yêu cầu chi nhánh');
    }
  };

  const handleReviewWarehouse = async (id: string, data: { action: 'approve' | 'reject'; note?: string }) => {
    if (!canReviewWarehouse) {
      alert('⚠️ Bạn không có quyền duyệt kho tổng');
      return;
    }
    try {
      const success = await reviewWarehouse(id, data);
      if (success) {
        alert('✅ Duyệt kho tổng thành công');
        fetchExports();
        closeDetailModal();
      } else {
        alert('❌ Duyệt kho tổng thất bại');
      }
    } catch (error) {
      console.error('❌ Lỗi khi duyệt kho tổng:', error);
      alert('❌ Đã xảy ra lỗi khi duyệt kho tổng');
    }
  };

  const handleShipTransfer = async (id: string) => {
    if (!canShip) {
      alert('⚠️ Bạn không có quyền xác nhận gửi hàng');
      return;
    }
    try {
      const success = await shipTransfer(id);
      if (success) {
        alert('✅ Xác nhận gửi hàng thành công');
        fetchExports();
        closeDetailModal();
      } else {
        alert('❌ Xác nhận gửi hàng thất bại');
      }
    } catch (error) {
      console.error('❌ Lỗi khi xác nhận gửi hàng:', error);
      alert('❌ Đã xảy ra lỗi khi xác nhận gửi hàng');
    }
  };

  const handleReceiveTransfer = async (id: string) => {
    if (!canReceive) {
      alert('⚠️ Bạn không có quyền xác nhận nhận hàng');
      return;
    }
    try {
      const success = await receiveTransfer(id);
      if (success) {
        alert('✅ Xác nhận nhận hàng thành công');
        fetchExports();
        closeDetailModal();
      } else {
        alert('❌ Xác nhận nhận hàng thất bại');
      }
    } catch (error) {
      console.error('❌ Lỗi khi xác nhận nhận hàng:', error);
      alert('❌ Đã xảy ra lỗi khi xác nhận nhận hàng');
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
          <p className="text-gray-600 mb-6">Bạn không có quyền xem trang quản lý chuyển kho</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Quản lý chuyển kho</h1>
              <p className="text-sm text-gray-500 mt-1">Quản lý yêu cầu chuyển kho giữa chi nhánh và kho tổng</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-400">Quyền:</span>
                <div className="flex flex-wrap gap-1">
                  {canCreate && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">Tạo yêu cầu</span>}
                  {canReviewBranch && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Duyệt chi nhánh</span>}
                  {canReviewWarehouse && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Duyệt kho tổng</span>}
                  {canShip && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">Gửi hàng</span>}
                  {canReceive && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">Nhận hàng</span>}
                  {canCancel && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">Hủy yêu cầu</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Tổng phiếu</p>
                  <p className="text-lg font-bold text-gray-900">{exports.length}</p>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Chờ duyệt chi nhánh</p>
                  <p className="text-lg font-bold text-yellow-600">{getExportsByStatus('branch_pending').length}</p>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Đã hoàn thành</p>
                  <p className="text-lg font-bold text-green-600">{getExportsByStatus('completed').length}</p>
                </div>
              </div>

              <button
                onClick={() => fetchExports()}
                className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                title="Làm mới"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              {canCreate && hasValidBranch && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Tạo yêu cầu chuyển kho</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ExportKanbanBoard 
        exports={exports} 
        loading={loading} 
        onCardClick={openDetailModal} 
        getExportsByStatus={getExportsByStatus} 
      />

      <ExportDetailModal
        show={showDetailModal}
        exportItem={selectedExport}
        onClose={closeDetailModal}
        onCancel={canCancel ? handleCancelExport : undefined}
        onReviewBranch={canReviewBranch ? handleReviewBranch : undefined}
        onReviewWarehouse={canReviewWarehouse ? handleReviewWarehouse : undefined}
        onShip={canShip ? handleShipTransfer : undefined}
        onReceive={canReceive ? handleReceiveTransfer : undefined}
        permissions={{ canCancel, canReviewBranch, canReviewWarehouse, canShip, canReceive }}
      />

      {canCreate && hasValidBranch && (
        <CreateExportModal 
          show={showCreateModal} 
          onClose={() => setShowCreateModal(false)} 
          onSubmit={handleCreateExport} 
        />
      )}
    </div>
  );
}