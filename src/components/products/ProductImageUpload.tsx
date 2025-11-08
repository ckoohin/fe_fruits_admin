'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2 } from 'lucide-react';

interface ProductImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  cloudinaryCloudName: string;
  uploadPreset: string;
}

export default function ProductImageUpload({
  value,
  onChange,
  cloudinaryCloudName,
  uploadPreset
}: ProductImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước file không được vượt quá 5MB');
      return;
    }

    setError('');
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'products');

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setProgress(percent);
        }
      };

      xhr.onload = () => {
        setUploading(false);
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          onChange(data.secure_url);
          setPreview(null);
        } else {
          setError('Upload thất bại');
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        setError('Có lỗi xảy ra khi upload ảnh');
      };

      xhr.send(formData);
    } catch (err) {
      setUploading(false);
      setError('Có lỗi xảy ra khi upload ảnh');
      console.error('Upload error:', err);
    }
  };

  const handleRemove = () => {
    onChange('');
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Hình ảnh sản phẩm
      </label>

      {(value || preview) ? (
        <div className="relative w-full max-w-md">
          <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
            <Image
              src={preview || value}
              alt="Product"
              fill
              className="object-cover"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
          >
            <X className="w-4 h-4" />
          </button>
          {uploading && (
            <div className="absolute bottom-2 left-2 bg-gray-100 rounded-full px-2 py-1 text-xs text-gray-700">
              Uploading... {progress}%
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full max-w-md h-64 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 cursor-pointer transition-colors flex items-center justify-center"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
              <p className="text-sm text-gray-500">Đang upload... {progress}%</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-12 h-12 text-gray-400" />
              <p className="text-sm text-gray-500">Click để chọn ảnh</p>
              <p className="text-xs text-gray-400">PNG, JPG, GIF (max 5MB)</p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}