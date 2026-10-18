import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFetch } from '../../hooks/useFetch';
import { getRevenue, getTopBooks } from '../../api/services/statsApi';
import { getOrders } from '../../api/services/orderApi';
import { formatVND, formatDate } from '../../utils/formatters';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../utils/constants';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { RefreshCw } from 'lucide-react';

/**
 * DashboardPage: Trang chủ admin
 * - Thống kê doanh thu
 * - Đơn hàng gần đây
 * - Sách bán chạy
 * - Biểu đồ
 */
const DashboardPage = () => {
  const { data: revenueData, loading: revenueLoading, refetch: refetchRevenue } = useFetch(
    async () => {
      const res = await getRevenue({ limit: 30 });
      return res.data || [];
    },
    []
  );

  const { data: topBooks, loading: topBooksLoading } = useFetch(
    async () => {
      const res = await getTopBooks({ limit: 5 });
      return res.data || [];
    },
    []
  );

  const { data: recentOrders, loading: ordersLoading } = useFetch(
    async () => {
      const res = await getOrders({ limit: 5 });
      return res.data || [];
    },
    []
  );

  const handleRefresh = () => {
    refetchRevenue();
  };

  const isLoading = revenueLoading || topBooksLoading || ordersLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  // Calculate stats
  const totalRevenue = revenueData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
  const totalOrders = recentOrders?.length || 0;

  const statCards = [
    {
      label: 'Doanh thu tháng này',
      value: formatVND(totalRevenue),
      icon: '💰',
      trend: '+12%',
    },
    {
      label: 'Đơn hàng mới',
      value: totalOrders,
      icon: '📦',
      trend: '+5',
    },
    {
      label: 'Sách bán chạy',
      value: topBooks?.length || 0,
      icon: '📚',
      trend: 'Top',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Tổng quan hoạt động cửa hàng</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRefresh}
          icon={<RefreshCw size={18} />}
        >
          Làm mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">{card.label}</p>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-green-600 mb-1">{card.trend}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        {revenueData && revenueData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Doanh thu
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(v) => formatVND(v)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#3b82f6"
                  name="Doanh thu"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Books */}
        {topBooks && topBooks.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Top 5 sách bán chạy
            </h2>
            <div className="space-y-3">
              {topBooks.map((book, idx) => (
                <div
                  key={book.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-lg font-bold text-blue-600 min-w-[24px]">
                      #{idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 line-clamp-1">
                        {book.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {book.soldCount || 0} bản bán
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900 flex-shrink-0 ml-2">
                    {formatVND(book.revenue || 0)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Orders */}
      {recentOrders && recentOrders.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Đơn hàng gần đây
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">
                    Đơn hàng
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">
                    Khách hàng
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-900">
                    Ngày
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900">
                    Tổng tiền
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-blue-600 font-medium">
                      #{order.id}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {order.customer_name}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {formatDate(order.created_at, 'short')}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                      {formatVND(order.total_amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100'
                          }`}
                      >
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
