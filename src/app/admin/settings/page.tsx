'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Globe, Mail, Phone, MapPin, Facebook, Instagram, Youtube, Twitter, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface Setting {
  id: number;
  key: string;
  value: string;
  group: string;
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [settings, setSettings] = useState({
    // General Settings
    site_name: '',
    site_description: '',
    support_email: '',
    support_phone: '',
    address: '',
    
    // Social Media
    facebook_url: '',
    instagram_url: '',
    youtube_url: '',
    twitter_url: '',
    
    // Business Settings
    business_hours: '',
    tax_rate: '',
    currency: 'VND',
    timezone: 'Asia/Ho_Chi_Minh'
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || sessionStorage.getItem('token');
    }
    return null;
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const token = getAuthToken();
      if (!token) {
        setMessage({ type: 'error', text: 'Vui lòng đăng nhập lại' });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/settings/manage`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data: Setting[] = await response.json();
        const settingsObj: Record<string, string> = {};
        data.forEach((item: Setting) => {
          settingsObj[item.key] = item.value;
        });
        setSettings(prev => ({ ...prev, ...settingsObj }));
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Không thể tải cài đặt' });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi tải cài đặt. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = getAuthToken();
      
      console.log('💾 [Settings] Submitting settings...');
      console.log('🔑 [Settings] Token:', token ? 'Có token' : 'KHÔNG có token');
      
      if (!token) {
        setMessage({ type: 'error', text: 'Vui lòng đăng nhập lại. Không tìm thấy token.' });
        setIsSaving(false);
        return;
      }

      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        key,
        value: String(value)
      }));

      console.log('💾 [Settings] Settings to update:', settingsArray);

      const response = await fetch(`${API_BASE_URL}/settings/manage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settingsArray)
      });

      console.log('📡 [Settings] Update response status:', response.status);
      console.log('📡 [Settings] Update response ok:', response.ok);

      let data = null;
      try {
        data = await response.json();
        console.log('📡 [Settings] Update response data:', data);
      } catch (e) {
        console.error('❌ [Settings] Could not parse response:', e);
      }

      if (response.ok) {
        setMessage({ type: 'success', text: data?.message || 'Cập nhật cài đặt thành công!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        let errorMessage = 'Cập nhật thất bại. Vui lòng thử lại.';
        
        if (response.status === 401) {
          errorMessage = 'Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.';
        } else if (response.status === 403) {
          errorMessage = 'Bạn không có quyền cập nhật cài đặt. Chỉ admin mới có quyền này.';
        } else if (data?.message) {
          errorMessage = data.message;
        }
        
        setMessage({ type: 'error', text: `${errorMessage} (Status: ${response.status})` });
      }
    } catch (error) {
      console.error('💥 [Settings] Update error:', error);
      setMessage({ type: 'error', text: `Lỗi kết nối: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải cài đặt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-8 h-8" />
            Cài đặt hệ thống
          </h1>
          <p className="text-gray-600 mt-1">Quản lý cấu hình và thông tin của hệ thống</p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* General Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Thông tin chung
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên hệ thống
                  </label>
                  <input
                    type="text"
                    name="site_name"
                    value={settings.site_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Múi giờ
                  </label>
                  <select
                    name="timezone"
                    value={settings.timezone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Asia/Ho_Chi_Minh">Việt Nam (GMT+7)</option>
                    <option value="Asia/Bangkok">Bangkok (GMT+7)</option>
                    <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả hệ thống
                </label>
                <textarea
                  name="site_description"
                  value={settings.site_description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Thông tin liên hệ
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline w-4 h-4 mr-1" />
                    Email hỗ trợ
                  </label>
                  <input
                    type="email"
                    name="support_email"
                    value={settings.support_email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline w-4 h-4 mr-1" />
                    Số điện thoại hỗ trợ
                  </label>
                  <input
                    type="text"
                    name="support_phone"
                    value={settings.support_phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Địa chỉ
                </label>
                <input
                  type="text"
                  name="address"
                  value={settings.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giờ làm việc
                </label>
                <input
                  type="text"
                  name="business_hours"
                  value={settings.business_hours}
                  onChange={handleInputChange}
                  placeholder="VD: Thứ 2 - Chủ Nhật: 8:00 - 22:00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={() => loadSettings()}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
            >
              Hủy thay đổi
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}