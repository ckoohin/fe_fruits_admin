'use client';
import React, { useState, useEffect } from 'react';
import { Import } from '@/types/import';
import { ApiHelper } from '@/utils/api';

interface ImportDetailModalProps {
  show: boolean;
  importItem: Import | null;
  onClose: () => void;
  onApprove?: (id: string, data: { supplier_id?: number; details: { id: number; import_quantity: number; import_price: number }[] }) => Promise<void>;
  onReject?: (id: string, reason: string) => Promise<void>;
  onCancel?: (id: string, reason: string) => Promise<void>;
  onConfirmPayment?: (id: string) => Promise<void>; // Loại bỏ reason
  onConfirmReceive?: (id: string) => Promise<void>; // Loại bỏ reason
  permissions: {
    canApprove: boolean;
    canManagePayment: boolean;
    canReceive: boolean;
  };
}

const InfoCard = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
    <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
    <p className="text-sm font-semibold text-gray-900">{value}</p>
  </div>
);

export default function ImportDetailModal({
  show,
  importItem,
  onClose,
  onApprove,
  onReject,
  onCancel,
  onConfirmPayment,
  onConfirmReceive,
  permissions,
}: ImportDetailModalProps) {
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reason, setReason] = useState('');
  const [action, setAction] = useState<'reject' | 'cancel'>('reject');
  const [suppliers, setSuppliers] = useState<{ id: number; name: string }[]>([]);
  const [approveData, setApproveData] = useState<{
    supplier_id?: number;
    details: { id: number; import_quantity: number; import_price: number }[];
  }>({ supplier_id: undefined, details: [] });

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await ApiHelper.get('/api/v1/suppliers');
        if (response.success && response.data) {
          setSuppliers(response.data);
        }
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (importItem && importItem.details) {
      setApproveData({
        supplier_id: importItem.supplier_id ? Number(importItem.supplier_id) : undefined,
        details: importItem.details.map(d => ({
          id: Number(d.id),
          import_quantity: d.import_quantity,
          import_price: d.import_price || 0
        }))
      });
    }
  }, [importItem]);

  if (!show || !importItem) return null;

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Number(amount));
  };

  const formatDate = (dateString: string) => {
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
      requested: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ xử lý' },
      approved: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đã phê duyệt' },
      paid: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Đã thanh toán' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã nhận hàng' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Từ chối' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Đã hủy' },
    };
    const badge = badges[status] || badges.requested;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const openReasonModal = (actionType: 'reject' | 'cancel') => {
    setAction(actionType);
    setReason('');
    setShowReasonModal(true);
  };

  const handleReasonSubmit = async () => {
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do');
      return;
    }
    setShowReasonModal(false);
    if (action === 'reject') {
      await onReject?.(importItem.id, reason);
    } else if (action === 'cancel') {
      await onCancel?.(importItem.id, reason);
    }
  };

  const handleApprove = async () => {
    if (!approveData.supplier_id || approveData.details.some(d => d.import_price <= 0)) {
      alert('Vui lòng chọn nhà cung cấp và nhập giá hợp lệ');
      return;
    }
    await onApprove?.(importItem.id, approveData);
  };

  const handleConfirmPayment = async () => {
    await onConfirmPayment?.(importItem.id);
  };

  const handleConfirmReceive = async () => {
    await onConfirmReceive?.(importItem.id);
  };

  const handleDetailChange = (index: number, field: 'import_price', value: string) => {
    const newDetails = [...approveData.details];
    newDetails[index] = { ...newDetails[index], [field]: Number(value) };
    setApproveData({ ...approveData, details: newDetails });
  };

  // Điều chỉnh logic hiển thị nút dựa trên payment_status
  const showApproveSection = permissions.canApprove && importItem.status === 'requested';
  const showCancelSection = permissions.canApprove && importItem.status === 'requested';
  const showPaymentSection = permissions.canManagePayment && importItem.status === 'approved' && (importItem.payment_status === 'unpaid' || !importItem.payment_status);
  const showReceiveSection = permissions.canReceive && importItem.payment_status === 'paid' && !importItem.received_by;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">{importItem.import_code}</h2>
              <div className="flex items-center gap-3">
                {getStatusBadge(importItem.status)}
                <span className="text-emerald-100 text-sm">ID: #{importItem.id}</span>
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
            <InfoCard label="Ngày nhập" value={formatDate(importItem.import_date)} />
            <InfoCard label="Nhà cung cấp" value={importItem.supplier_name || 'Chưa chọn'} />
            <InfoCard label="Tổng tiền" value={formatCurrency(importItem.total_amount)} />
            <InfoCard label="Đã thanh toán" value={formatCurrency(importItem.paid_amount)} />
            <InfoCard label="Người yêu cầu" value={importItem.requested_by || 'N/A'} />
            <InfoCard label="Người phê duyệt" value={importItem.approved_by || 'Chưa có'} />
          </div>

          {/* Note */}
          {importItem.note && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
              <p className="text-sm font-semibold text-amber-800 mb-1">Ghi chú:</p>
              <p className="text-sm text-amber-700">{importItem.note}</p>
            </div>
          )}

          {/* Rejection Reason */}
          {(importItem.status === 'rejected' || importItem.status === 'cancelled') && importItem.rejection_reason && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <p className="text-sm font-semibold text-red-800 mb-1">Lý do {importItem.status === 'rejected' ? 'từ chối' : 'hủy'}:</p>
              <p className="text-sm text-red-700">{importItem.rejection_reason}</p>
            </div>
          )}

          {/* Details Table */}
          {importItem.details && importItem.details.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Chi tiết sản phẩm</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">SKU</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Sản phẩm</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Số lượng</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Đơn giá</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {importItem.details.map((detail, index) => (
                      <tr key={detail.id || index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-mono text-gray-600">{detail.sku}</td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{detail.product_name}</div>
                          <div className="text-xs text-gray-500">{detail.variant_name}</div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                          {detail.import_quantity}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-700">
                          {showApproveSection ? (
                            <input
                              type="number"
                              value={approveData.details[index]?.import_price || ''}
                              onChange={(e) => handleDetailChange(index, 'import_price', e.target.value)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-emerald-500"
                              placeholder="Nhập giá"
                              min="0"
                            />
                          ) : (
                            detail.import_price ? formatCurrency(detail.import_price) : '-'
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-emerald-700">
                          {showApproveSection
                            ? approveData.details[index]?.import_price
                              ? formatCurrency(Number(approveData.details[index].import_price) * detail.import_quantity)
                              : '-'
                            : detail.import_price
                              ? formatCurrency(Number(detail.import_price) * detail.import_quantity)
                              : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Workflow 2: Phê duyệt */}
          {showApproveSection && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3">🔐 Workflow 2: Phê duyệt yêu cầu</h4>
              <p className="text-sm text-gray-600 mb-4">Xem xét và phê duyệt/từ chối/hủy yêu cầu nhập hàng</p>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nhà cung cấp <span className="text-red-500">*</span>
                </label>
                <select
                  value={approveData.supplier_id || ''}
                  onChange={(e) => setApproveData({ ...approveData, supplier_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Chọn nhà cung cấp</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={!approveData.supplier_id || approveData.details.some(d => d.import_price <= 0)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Phê duyệt
                </button>
                <button
                  onClick={() => openReasonModal('reject')}
                  className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Từ chối
                </button>
                <button
                  onClick={() => openReasonModal('cancel')}
                  className="flex-1 bg-gray-600 text-white px-4 py-2.5 rounded-lg hover:bg-gray-700 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  Hủy
                </button>
              </div>
            </div>
          )}

          {/* Workflow 3: Thanh toán */}
          {showPaymentSection && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-3">💳 Workflow 3: Xác nhận thanh toán</h4>
              <p className="text-sm text-gray-600 mb-4">Xác nhận đã thanh toán cho nhà cung cấp</p>
              <button
                onClick={handleConfirmPayment}
                className="w-full bg-purple-600 text-white px-4 py-2.5 rounded-lg hover:bg-purple-700 font-medium transition-colors"
              >
                ✓ Xác nhận đã thanh toán
              </button>
            </div>
          )}

          {/* Workflow 4: Nhận hàng */}
          {showReceiveSection && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-3">📦 Workflow 4: Xác nhận nhận hàng</h4>
              <p className="text-sm text-gray-600 mb-4">Xác nhận đã nhận đủ hàng vào kho</p>
              <button
                onClick={handleConfirmReceive}
                className="w-full bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 font-medium transition-colors"
              >
                ✓ Xác nhận đã nhận hàng
              </button>
            </div>
          )}

          {/* No actions */}
          {!showApproveSection && !showPaymentSection && !showReceiveSection && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">
                {importItem.status === 'completed' ? (
                  <>✅ Phiếu nhập đã hoàn tất</>
                ) : importItem.status === 'rejected' ? (
                  <>❌ Phiếu nhập đã bị từ chối</>
                ) : importItem.status === 'cancelled' ? (
                  <>🚫 Phiếu nhập đã bị hủy</>
                ) : (
                  <>📋 Không có thao tác khả dụng</>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Reason Modal */}
        {showReasonModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {action === 'reject' ? 'Lý do từ chối' : 'Lý do hủy'}
              </h3>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Nhập lý do..."
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowReasonModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleReasonSubmit}
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