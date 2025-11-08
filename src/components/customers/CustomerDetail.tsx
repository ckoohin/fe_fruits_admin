import React, { useState } from 'react';
import { X, MapPin, Plus, Edit2, Trash2, Check } from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  order_count: number;
  total_spent: number;
  last_order_date: string | null;
}

interface CustomerAddress {
  id: number;
  customer_id: number;
  name: string;
  phone: string;
  address: string;
  province_code: string;
  district_code: string;
  ward_code: string;
  is_default: boolean;
  province_name?: string;
  district_name?: string;
  ward_name?: string;
}

interface CustomerDetailProps {
  customer: Customer;
  onClose: () => void;
  onUpdate: (id: number, data: any) => void;
  onDelete: (id: number) => void;
}

export default function CustomerDetail({ customer, onClose, onUpdate, onDelete }: CustomerDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
  });
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [addressFormData, setAddressFormData] = useState({
    name: '',
    phone: '',
    address: '',
    province_code: '',
    district_code: '',
    ward_code: '',
    is_default: false,
  });
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    fetchAddresses();
  }, [customer.id]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch(`/api/customers/${customer.id}/addresses`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onUpdate(customer.id, formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async () => {
    setLoading(true);
    try {
      const url = editingAddress
        ? `/api/customers/${customer.id}/addresses/${editingAddress.id}`
        : `/api/customers/${customer.id}/addresses`;
      
      const response = await fetch(url, {
        method: editingAddress ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(addressFormData),
      });

      if (response.ok) {
        await fetchAddresses();
        setShowAddressForm(false);
        setEditingAddress(null);
        setAddressFormData({
          name: '',
          phone: '',
          address: '',
          province_code: '',
          district_code: '',
          ward_code: '',
          is_default: false,
        });
      }
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
    
    try {
      const response = await fetch(`/api/customers/${customer.id}/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        await fetchAddresses();
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const startEditAddress = (address: CustomerAddress) => {
    setEditingAddress(address);
    setAddressFormData({
      name: address.name,
      phone: address.phone,
      address: address.address,
      province_code: address.province_code,
      district_code: address.district_code,
      ward_code: address.ward_code,
      is_default: address.is_default,
    });
    setShowAddressForm(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Chi tiết khách hàng</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Thông tin cơ bản</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                >
                  <Edit2 className="w-4 h-4" />
                  Chỉnh sửa
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Tên khách hàng</p>
                  <p className="font-medium">{customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{customer.email || 'Chưa có'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Số điện thoại</p>
                  <p className="font-medium">{customer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Địa chỉ</p>
                  <p className="font-medium">{customer.address || 'Chưa có'}</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-blue-700">{customer.order_count}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600">Tổng chi tiêu</p>
              <p className="text-2xl font-bold text-green-700">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(customer.total_spent)}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600">Đơn hàng cuối</p>
              <p className="text-2xl font-bold text-purple-700">
                {customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString('vi-VN') : 'Chưa có'}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Địa chỉ giao hàng</h3>
              <button
                onClick={() => {
                  setEditingAddress(null);
                  setAddressFormData({
                    name: customer.name,
                    phone: customer.phone,
                    address: '',
                    province_code: '',
                    district_code: '',
                    ward_code: '',
                    is_default: addresses.length === 0,
                  });
                  setShowAddressForm(true);
                }}
                className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                Thêm địa chỉ
              </button>
            </div>

            {showAddressForm && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-4">
                <h4 className="font-medium">{editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên người nhận</label>
                    <input
                      type="text"
                      value={addressFormData.name}
                      onChange={(e) => setAddressFormData({ ...addressFormData, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <input
                      type="tel"
                      value={addressFormData.phone}
                      onChange={(e) => setAddressFormData({ ...addressFormData, phone: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chi tiết</label>
                  <textarea
                    value={addressFormData.address}
                    onChange={(e) => setAddressFormData({ ...addressFormData, address: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã tỉnh</label>
                    <input
                      type="text"
                      value={addressFormData.province_code}
                      onChange={(e) => setAddressFormData({ ...addressFormData, province_code: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã huyện</label>
                    <input
                      type="text"
                      value={addressFormData.district_code}
                      onChange={(e) => setAddressFormData({ ...addressFormData, district_code: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã xã</label>
                    <input
                      type="text"
                      value={addressFormData.ward_code}
                      onChange={(e) => setAddressFormData({ ...addressFormData, ward_code: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={addressFormData.is_default}
                    onChange={(e) => setAddressFormData({ ...addressFormData, is_default: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-sm">Đặt làm địa chỉ mặc định</label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddressSubmit}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {loading ? 'Đang lưu...' : 'Lưu địa chỉ'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddressForm(false);
                      setEditingAddress(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {addresses.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Chưa có địa chỉ nào</p>
              ) : (
                addresses.map((addr) => (
                  <div key={addr.id} className="border rounded-lg p-4 relative">
                    {addr.is_default && (
                      <span className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Mặc định
                      </span>
                    )}
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">{addr.name} - {addr.phone}</p>
                        <p className="text-sm text-gray-600 mt-1">{addr.address}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {addr.ward_name}, {addr.district_name}, {addr.province_name}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditAddress(addr)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <button
              onClick={() => {
                if (confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
                  onDelete(customer.id);
                  onClose();
                }
              }}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Xóa khách hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}