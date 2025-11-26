import { z } from 'zod';

// Common schemas
export const emailSchema = z.string().email('Email không hợp lệ');
export const phoneSchema = z.string().regex(/^(\+84|84|0)[1-9][0-9]{8,9}$/, 'Số điện thoại không hợp lệ');
export const passwordSchema = z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự');

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token là bắt buộc'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mật khẩu hiện tại là bắt buộc'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

// Product schemas
export const productSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm là bắt buộc'),
  description: z.string().min(1, 'Mô tả là bắt buộc'),
  price: z.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
  originalPrice: z.number().min(0, 'Giá gốc phải lớn hơn hoặc bằng 0').optional(),
  sku: z.string().min(1, 'SKU là bắt buộc'),
  categoryId: z.string().min(1, 'Danh mục là bắt buộc'),
  brand: z.string().optional(),
  images: z.array(z.string().url('URL hình ảnh không hợp lệ')).min(1, 'Ít nhất 1 hình ảnh'),
  stock: z.number().int().min(0, 'Số lượng tồn kho phải lớn hơn hoặc bằng 0'),
  weight: z.number().min(0, 'Trọng lượng phải lớn hơn hoặc bằng 0').optional(),
  dimensions: z.object({
    length: z.number().min(0, 'Chiều dài phải lớn hơn hoặc bằng 0'),
    width: z.number().min(0, 'Chiều rộng phải lớn hơn hoặc bằng 0'),
    height: z.number().min(0, 'Chiều cao phải lớn hơn hoặc bằng 0'),
  }).optional(),
  tags: z.array(z.string()).optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục là bắt buộc'),
  slug: z.string().min(1, 'Slug là bắt buộc'),
  description: z.string().optional(),
  parentId: z.string().optional(),
  image: z.string().url('URL hình ảnh không hợp lệ').optional(),
  isActive: z.boolean(),
});

// Order schemas
export const orderSchema = z.object({
  customerId: z.string().min(1, 'Khách hàng là bắt buộc'),
  items: z.array(z.object({
    productId: z.string().min(1, 'Sản phẩm là bắt buộc'),
    quantity: z.number().int().min(1, 'Số lượng phải lớn hơn 0'),
  })).min(1, 'Ít nhất 1 sản phẩm'),
  shippingAddress: z.object({
    firstName: z.string().min(1, 'Tên là bắt buộc'),
    lastName: z.string().min(1, 'Họ là bắt buộc'),
    company: z.string().optional(),
    address1: z.string().min(1, 'Địa chỉ là bắt buộc'),
    address2: z.string().optional(),
    city: z.string().min(1, 'Thành phố là bắt buộc'),
    state: z.string().min(1, 'Tỉnh/thành là bắt buộc'),
    postalCode: z.string().min(1, 'Mã bưu điện là bắt buộc'),
    country: z.string().min(1, 'Quốc gia là bắt buộc'),
    phone: phoneSchema.optional(),
  }),
  billingAddress: z.object({
    firstName: z.string().min(1, 'Tên là bắt buộc'),
    lastName: z.string().min(1, 'Họ là bắt buộc'),
    company: z.string().optional(),
    address1: z.string().min(1, 'Địa chỉ là bắt buộc'),
    address2: z.string().optional(),
    city: z.string().min(1, 'Thành phố là bắt buộc'),
    state: z.string().min(1, 'Tỉnh/thành là bắt buộc'),
    postalCode: z.string().min(1, 'Mã bưu điện là bắt buộc'),
    country: z.string().min(1, 'Quốc gia là bắt buộc'),
    phone: phoneSchema.optional(),
  }).optional(),
  paymentMethod: z.enum(['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery']),
  notes: z.string().optional(),
});

// Customer schemas
export const customerSchema = z.object({
  email: emailSchema,
  name: z.string().min(1, 'Tên là bắt buộc'),
  phone: phoneSchema.optional(),
  dateOfBirth: z.date().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  addresses: z.array(z.object({
    firstName: z.string().min(1, 'Tên là bắt buộc'),
    lastName: z.string().min(1, 'Họ là bắt buộc'),
    company: z.string().optional(),
    address1: z.string().min(1, 'Địa chỉ là bắt buộc'),
    address2: z.string().optional(),
    city: z.string().min(1, 'Thành phố là bắt buộc'),
    state: z.string().min(1, 'Tỉnh/thành là bắt buộc'),
    postalCode: z.string().min(1, 'Mã bưu điện là bắt buộc'),
    country: z.string().min(1, 'Quốc gia là bắt buộc'),
    phone: phoneSchema.optional(),
    isDefault: z.boolean(),
  })).optional(),
});

// User schemas
export const userSchema = z.object({
  email: emailSchema,
  name: z.string().min(1, 'Tên là bắt buộc'),
  role: z.enum(['super_admin', 'admin', 'manager', 'staff']),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean(),
});

export const createUserSchema = userSchema.extend({
  password: passwordSchema,
});

// Inventory schemas
export const inventoryImportSchema = z.object({
  file: z.instanceof(File),
  updateExisting: z.boolean(),
});

export const inventoryExportSchema = z.object({
  format: z.enum(['excel', 'csv']),
  includeImages: z.boolean(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

// Analytics schemas
export const analyticsDateRangeSchema = z.object({
  dateFrom: z.date(),
  dateTo: z.date(),
}).refine((data) => data.dateFrom <= data.dateTo, {
  message: 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc',
  path: ['dateTo'],
});

// File upload schemas
export const fileUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024,
    'Kích thước file không được vượt quá 5MB'
  ),
});

export const imageUploadSchema = fileUploadSchema.extend({
  file: z.instanceof(File).refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type),
    'Chỉ chấp nhận file hình ảnh (JPEG, PNG, WebP, GIF)'
  ),
});

// Search schemas
export const searchSchema = z.object({
  query: z.string().min(1, 'Từ khóa tìm kiếm là bắt buộc'),
  filters: z.record(z.string(), z.any()).optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

// Export types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type OrderFormData = z.infer<typeof orderSchema>;
export type CustomerFormData = z.infer<typeof customerSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type InventoryImportFormData = z.infer<typeof inventoryImportSchema>;
export type InventoryExportFormData = z.infer<typeof inventoryExportSchema>;
export type AnalyticsDateRangeFormData = z.infer<typeof analyticsDateRangeSchema>;
export type FileUploadFormData = z.infer<typeof fileUploadSchema>;
export type ImageUploadFormData = z.infer<typeof imageUploadSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
