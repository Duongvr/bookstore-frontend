import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import { getBooks, createBook, updateBook, deleteBook } from '../../api/services/bookApi';
import { getCategories } from '../../api/services/categoryApi';
import { getAuthors } from '../../api/services/authorApi';
import { getPublishers } from '../../api/services/publisherApi';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import ConfirmModal from '../../components/common/ConfirmModal';
import { formatVND } from '../../utils/formatters';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const bookSchema = z.object({
  title: z.string().min(2, 'Tiêu đề phải ít nhất 2 ký tự'),
  description: z.string().optional(),
  price: z.coerce.number().positive('Giá phải lớn hơn 0'),
  stock_quantity: z.coerce.number().min(0, 'Kho phải >= 0'),
  category_id: z.string().min(1, 'Vui lòng chọn danh mục'),
  publisher_id: z.string().min(1, 'Vui lòng chọn nhà xuất bản'),
  isbn: z.string().optional(),
});

const BookManagePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('q') || '';

  const { data: booksData, loading, refetch } = useFetch(
    async () => {
      const res = await getBooks({ q: search, page, limit: 10 });
      return res;
    },
    [page, search]
  );

  const { data: categories } = useFetch(async () => {
    const res = await getCategories();
    return res.data || [];
  }, []);

  const { data: publishers } = useFetch(async () => {
    const res = await getPublishers();
    return res.data || [];
  }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(bookSchema),
    defaultValues: editingItem || {},
  });

  const handleAdd = () => {
    setEditingItem(null);
    reset({});
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    reset(item);
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingItem) {
        await updateBook(editingItem.id, data);
        showToast({ type: 'success', message: 'Cập nhật sách thành công' });
      } else {
        await createBook(data);
        showToast({ type: 'success', message: 'Thêm sách thành công' });
      }
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      showToast({ type: 'error', message: err?.message || 'Lỗi' });
    }
  };

  const columns = [
    { key: 'title', header: 'Tên sách', width: '250px' },
    {
      key: 'category',
      header: 'Danh mục',
      width: '150px',
      render: (val, row) => row.category?.name || '-',
    },
    {
      key: 'price',
      header: 'Giá',
      width: '120px',
      render: (val) => formatVND(val),
    },
    {
      key: 'stock_quantity',
      header: 'Kho',
      width: '100px',
      render: (val) => val || 0,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý sách</h1>
        <p className="text-gray-600 mt-1">Quản lý danh sách sách</p>
      </div>

      {/* Search and Add */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Tìm kiếm sách..."
            value={search}
            onChange={(e) => setSearchParams({ q: e.target.value, page: '1' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button variant="primary" onClick={handleAdd} icon={<Plus size={18} />}>
          Thêm sách
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={[
          ...columns,
          {
            key: 'actions',
            header: 'Thao tác',
            width: '120px',
            render: (_, row) => (
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(row)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => setDeleteTarget(row)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ),
          },
        ]}
        data={booksData?.data || []}
        loading={loading}
        page={page}
        totalPages={booksData?.totalPages || 1}
        onPageChange={(p) => setSearchParams({ page: p.toString(), q: search })}
      />

      {/* Modal */}
      {isModalOpen && (
        <Modal title={editingItem ? 'Chỉnh sửa sách' : 'Thêm sách'} onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-96 overflow-y-auto">
            <FormField label="Tiêu đề" required error={errors.title?.message}>
              <input {...register('title')} type="text" placeholder="Tiêu đề sách" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </FormField>

            <FormField label="Mô tả">
              <textarea {...register('description')} placeholder="Mô tả" rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Giá" required error={errors.price?.message}>
                <input {...register('price')} type="number" placeholder="Giá" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </FormField>

              <FormField label="Kho" required error={errors.stock_quantity?.message}>
                <input {...register('stock_quantity')} type="number" placeholder="Số lượng" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </FormField>
            </div>

            <FormField label="Danh mục" required error={errors.category_id?.message}>
              <select {...register('category_id')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Chọn danh mục</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Nhà xuất bản" required error={errors.publisher_id?.message}>
              <select {...register('publisher_id')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Chọn nhà xuất bản</option>
                {publishers?.map((pub) => (
                  <option key={pub.id} value={pub.id}>
                    {pub.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="ISBN">
              <input {...register('isbn')} type="text" placeholder="ISBN" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </FormField>

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
                {editingItem ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmModal
          title="Xóa sách"
          message="Bạn có chắc chắn muốn xóa cuốn sách này?"
          onConfirm={async () => {
            try {
              await deleteBook(deleteTarget.id);
              showToast({ type: 'success', message: 'Xóa thành công' });
              setDeleteTarget(null);
              refetch();
            } catch (err) {
              showToast({ type: 'error', message: err?.message });
            }
          }}
          onCancel={() => setDeleteTarget(null)}
          confirmVariant="danger"
          confirmText="Xóa"
        />
      )}
    </div>
  );
};

export default BookManagePage;
