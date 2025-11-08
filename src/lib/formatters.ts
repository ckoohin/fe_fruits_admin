import { formatDate, formatCurrency, formatNumber } from './utils';
import { PRODUCT_STATUS, ORDER_STATUS, PAYMENT_STATUS, SHIPPING_STATUS } from './constants';

// Product formatters
export function formatProductStatus(status: string): string {
  const statusMap: Record<string, string> = {
    [PRODUCT_STATUS.ACTIVE]: 'Đang bán',
    [PRODUCT_STATUS.INACTIVE]: 'Ngừng bán',
    [PRODUCT_STATUS.DRAFT]: 'Bản nháp',
    [PRODUCT_STATUS.OUT_OF_STOCK]: 'Hết hàng',
  };
  
  return statusMap[status] || status;
}

export function formatProductPrice(price: number, originalPrice?: number): string {
  if (originalPrice && originalPrice > price) {
    return `${formatCurrency(price)} (Giảm từ ${formatCurrency(originalPrice)})`;
  }
  return formatCurrency(price);
}

// Order formatters
export function formatOrderStatus(status: string): string {
  const statusMap: Record<string, string> = {
    [ORDER_STATUS.PENDING]: 'Chờ xử lý',
    [ORDER_STATUS.CONFIRMED]: 'Đã xác nhận',
    [ORDER_STATUS.PROCESSING]: 'Đang xử lý',
    [ORDER_STATUS.SHIPPED]: 'Đã gửi hàng',
    [ORDER_STATUS.DELIVERED]: 'Đã giao hàng',
    [ORDER_STATUS.CANCELLED]: 'Đã hủy',
    [ORDER_STATUS.RETURNED]: 'Đã trả hàng',
  };
  
  return statusMap[status] || status;
}

export function formatPaymentStatus(status: string): string {
  const statusMap: Record<string, string> = {
    [PAYMENT_STATUS.PENDING]: 'Chờ thanh toán',
    [PAYMENT_STATUS.PAID]: 'Đã thanh toán',
    [PAYMENT_STATUS.FAILED]: 'Thanh toán thất bại',
    [PAYMENT_STATUS.REFUNDED]: 'Đã hoàn tiền',
    [PAYMENT_STATUS.PARTIALLY_REFUNDED]: 'Hoàn tiền một phần',
  };
  
  return statusMap[status] || status;
}

export function formatShippingStatus(status: string): string {
  const statusMap: Record<string, string> = {
    [SHIPPING_STATUS.PENDING]: 'Chờ gửi hàng',
    [SHIPPING_STATUS.PREPARING]: 'Chuẩn bị hàng',
    [SHIPPING_STATUS.SHIPPED]: 'Đã gửi hàng',
    [SHIPPING_STATUS.IN_TRANSIT]: 'Đang vận chuyển',
    [SHIPPING_STATUS.DELIVERED]: 'Đã giao hàng',
    [SHIPPING_STATUS.FAILED]: 'Giao hàng thất bại',
  };
  
  return statusMap[status] || status;
}

export function formatOrderNumber(orderNumber: string): string {
  return `#${orderNumber}`;
}

// Customer formatters
export function formatCustomerName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export function formatCustomerStats(stats: { total: number; totalSpent: number; lastOrderAt?: Date }): string {
  const { total, totalSpent, lastOrderAt } = stats;
  
  let result = `${total} đơn hàng • ${formatCurrency(totalSpent)}`;
  
  if (lastOrderAt) {
    result += ` • Lần cuối: ${formatDate(lastOrderAt)}`;
  }
  
  return result;
}

// Analytics formatters
export function formatSalesChartData(data: Array<{ date: string; value: number }>): Array<{ date: string; value: number; formatted: string }> {
  return data.map(item => ({
    ...item,
    formatted: formatCurrency(item.value),
  }));
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatGrowthRate(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? '+100%' : '0%';
  
  const rate = ((current - previous) / previous) * 100;
  const sign = rate >= 0 ? '+' : '';
  
  return `${sign}${rate.toFixed(1)}%`;
}

// File formatters
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Table formatters
export function formatTableDate(date: Date | string): string {
  return formatDate(date, 'time');
}

export function formatTableCurrency(amount: number): string {
  return formatCurrency(amount);
}

export function formatTableStatus(status: string, type: 'order' | 'payment' | 'shipping' | 'product' = 'order'): string {
  switch (type) {
    case 'order':
      return formatOrderStatus(status);
    case 'payment':
      return formatPaymentStatus(status);
    case 'shipping':
      return formatShippingStatus(status);
    case 'product':
      return formatProductStatus(status);
    default:
      return status;
  }
}

// Export formatters
export function formatExportFilename(type: string, date?: Date): string {
  const timestamp = date ? formatDate(date, 'time').replace(/[\/\s:]/g, '-') : formatDate(new Date(), 'time').replace(/[\/\s:]/g, '-');
  return `${type}-${timestamp}.xlsx`;
}

// Search formatters
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}
