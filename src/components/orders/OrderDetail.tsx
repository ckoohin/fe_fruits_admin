import React, { useState, useEffect } from 'react';
import { X, Package, MapPin, CreditCard, User, Save, XCircle } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import OrderStatus from './OrderStatus';
import OrderTimeline from './OrderTimeline';

interface OrderDetailProps {
  orderId: number;
  onClose: () => void;
  onUpdate: () => void;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: 'Thanh toán khi nhận hàng (COD)',
  bank_transfer: 'Chuyển khoản ngân hàng',
  momo: 'Ví MoMo',
  vnpay: 'VNPay',
};

const OrderDetail: React.FC<OrderDetailProps> = ({ orderId, onClose, onUpdate }) => {
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'items' | 'history'>('info');

  const [editStatus, setEditStatus] = useState({
    order_status: '',
    payment_status: '',
    notes: '',
  });

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const [orderRes, itemsRes, historyRes] = await Promise.all([
        adminApi.getOrder(orderId),
        adminApi.getOrderItems(orderId),
        adminApi.getOrderStatusHistory(orderId),
      ]);

      if (orderRes.success && orderRes.data) {
        setOrder(orderRes.data);
        setEditStatus({
          order_status: orderRes.data.order_status,
          payment_status: orderRes.data.payment_status,
          notes: '',
        });
      }
      if (itemsRes.success && itemsRes.data) setOrderItems(itemsRes.data);
      if (historyRes.success && historyRes.data) setStatusHistory(historyRes.data);
    } catch (error) {
      console.error('Error loading order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      setUpdating(true);
      const response = await adminApi.updateOrderStatus(orderId, editStatus);
      if (response.success) {
        await loadOrderDetails();
        onUpdate();
        setEditStatus({ ...editStatus, notes: '' });
      }
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;
    
    const reason = prompt('Lý do hủy đơn:');
    if (!reason) return;

    try {
      setUpdating(true);
      await adminApi.cancelOrder(orderId, reason);
      await loadOrderDetails();
      onUpdate();
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi hủy đơn hàng');
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng</h2>
            <p className="text-sm text-gray-500 mt-1">Mã đơn: {order.order_number}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="px-6">
            <nav className="flex space-x-8" aria-label="Tabs">
              {[
                { id: 'info', label: 'Thông tin', icon: User },
                { id: 'items', label: 'Sản phẩm', icon: Package },
                { id: 'history', label: 'Lịch sử', icon: CreditCard },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Order Status Management */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Quản lý trạng thái</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng thái đơn hàng
                    </label>
                    <select
                      value={editStatus.order_status}
                      onChange={(e) => setEditStatus({ ...editStatus, order_status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="pending">Chờ xác nhận</option>
                      <option value="confirmed">Đã xác nhận</option>
                      <option value="processing">Đang xử lý</option>
                      <option value="shipping">Đang giao</option>
                      <option value="delivered">Đã giao</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng thái thanh toán
                    </label>
                    <select
                      value={editStatus.payment_status}
                      onChange={(e) => setEditStatus({ ...editStatus, payment_status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="pending">Chờ thanh toán</option>
                      <option value="paid">Đã thanh toán</option>
                      <option value="failed">Thất bại</option>
                      <option value="refunded">Đã hoàn tiền</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    value={editStatus.notes}
                    onChange={(e) => setEditStatus({ ...editStatus, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Nhập ghi chú về thay đổi trạng thái..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleUpdateStatus}
                    disabled={updating}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                  >
                    <Save className="w-4 h-4" />
                    {updating ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
                  </button>
                  {order.order_status !== 'cancelled' && (
                    <button
                      onClick={handleCancelOrder}
                      disabled={updating}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                    >
                      <XCircle className="w-4 h-4" />
                      Hủy đơn hàng
                    </button>
                  )}
                </div>
              </div>

              {/* Order Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold">Thông tin khách hàng</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Họ tên:</span>
                      <span className="ml-2 font-medium">{order.customer_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Số điện thoại:</span>
                      <span className="ml-2 font-medium">{order.customer_phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Ngày đặt:</span>
                      <span className="ml-2">{formatDate(order.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold">Địa chỉ giao hàng</h3>
                  </div>
                  <p className="text-sm text-gray-700">{order.shipping_address}</p>
                </div>

                {/* Payment Info */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold">Thanh toán</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Phương thức:</span>
                      <span className="ml-2 font-medium">
                        {PAYMENT_METHOD_LABELS[order.payment_method]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Trạng thái:</span>
                      <OrderStatus status={order.payment_status} type="payment" />
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold">Tổng quan đơn hàng</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tạm tính:</span>
                      <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phí vận chuyển:</span>
                      <span className="font-medium">{formatCurrency(order.shipping_fee)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-semibold">Tổng cộng:</span>
                      <span className="font-bold text-lg text-green-600">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-yellow-800 mb-2">Ghi chú:</h3>
                  <p className="text-sm text-yellow-700">{order.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'items' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Danh sách sản phẩm</h3>
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    {item.images && item.images[0] && (
                      <img
                        src={item.images[0]}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                      {item.variant_name && (
                        <p className="text-sm text-gray-500">{item.variant_name}</p>
                      )}
                      {item.product_sku && (
                        <p className="text-xs text-gray-400">SKU: {item.product_sku}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {item.quantity} x {formatCurrency(item.unit_price)}
                      </p>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Lịch sử thay đổi trạng thái</h3>
              <OrderTimeline history={statusHistory} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;