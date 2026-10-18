import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Package, MapPin, CreditCard, Clock, CheckCircle2, Truck, BookOpen } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import { getOrderDetail, cancelOrder } from '../../api/services/orderApi';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_METHOD_LABELS } from '../../utils/constants';
import { formatVND, formatDate } from '../../utils/formatters';
import Button from '../../components/common/Button';
import ConfirmModal from '../../components/common/ConfirmModal';
import Spinner from '../../components/common/Spinner';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';

/**
 * OrderDetailPage: Chi tiết đơn hàng tối ưu Responsive trên máy tính và điện thoại
 */
const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const { data: order, loading, error, refetch } = useFetch(
    async () => {
      const res = await getOrderDetail(id);
      return res.data;
    },
    [id]
  );

  const canCancel = order && ['PENDING', 'CONFIRMED'].includes(order.status);

  const handleCancel = async () => {
    try {
      setIsCancelling(true);
      await cancelOrder(id);
      showToast({
        type: 'success',
        message: 'Đơn hàng đã được hủy thành công',
      });
      setCancelConfirm(false);
      refetch();
    } catch (err) {
      showToast({
        type: 'error',
        message: err?.message || 'Không thể hủy đơn hàng',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(-1)}
          icon={<ArrowLeft size={16} />}
          className="mb-4"
        >
          Quay lại
        </Button>
        <ErrorState message="Không thể tải thông tin đơn hàng này" onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-indigo-600 transition mb-2"
          >
            <ArrowLeft size={16} />
            Quay lại danh sách đơn hàng
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            Đơn hàng #{order.id}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Đặt ngày: {formatDate(order.created_at, 'long')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-500">Trạng thái:</span>
          <StatusBadge
            status={order.status}
            statusMap={ORDER_STATUS_LABELS}
            colorMap={ORDER_STATUS_COLORS}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Items & Shipping (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Order Items */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl border border-gray-200/80 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Package size={20} className="text-indigo-600" />
              Sản phẩm trong đơn ({order.items?.length || 0})
            </h2>

            <div className="space-y-3 divide-y divide-gray-100 dark:divide-gray-700/60">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="pt-3 first:pt-0 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-16 rounded-lg bg-slate-100 dark:bg-gray-700 flex items-center justify-center text-indigo-400 flex-shrink-0 border border-gray-200 dark:border-gray-700">
                      <BookOpen size={20} />
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={`/books/${item.book_id}`}
                        className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 hover:text-indigo-600 truncate block"
                      >
                        {item.title}
                      </Link>
                      <p className="text-xs text-gray-500">
                        {item.quantity} x {formatVND(item.unit_price)}
                      </p>
                    </div>
                  </div>
                  <span className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-gray-100 flex-shrink-0">
                    {formatVND(item.quantity * item.unit_price)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address & Customer Info */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl border border-gray-200/80 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-indigo-600" />
              Thông tin nhận hàng
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <p className="text-gray-400 text-xs">Người nhận:</p>
                <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Số điện thoại:</p>
                <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">{order.customer_phone}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Email:</p>
                <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">{order.customer_email || 'Không có'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-gray-400 text-xs">Địa chỉ giao hàng:</p>
                <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">{order.shipping_address}</p>
              </div>
              {order.notes && (
                <div className="sm:col-span-2 p-3 bg-slate-50 dark:bg-gray-900 rounded-xl">
                  <p className="text-gray-400 text-xs font-semibold">Ghi chú của bạn:</p>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline Status History */}
          {order.status_history && order.status_history.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl border border-gray-200/80 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock size={20} className="text-indigo-600" />
                Lịch sử xử lý đơn hàng
              </h2>

              <div className="space-y-4 pl-2">
                {order.status_history.map((history, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3.5 h-3.5 bg-indigo-600 rounded-full ring-4 ring-indigo-100 dark:ring-indigo-950" />
                      {idx < order.status_history.length - 1 && (
                        <div className="w-0.5 h-12 bg-gray-200 dark:bg-gray-700 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <p className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                        {ORDER_STATUS_LABELS[history.status]}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {formatDate(history.changed_at, 'long')}
                      </p>
                      {history.notes && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                          {history.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Payment & Cancel Action (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl border border-gray-200/80 dark:border-gray-700 p-5 sm:p-6 shadow-sm sticky top-24 space-y-4">
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
              <CreditCard size={18} className="text-indigo-600" />
              Chi tiết thanh toán
            </h2>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tạm tính tiền sách:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-200">
                  {formatVND(order.subtotal || order.total_amount)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Phí vận chuyển:</span>
                <span className="font-semibold text-emerald-600">Miễn phí</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Hình thức:</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">
                  {PAYMENT_METHOD_LABELS[order.payment_method] || 'COD'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-baseline">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Tổng thanh toán</p>
                <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {formatVND(order.total_amount)}
                </p>
              </div>
            </div>

            {/* Cancel Action if allowed */}
            {canCancel && (
              <div className="pt-2">
                <Button
                  variant="danger"
                  size="md"
                  onClick={() => setCancelConfirm(true)}
                  className="w-full text-xs font-bold"
                  icon={<AlertCircle size={16} />}
                >
                  Hủy đơn hàng này
                </Button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Cancel Confirmation Modal */}
      {cancelConfirm && (
        <ConfirmModal
          title="Xác nhận hủy đơn hàng?"
          message="Bạn có chắc chắn muốn hủy đơn hàng này không? Sau khi hủy, bạn sẽ cần đặt lại nếu muốn mua."
          onConfirm={handleCancel}
          onCancel={() => setCancelConfirm(false)}
          isLoading={isCancelling}
          confirmText="Xác nhận hủy"
          confirmVariant="danger"
        />
      )}
    </div>
  );
};

export default OrderDetailPage;
