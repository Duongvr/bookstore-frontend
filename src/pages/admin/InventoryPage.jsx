import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import { getInventory, importInventory, getInventoryHistory } from '../../api/services/inventoryApi';
import { getBooks } from '../../api/services/bookApi';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import { formatDate } from '../../utils/formatters';
import { INVENTORY_TYPE_LABELS } from '../../utils/constants';
import { Plus } from 'lucide-react';

const importSchema = z.object({
  book_id: z.string().min(1, 'Vui lòng chọn sách'),
  quantity: z.coerce.number().positive('Số lượng phải > 0'),
  unit_cost: z.coerce.number().positive('Chi phí phải > 0'),
  notes: z.string().optional(),
});

const InventoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('inventory');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const page = parseInt(searchParams.get('page') || '1');

  const { data: inventoryData, loading: invLoading, refetch: invRefetch } = useFetch(
    async () => {
      const res = await getInventory({ page, limit: 10 });
      return res;
    },
    [page]
  );

  const { data: historyData, loading: histLoading } = useFetch(
    async () => {
      const res = await getInventoryHistory({ page, limit: 20 });
      return res.data || [];
    },
    [page]
  );

  const { data: books } = useFetch(async () => {
    const res = await getBooks({ limit: 100 });
    return res.data || [];
  }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(importSchema),
  });

  const onSubmit = async (data) => {
    try {
      await importInventory(data);
      showToast({ type: 'success', message: 'Nhập kho thành công' });
      setIsModalOpen(false);
      reset();
      invRefetch();
    } catch (err) {
      showToast({ type: 'error', message: err?.message });
    }
  };

  const invColumns = [
    { key: 'book_id', header: 'Sách', width: '200px', render: (_, row) => row.book?.title || '-' },
    { key: 'total_stock', header: 'Tổng kho', width: '100px' },
    { key: 'available_stock', header: 'Có sẵn', width: '100px' },
    { key: 'reserved_stock', header: 'Đã đặt', width: '100px' },
  ];

  const historyColumns = [
    { key: 'type', header: 'Loại', width: '120px', render: (v) => INVENTORY_TYPE_LABELS[v] || v },
    { key: 'quantity', header: 'Số lượng', width: '100px' },
    { key: 'created_at', header: 'Ngày', width: '150px', render: (v) => formatDate(v, 'long') },
    { key: 'notes', header: 'Ghi chú', width: '200px', render: (v) => v || '-' },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý kho</h1>
        <p className="text-gray-600 mt-1">Quản lý tồn kho sách</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 font-medium ${activeTab === 'inventory' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
        >
          Tồn kho
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
        >
          Lịch sử
        </button>
      </div>

      {/* Content */}
      {activeTab === 'inventory' && (
        <>
          <Button variant="primary" onClick={() => setIsModalOpen(true)} icon={<Plus size={18} />}>
            Nhập kho
          </Button>

          <DataTable
            columns={invColumns}
            data={inventoryData?.data || []}
            loading={invLoading}
            page={page}
            totalPages={inventoryData?.totalPages || 1}
            onPageChange={(p) => setSearchParams({ page: p.toString() })}
          />
        </>
      )}

      {activeTab === 'history' && (
        <DataTable
          columns={historyColumns}
          data={historyData || []}
          loading={histLoading}
          emptyText="Không có lịch sử"
        />
      )}

      {/* Modal */}
      {isModalOpen && (
        <Modal title="Nhập kho" onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Sách" required error={errors.book_id?.message}>
              <select {...register('book_id')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Chọn sách</option>
                {books?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Số lượng" required error={errors.quantity?.message}>
              <input {...register('quantity')} type="number" placeholder="Số lượng" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </FormField>

            <FormField label="Chi phí/Cuốn" required error={errors.unit_cost?.message}>
              <input {...register('unit_cost')} type="number" placeholder="Chi phí" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </FormField>

            <FormField label="Ghi chú">
              <textarea {...register('notes')} placeholder="Ghi chú" rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </FormField>

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
                Nhập kho
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default InventoryPage;
