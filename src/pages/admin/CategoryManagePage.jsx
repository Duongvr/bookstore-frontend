import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/services/categoryApi';
import CrudTable from '../../components/features/CrudTable';
import Modal from '../../components/common/Modal';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';

/**
 * CategoryManagePage: Quản lý danh mục
 * - Danh sách danh mục
 * - Thêm/sửa/xóa danh mục
 */
const categorySchema = z.object({
  name: z.string().min(2, 'Tên phải ít nhất 2 ký tự'),
  description: z.string().optional(),
  icon: z.string().optional(),
});

const CategoryManagePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('q') || '';

  const { data: categoriesData, loading, refetch } = useFetch(
    async () => {
      const res = await getCategories({
        q: search,
        page,
        limit: 10,
      });
      return res;
    },
    [page, search]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(categorySchema),
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

  const handleDeleteCategory = async (id) => {
    try {
      await deleteCategory(id);
      showToast({ type: 'success', message: 'Xóa danh mục thành công' });
      refetch();
    } catch (err) {
      showToast({ type: 'error', message: err?.message || 'Xóa thất bại' });
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingItem) {
        await updateCategory(editingItem.id, data);
        showToast({ type: 'success', message: 'Cập nhật thành công' });
      } else {
        await createCategory(data);
        showToast({ type: 'success', message: 'Thêm mới thành công' });
      }
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      showToast({ type: 'error', message: err?.message || 'Lỗi' });
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Tên',
      width: '200px',
      accessor: 'name',
    },
    {
      key: 'description',
      header: 'Mô tả',
      width: '300px',
      accessor: 'description',
      render: (value) => value ? value.substring(0, 50) + '...' : '-',
    },
    {
      key: 'icon',
      header: 'Icon',
      width: '100px',
      accessor: 'icon',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý danh mục</h1>
        <p className="text-gray-600 mt-1">Quản lý danh mục sách</p>
      </div>

      <CrudTable
        data={categoriesData?.data || []}
        columns={columns}
        loading={loading}
        page={page}
        totalPages={categoriesData?.totalPages || 1}
        onPageChange={(p) => setSearchParams({ page: p.toString(), q: search })}
        onSearch={(q) => setSearchParams({ q })}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDeleteCategory}
        searchPlaceholder="Tìm kiếm danh mục..."
      />

      {/* Modal */}
      {isModalOpen && (
        <Modal
          title={editingItem ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}
          onClose={() => setIsModalOpen(false)}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Tên" required error={errors.name?.message}>
              <input
                {...register('name')}
                type="text"
                placeholder="Tên danh mục"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>

            <FormField label="Mô tả" error={errors.description?.message}>
              <textarea
                {...register('description')}
                placeholder="Mô tả danh mục"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>

            <FormField label="Icon" error={errors.icon?.message}>
              <input
                {...register('icon')}
                type="text"
                placeholder="Emoji hoặc biểu tượng"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {editingItem ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CategoryManagePage;
