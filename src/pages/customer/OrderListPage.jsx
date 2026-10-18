import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, Package, Calendar, ArrowRight } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { getOrders } from '../../api/services/orderApi';
import { ORDER_STATUS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../utils/constants';
import { formatVND, formatDate } from '../../utils/formatters';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';

/**
 * OrderListPage: Danh sách đơn hàng tối ưu Responsive trên Mobile & Desktop
 */
const OrderListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') || '';

  const { data: ordersData, loading } = useFetch(
    async () => {
      const res = await getOrders({
        status: status || undefined,
        page: 1,
        limit: 20,
      });
      return res.data || [];
    },
    [status]
  );

  const tabs = [
    { label: 'Tất cả', value: '' },
    { label: 'Chờ xác nhận', value: ORDER_STATUS.PENDING },
    { label: 'Đã xác nhận', value: ORDER_STATUS.CONFIRMED },
    { label: 'Đang giao', value: ORDER_STATUS.SHIPPING },
    { label: 'Đã giao', value: ORDER_STATUS.DELIVERED },
    { label: 'Đã hủy', value: ORDER_STATUS.CANCELLED },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
          Đơn hàng của bạn
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Theo dõi hành trình vận chuyển và lịch sử mua sách
        </p>
      </div>

      {/* Status Filter Horizontal Tabs (Smooth scroll on mobile) */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-800 no-scrollbar">
        {tabs.map((tab) => {
          const isActive = status === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => {
                if (tab.value) {
                  setSearchParams({ status: tab.value });
                } else {
                  setSearchParams({});
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 border border-gray-200/80 dark:border-gray-700'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Orders List Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      ) : ordersData && ordersData.length > 0 ? (
        <div className="space-y-4">
          {ordersData.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="group block bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 p-4 sm:p-6 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-700/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Package size={18} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                      Đơn hàng #{order.id}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Calendar size={13} />
                      {formatDate(order.created_at, 'long')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <StatusBadge
                    status={order.status}
                    statusMap={ORDER_STATUS_LABELS}
                    colorMap={ORDER_STATUS_COLORS}
                  />
                </div>
              </div>

              {/* Order summary row */}
              <div className="pt-3 flex items-center justify-between gap-2">
                <div className="text-xs text-gray-500">
                  <span>Tổng cộng: </span>
                  <span className="font-extrabold text-sm sm:text-base text-indigo-600 dark:text-indigo-400">
                    {formatVND(order.total_amount)}
                  </span>
                  <span className="text-gray-400 ml-1">
                    ({order.items?.length || 0} sản phẩm)
                  </span>
                </div>

                <div className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 flex items-center gap-1 transition-transform">
                  <span>Chi tiết</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 text-center space-y-4">
          <EmptyState
            title="Chưa có đơn hàng nào"
            description="Bạn chưa có đơn hàng nào ở trạng thái này. Hãy chọn cuốn sách bạn yêu thích và đặt ngay nhé!"
          />
          <div>
            <Link to="/books">
              <Button
                variant="primary"
                size="md"
                icon={<ArrowRight size={16} />}
                iconPosition="right"
              >
                Khám phá sách ngay
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderListPage;
