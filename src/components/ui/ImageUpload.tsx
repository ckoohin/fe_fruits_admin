'use client';
import React, { useState, useRef } from 'react';
import { useCloudinaryUpload } from '@/hooks/useCloudiaryUpload';

interface ImageUploadProps {
  value: string | string[];
  onChange: (url: string | string[]) => void;
  folder?: string;
  multiple?: boolean;
  maxFiles?: number;
  label?: string;
}

export default function ImageUpload({
  value,
  onChange,
  folder = 'products',
  multiple = false,
  maxFiles = 5,
  label = 'Hình ảnh'
}: ImageUploadProps) {
  const { uploadImage, uploadMultipleImages, uploading, progress } = useCloudinaryUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>('');

  const images = Array.isArray(value) ? value : (value ? [value] : []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError('');

    if (multiple && images.length + files.length > maxFiles) {
      setError(`Chỉ được upload tối đa ${maxFiles} ảnh`);
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setError('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      setError('Chỉ hỗ trợ file ảnh JPG, PNG, WEBP');
      return;
    }

    try {
      if (multiple) {
        const urls = await uploadMultipleImages(files, folder);
        if (urls.length > 0) {
          onChange([...images, ...urls]);
        } else {
          setError('Lỗi khi upload ảnh');
        }
      } else {
        const result = await uploadImage(files[0], folder);
        if (result.success && result.url) {
          onChange(result.url);
        } else {
          setError(result.error || 'Lỗi khi upload ảnh');
        }
      }
    } catch (error) {
      setError('Lỗi khi upload ảnh');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    if (multiple) {
      const newImages = images.filter((_, i) => i !== index);
      onChange(newImages.length > 0 ? newImages : []);
    } else {
      onChange('');
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {!multiple && <span className="text-red-500">*</span>}
      </label>

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading || (!multiple && images.length > 0)}
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || (!multiple && images.length > 0) || (multiple && images.length >= maxFiles)}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {uploading ? `Đang upload... ${progress}%` : 'Chọn ảnh'}
        </button>

        {multiple && (
          <p className="mt-1 text-xs text-gray-500">
            Đã chọn {images.length}/{maxFiles} ảnh. JPG, PNG, WEBP. Tối đa 5MB mỗi ảnh.
          </p>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}

      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {images.length > 0 && (
        <div className={multiple ? 'grid grid-cols-3 gap-3' : ''}>
          {images.map((url, index) => (
            <div key={index} className="relative group">
              {/* Container với aspect ratio cố định */}
              <div className="w-full aspect-square bg-gray-100 rounded border border-gray-200 overflow-hidden">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/150x150.png?text=No+Image';
                  }}
                />
              </div>
              
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                title="Xóa ảnh"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {multiple && index === 0 && (
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs rounded shadow">
                  Ảnh chính
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}