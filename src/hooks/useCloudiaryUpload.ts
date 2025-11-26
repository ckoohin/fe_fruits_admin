import { useState } from 'react';
import { ApiHelper } from '@/utils/api';

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export function useCloudinaryUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadImage = async (file: File, folder: string = 'products'): Promise<UploadResult> => {
    setUploading(true);
    setProgress(0);

    try {
      const signatureResponse = await ApiHelper.post('api/v1/uploads/signature', {
        paramsToSign: { folder }
      });

      if (!signatureResponse.success) {
        throw new Error('Không thể lấy signature từ server');
      }

      const { timestamp, signature } = signatureResponse.data;
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', folder);
      formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '');

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setProgress(percentComplete);
        }
      });

      const uploadPromise = new Promise<UploadResult>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve({
              success: true,
              url: response.secure_url
            });
          } else {
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error'));
        });

        xhr.open('POST', uploadUrl);
        xhr.send(formData);
      });

      const result = await uploadPromise;
      return result;

    } catch (error: any) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message || 'Lỗi khi upload ảnh'
      };
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const uploadMultipleImages = async (files: File[], folder: string = 'products'): Promise<string[]> => {
    setUploading(true);
    
    try {
      const uploadPromises = files.map(file => uploadImage(file, folder));
      const results = await Promise.all(uploadPromises);
      
      const successUrls = results
        .filter(result => result.success && result.url)
        .map(result => result.url!);
      
      return successUrls;
    } catch (error) {
      console.error('Multiple upload error:', error);
      return [];
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadImage,
    uploadMultipleImages,
    uploading,
    progress
  };
}