import React from 'react';
import { Clock, CheckCircle, Package, Truck, XCircle } from 'lucide-react';

interface StatusHistory {
  id: number;
  from_status: string;
  to_status: string;
  notes: string | null;
  changed_by_name: string | null;
  created_at: string;
}

interface OrderTimelineProps {
  history: StatusHistory[];
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  pending: { label: 'Chờ xác nhận', icon: Clock, color: 'yellow' },
  confirmed: { label: 'Đã xác nhận', icon: CheckCircle, color: 'blue' },
  processing: { label: 'Đang xử lý', icon: Package, color: 'indigo' },
  shipping: { label: 'Đang giao', icon: Truck, color: 'purple' },
  delivered: { label: 'Đã giao', icon: CheckCircle, color: 'green' },
  cancelled: { label: 'Đã hủy', icon: XCircle, color: 'red' },
};

const OrderTimeline: React.FC<OrderTimelineProps> = ({ history }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>Chưa có lịch sử thay đổi trạng thái</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((item, idx) => {
          const config = STATUS_CONFIG[item.to_status] || STATUS_CONFIG.pending;
          const Icon = config.icon;
          const isLast = idx === history.length - 1;

          return (
            <li key={item.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span
                      className={`h-8 w-8 rounded-full bg-${config.color}-500 flex items-center justify-center ring-8 ring-white`}
                    >
                      <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {config.label}
                      </p>
                      {item.notes && (
                        <p className="mt-0.5 text-sm text-gray-500">{item.notes}</p>
                      )}
                      {item.changed_by_name && (
                        <p className="mt-0.5 text-xs text-gray-400">
                          Bởi: {item.changed_by_name}
                        </p>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      <time dateTime={item.created_at}>{formatDate(item.created_at)}</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default OrderTimeline;