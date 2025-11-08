'use client';
import React, { useState } from 'react';
import { Export, ReviewBranchRequest, ReviewWarehouseRequest } from '@/types/export';

interface ExportDetailModalProps {
  show: boolean;
  exportItem: Export | null;
  onClose: () => void;
  onCancel?: (id: string, reason: string) => Promise<void>;
  onReviewBranch?: (id: string, data: ReviewBranchRequest) => Promise<void>;
  onReviewWarehouse?: (id: string, data: ReviewWarehouseRequest) => Promise<void>;
  onShip?: (id: string) => Promise<void>;
  onReceive?: (id: string) => Promise<void>;
  permissions: {
    canCancel: boolean;
    canReviewBranch: boolean;
    canReviewWarehouse: boolean;
    canShip: boolean;
    canReceive: boolean;
  };
}

const InfoCard = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
    <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
    <p className="text-sm font-semibold text-gray-900">{value}</p>
  </div>
);

export default function ExportDetailModal({
  show,
  exportItem,
  onClose,
  onCancel,
  onReviewBranch,
  onReviewWarehouse,
  onShip,
  onReceive,
  permissions,
}: ExportDetailModalProps) {
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reason, setReason] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [showReviewModal, setShowReviewModal] = useState<'branch' | 'warehouse' | null>(null);

  if (!show || !exportItem) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      branch_pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ duyệt chi nhánh' },
      warehouse_pending: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Chờ duyệt kho tổng' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đang xử lý' },
      shipped: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã gửi' },
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Đã hoàn thành' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Đã hủy' },
    };
    const badge = badges[status] || badges.branch_pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getTypeLabel = (type: number) => {
    const labels: Record<number, { label: string; icon: string }> = {
      1: { label: 'Bán hàng', icon: '🛒' },
      2: { label: 'Hủy hàng', icon: '❌' },
      3: { label: 'Chuyển kho', icon: '📦' }
    };
    const typeInfo = labels[type] || { label: 'Không xác định', icon: '❓' };
    return `${typeInfo.icon} ${typeInfo.label}`;
  };

  const handleReviewSubmit = async (action: 'approve' | 'reject', type: 'branch' | 'warehouse') => {
    if (type === 'branch' && onReviewBranch) {
      await onReviewBranch(exportItem.id, { action, note: reviewNote || undefined });
    } else if (type === 'warehouse' && onReviewWarehouse) {
      await onReviewWarehouse(exportItem.id, { action, note: reviewNote || undefined });
    }
    setShowReviewModal(null);
    setReviewNote('');
  };

  const handleCancelSubmit = async () => {
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do hủy');
      return;
    }
    setShowReasonModal(false);
    await onCancel?.(exportItem.id, reason);
  };

  const showCancelButton = permissions.canCancel && exportItem.status === 'branch_pending';
  const showReviewBranchButton = permissions.canReviewBranch && exportItem.status === 'branch_pending';
  const showReviewWarehouseButton = permissions.canReviewWarehouse && exportItem.status === 'warehouse_pending';
  const showShipButton = permissions.canShip && exportItem.status === 'processing';
  const showReceiveButton = permissions.canReceive && exportItem.status === 'shipped';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">{exportItem.export_code}</h2>
              <div className="flex items-center gap-3">
                {getStatusBadge(exportItem.status)}
                <span className="text-emerald-100 text-sm">ID: #{exportItem.id}</span>
                <span className="bg-white/20 text-white px-2 py-1 rounded text-xs font-medium">
                  {getTypeLabel(exportItem.type)}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
          {/* General Info */}
          <div className="grid grid-cols-2 gap-4">
            <InfoCard label="Ngày xuất" value={formatDate(exportItem.export_date)} />
            <InfoCard label="Tổng số lượng" value={`${exportItem.total_quantity} sản phẩm`} />
            <InfoCard label="Từ chi nhánh" value={exportItem.from_branch_name || 'N/A'} />
            <InfoCard label="Đến kho" value={exportItem.to_branch_name || 'N/A'} />
            <InfoCard label="Người yêu cầu" value={exportItem.requested_by_name || 'N/A'} />
            <InfoCard label="Ngày yêu cầu" value={formatDate(exportItem.requested_at)} />
            <InfoCard label="Quản lý chi nhánh" value={exportItem.branch_manager_name || 'N/A'} />
            <InfoCard label="Ngày duyệt chi nhánh" value={formatDate(exportItem.branch_reviewed_at)} />
            <InfoCard label="Quản lý kho" value={exportItem.warehouse_manager_name || 'N/A'} />
            <InfoCard label="Ngày duyệt kho" value={formatDate(exportItem.warehouse_reviewed_at)} />
            <InfoCard label="Người gửi" value={exportItem.shipped_by_name || 'N/A'} />
            <InfoCard label="Ngày gửi" value={formatDate(exportItem.shipped_at)} />
            <InfoCard label="Người nhận" value={exportItem.received_by_name || 'N/A'} />
            <InfoCard label="Ngày nhận" value={formatDate(exportItem.received_at)} />
          </div>

          {/* Notes */}
          {exportItem.notes && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
              <p className="text-sm font-semibold text-amber-800 mb-1">Ghi chú:</p>
              <p className="text-sm text-amber-700">{exportItem.notes}</p>
            </div>
          )}

          {/* Cancellation Reason */}
          {exportItem.status === 'cancelled' && exportItem.cancellation_reason && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <p className="text-sm font-semibold text-red-800 mb-1">Lý do hủy:</p>
              <p className="text-sm text-red-700">{exportItem.cancellation_reason}</p>
            </div>
          )}

          {/* Details Table */}
          {exportItem.details && exportItem.details.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Chi tiết sản phẩm</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">SKU</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Sản phẩm</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Hình ảnh</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Số lượng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {exportItem.details.map((detail, index) => (
                      <tr key={detail.id || index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-mono text-gray-600">{detail.sku || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{detail.product_name}</div>
                          <div className="text-xs text-gray-500">{detail.variant_name}</div>
                        </td>
                        <td className="px-4 py-3">
                          {detail.variant_image ? (
                            <img
                              src={detail.variant_image}
                              alt={detail.variant_name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                          {detail.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                        Tổng cộng:
                      </td>
                      <td className="px-4 py-3 text-right text-base font-bold text-emerald-700">
                        {exportItem.total_quantity} sản phẩm
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-4">
            {showReviewBranchButton && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">📋 Duyệt yêu cầu chi nhánh</h4>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReviewModal('branch')}
                    className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Duyệt
                  </button>
                  <button
                    onClick={() => setShowReviewModal('branch')}
                    className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Từ chối
                  </button>
                </div>
              </div>
            )}

            {showReviewWarehouseButton && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">📦 Duyệt kho tổng</h4>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReviewModal('warehouse')}
                    className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Duyệt
                  </button>
                  <button
                    onClick={() => setShowReviewModal('warehouse')}
                    className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Từ chối
                  </button>
                </div>
              </div>
            )}

            {showShipButton && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3">🚚 Xác nhận gửi hàng</h4>
                <button
                  onClick={() => onShip?.(exportItem.id)}
                  className="w-full bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Gửi hàng
                </button>
              </div>
            )}

            {showReceiveButton && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3">📥 Xác nhận nhận hàng</h4>
                <button
                  onClick={() => onReceive?.(exportItem.id)}
                  className="w-full bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Nhận hàng
                </button>
              </div>
            )}

            {showCancelButton && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-3">🚫 Hủy yêu cầu chuyển kho</h4>
                <p className="text-sm text-gray-600 mb-4">Hủy yêu cầu này nếu tạo nhầm hoặc không còn cần thiết</p>
                <button
                  onClick={() => setShowReasonModal(true)}
                  className="w-full bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Hủy yêu cầu
                </button>
              </div>
            )}

            {!showCancelButton && !showReviewBranchButton && !showReviewWarehouseButton && !showShipButton && !showReceiveButton && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">
                  {exportItem.status === 'completed' ? (
                    <>✅ Yêu cầu chuyển kho đã hoàn tất</>
                  ) : exportItem.status === 'cancelled' ? (
                    <>🚫 Yêu cầu chuyển kho đã bị hủy</>
                  ) : (
                    <>📋 Không có thao tác khả dụng</>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Review Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {showReviewModal === 'branch' ? 'Duyệt yêu cầu chi nhánh' : 'Duyệt kho tổng'}
              </h3>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="Nhập ghi chú duyệt (tùy chọn)..."
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowReviewModal(null)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleReviewSubmit('approve', showReviewModal)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Duyệt
                </button>
                <button
                  onClick={() => handleReviewSubmit('reject', showReviewModal)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium transition-colors"
                >
                  Từ chối
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Reason Modal */}
        {showReasonModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lý do hủy yêu cầu</h3>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="Nhập lý do hủy..."
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowReasonModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCancelSubmit}
                  className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 font-medium transition-colors"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}