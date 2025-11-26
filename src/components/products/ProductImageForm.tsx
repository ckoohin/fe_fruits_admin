import { useCloudinaryUpload } from "@/hooks/useCloudiaryUpload";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const CloudinaryUploader: React.FC<{
  initialImage: string | null;
  onUploadComplete: (url: string) => void;
  label: string;
  className?: string;
  multiple?: boolean;
}> = ({ initialImage, onUploadComplete, label, className }) => {
  const { uploadImage, uploading, progress } = useCloudinaryUpload();
  const [preview, setPreview] = useState<string | null>(initialImage);

  useEffect(() => {
    setPreview(initialImage);
  }, [initialImage]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh quá lớn, vui lòng chọn ảnh dưới 5MB");
      return;
    }

    const result = await uploadImage(file, "products");
    if (result.success && result.url) {
      setPreview(result.url);
      onUploadComplete(result.url); 
    } else {
      toast.error(result.error || "Upload thất bại");
    }
  };

  const handleRemove = () => {
    if (confirm("Xóa ảnh này?")) {
      setPreview(null);
      onUploadComplete(""); 
    }
  };

  return (
    <div className={`border p-3 rounded-md shadow-sm ${className || ""}`}>
      <p className="text-sm font-medium mb-2">{label}</p>

      <div className="w-full h-40 bg-gray-100 flex items-center justify-center rounded-md relative mb-2 overflow-hidden">
        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src =
                  "https://via.placeholder.com/300x300.png?text=Ảnh+Lỗi";
              }}
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 shadow-lg transition z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <span className="text-gray-500 text-sm">Chưa có ảnh</span>
        )}
      </div>

      <label className="cursor-pointer block">
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
        <div
          className={`w-full text-center py-2 text-sm rounded-lg transition ${
            uploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-emerald-500 hover:bg-emerald-600"
          } text-white`}
        >
          {uploading ? `Đang tải... ${progress}%` : preview ? "Thay đổi ảnh" : "Chọn ảnh"}
        </div>
      </label>

      {uploading && (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default CloudinaryUploader;