'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useStockChecks } from '@/hooks/useStockCheck';
import { StockCheck } from '@/types/inventory';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Building2, 
  Package, 
  FileText,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Save,
  X,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

export default function StockCheckDetailPage() {
  const router = useRouter();
  const params = useParams();
  const checkId = parseInt(params.id as string);

  const {
    getStockCheckDetail,
    completeStockCheck,
    cancelStockCheck,
    updateItemQuantity,
    removeItemFromCheck
  } = useStockChecks();

  const [check, setCheck] = useState<StockCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<number>(0);

  useEffect(() => {
    loadCheckDetail();
  }, [checkId]);

  const loadCheckDetail = async () => {
    setLoading(true);
    const data = await getStockCheckDetail(checkId);
    setCheck(data);
    setLoading(false);
  };

  const handleComplete = async () => {
    if (!confirm('Xác nhận hoàn thành phiếu kiểm? Tồn kho sẽ được cập nhật.')) return;
    
    const success = await completeStockCheck(checkId);
    if (success) {
      router.push('/admin/inventory/check');
    }
  };

  const handleCancel = async () => {
    const success = await cancelStockCheck(checkId);
    if (success) {
      router.push('/admin/inventory/check');
    }
  };

  const handleEditItem = (itemId: number, currentQty: number) => {
    setEditingItemId(itemId);
    setEditingQuantity(currentQty);
  };

  const handleSaveEdit = async (itemId: number) => {
    const success = await updateItemQuantity(checkId, itemId, editingQuantity);
    if (success) {
      setEditingItemId(null);
      loadCheckDetail();
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!confirm('Xóa sản phẩm này khỏi phiếu kiểm?')) return;
    
    const success = await removeItemFromCheck(checkId, itemId);
    if (success) {
      loadCheckDetail();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    );
  }

  if (!check) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy phiếu kiểm kho</h3>
          <p className="text-gray-500 mb-6">Phiếu kiểm kho này không tồn tại hoặc đã bị xóa</p>
          <button
            onClick={() => router.push('/admin/inventory/check')}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const statusConfig: { [key: string]: { label: string; color: string; bgColor: string; icon: any } } = {
    'pending': { 
      label: 'Chờ xử lý', 
      color: 'text-yellow-700', 
      bgColor: 'bg-yellow-100 border-yellow-200',
      icon: AlertCircle
    },
    'in_progress': { 
      label: 'Đang kiểm', 
      color: 'text-blue-700', 
      bgColor: 'bg-blue-100 border-blue-200',
      icon: Package
    },
    'completed': { 
      label: 'Hoàn thành', 
      color: 'text-green-700', 
      bgColor: 'bg-green-100 border-green-200',
      icon: CheckCircle
    },
    'cancelled': { 
      label: 'Đã hủy', 
      color: 'text-gray-700', 
      bgColor: 'bg-gray-100 border-gray-200',
      icon: XCircle
    }
  };

  const status = statusConfig[check.status] || statusConfig['pending'];
  const StatusIcon = status.icon;

  // Tính tổng chênh lệch
  const totalAdjustment = check.items?.reduce((sum, item) => sum + item.adjustment, 0) || 0;
  const positiveAdjustment = check.items?.reduce((sum, item) => item.adjustment > 0 ? sum + item.adjustment : sum, 0) || 0;
  const negativeAdjustment = check.items?.reduce((sum, item) => item.adjustment < 0 ? sum + item.adjustment : sum, 0) || 0;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại
      </button>

      {/* Header Card */}
      <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl shadow-sm border border-emerald-100 p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl font-bold text-gray-900">
                Phiếu kiểm kho #{check.id}
              </h1>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${status.bgColor} ${status.color}`}>
                <StatusIcon className="w-4 h-4" />
                <span className="text-sm font-semibold">{status.label}</span>
              </div>
            </div>
            <p className="text-gray-600">Chi tiết thông tin phiếu kiểm kho và danh sách sản phẩm</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-600">Chi nhánh</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{check.branch_name}</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-gray-600">Người kiểm</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{check.user_name}</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm text-gray-600">Ngày kiểm</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {new Date(check.check_date).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(check.check_date).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Package className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm text-gray-600">Số sản phẩm</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{check.items?.length || 0}</p>
          </div>
        </div>

        {/* Notes */}
        {check.notes && (
          <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Ghi chú</p>
                <p className="text-sm text-gray-600">{check.notes}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {check.items && check.items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Chênh lệch dương</p>
                <p className="text-2xl font-bold text-green-600">+{positiveAdjustment}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Chênh lệch âm</p>
                <p className="text-2xl font-bold text-red-600">{negativeAdjustment}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng chênh lệch</p>
                <p className={`text-2xl font-bold ${
                  totalAdjustment > 0 ? 'text-green-600' : 
                  totalAdjustment < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {totalAdjustment > 0 ? '+' : ''}{totalAdjustment}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <Minus className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Danh sách sản phẩm đã kiểm</h2>
          <p className="text-sm text-gray-600 mt-1">
            {check.items?.length || 0} sản phẩm trong phiếu kiểm
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Tồn kho cũ
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Số lượng đếm
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Chênh lệch
                </th>
                {check.status === 'in_progress' && (
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Thao tác
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {!check.items || check.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Chưa có sản phẩm nào trong phiếu kiểm</p>
                  </td>
                </tr>
              ) : (
                check.items.map((item, index) => (
                  <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.variant_name}</p>
                        <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded mt-1 inline-block">
                          {item.sku}
                        </code>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg">
                        {item.previous_quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editingItemId === item.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={editingQuantity}
                            onChange={(e) => setEditingQuantity(parseInt(e.target.value) || 0)}
                            className="w-24 px-3 py-2 text-center border-2 border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-bold text-emerald-700 bg-emerald-100 rounded-lg">
                          {item.counted_quantity}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        {item.adjustment > 0 ? (
                          <div className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm font-bold">+{item.adjustment}</span>
                          </div>
                        ) : item.adjustment < 0 ? (
                          <div className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg">
                            <TrendingDown className="w-4 h-4" />
                            <span className="text-sm font-bold">{item.adjustment}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg">
                            <Minus className="w-4 h-4" />
                            <span className="text-sm font-bold">0</span>
                          </div>
                        )}
                      </div>
                    </td>
                    {check.status === 'in_progress' && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {editingItemId === item.id ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(item.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                              >
                                <Save className="w-3.5 h-3.5" />
                                Lưu
                              </button>
                              <button
                                onClick={() => setEditingItemId(null)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                              >
                                <X className="w-3.5 h-3.5" />
                                Hủy
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditItem(item.id, item.counted_quantity)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                Sửa
                              </button>
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Xóa
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      {check.status === 'in_progress' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-semibold transition-colors"
            >
              <XCircle className="w-5 h-5" />
              Hủy phiếu kiểm
            </button>
            <button
              onClick={handleComplete}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 font-semibold shadow-lg shadow-emerald-200 transition-all"
            >
              <CheckCircle className="w-5 h-5" />
              Hoàn thành & Cập nhật tồn kho
            </button>
          </div>
        </div>
      )}
    </div>
  );
}