import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import { getOrders, confirmOrder } from '../../api/services/orderApi';
import { ORDER_STATUS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../utils/constants';
import { formatVND, formatDate } from '../../utils/formatters';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import ConfirmModal from '../../components/common/ConfirmModal';
import { ChevronRight, Check } from 'lucide-react';

const OrderManagePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const page = parseInt(searchParams.get('page') || '1');
  const status = searchParams.get('status') || '';

  const { data: ordersData, loading, refetch } = useFetch(
    async () => {
      const res = await getOrders({
        status: status || undefined,
        page,
        limit: 20,
      });
      return res;
    },
    [page, status]
  );

  const tabs = [
    { label: 'Tất cả', value: '' },
    { label: 'Chờ xác nhận', value: ORDER_STATUS.PENDING },
    { label: 'Đã xác nhận', value: ORDER_STATUS.CONFIRMED },
    { label: 'Đang giao', value: ORDER_STATUS.SHIPPING },
    { label: 'Đã giao', value: ORDER_STATUS.DELIVERED },
  ];

  const handleConfirm = async () => {
    if (!confirmTarget) return;
    try {
      setIsConfirming(true);
      await confirmOrder(confirmTarget.id);
      showToast({ type: 'success', message: 'Xác nhận đơn hàng thành công' });
      setConfirmTarget(null);
      refetch();
    } catch (err) {
      showToast({ type: 'error', message: err?.message });
    } finally {
      setIsConfirming(false);
    }
  };

  const columns = [
    {
      key: 'id',
      header: 'Đơn hàng',
      width: '100px',
      render: (v) => `#${v}`,
    },
    {
      key: 'customer_name',
      header: 'Khách hàng',
      width: '150px',
    },
    {
      key: 'total_amount',
      header: 'Tổng tiền',
      width: '120px',
      render: (v) => formatVND(v),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: '130px',
      render: (v) => (
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${ORDER_STATUS_COLORS[v]}`}>
          {ORDER_STATUS_LABELS[v]}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Ngày tạo',
      width: '150px',
      render: (v) => formatDate(v, 'short'),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      width: '150px',
      render: (_, row) => (
        <div className="flex gap-2">
          <Link
            to={`/admin/orders/${row.id}`}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            Xem chi tiết <ChevronRight size={14} />
          </Link>
          {row.status === ORDER_STATUS.PENDING && (
            <Button
              size="xs"
              variant="primary"
              onClick={() => setConfirmTarget(row)}
              icon={<Check size={14} />}
            >
              Xác nhận
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn hàng</h1>
        <p className="text-gray-600 mt-1">Quản lý và xác nhận đơn hàng</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              if (tab.value) {
                setSearchParams({ status: tab.value, page: '1' });
              } else {
                setSearchParams({});
              }
            }}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              status === tab.value
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={ordersData?.data || []}
        loading={loading}
        page={page}
        totalPages={ordersData?.totalPages || 1}
        onPageChange={(p) => setSearchParams({ ...Object.fromEntries(searchParams), page: p.toString() })}
      />

      {/* Confirm Modal */}
      {confirmTarget && (
        <ConfirmModal
          title="Xác nhận đơn hàng"
          message={`Xác nhận đơn hàng #${confirmTarget.id}?`}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmTarget(null)}
          isLoading={isConfirming}
          confirmText="Xác nhận"
        />
      )}
    </div>
  );
};

export default OrderManagePage;
