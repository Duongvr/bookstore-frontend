import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import { getUsers, createUser, updateUserRole, updateUserStatus } from '../../api/services/userApi';
import { USER_ROLES, USER_STATUS, USER_ROLE_LABELS, USER_STATUS_LABELS, USER_ROLE_COLORS, USER_STATUS_COLORS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import { Plus, Shield, Lock } from 'lucide-react';

const createUserSchema = z.object({
  username: z.string().min(3, 'Username ít nhất 3 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
  full_name: z.string().min(2, 'Tên ít nhất 2 ký tự'),
  role: z.enum(Object.values(USER_ROLES)),
});

const UserManagePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('q') || '';

  const { data: usersData, loading, refetch } = useFetch(
    async () => {
      const res = await getUsers({ q: search, page, limit: 20 });
      return res;
    },
    [page, search]
  );

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(createUserSchema),
  });

  const handleAdd = () => {
    reset({});
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      await createUser(data);
      showToast({ type: 'success', message: 'Tạo user thành công' });
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      showToast({ type: 'error', message: err?.message });
    }
  };

  const handleChangeRole = async (user, newRole) => {
    try {
      setRoleLoading(true);
      await updateUserRole(user.id, { role: newRole });
      showToast({ type: 'success', message: 'Cập nhật vai trò thành công' });
      setRoleTarget(null);
      refetch();
    } catch (err) {
      showToast({ type: 'error', message: err?.message });
    } finally {
      setRoleLoading(false);
    }
  };

  const handleChangeStatus = async (user, newStatus) => {
    try {
      setStatusLoading(true);
      await updateUserStatus(user.id, { status: newStatus });
      showToast({ type: 'success', message: 'Cập nhật trạng thái thành công' });
      setStatusTarget(null);
      refetch();
    } catch (err) {
      showToast({ type: 'error', message: err?.message });
    } finally {
      setStatusLoading(false);
    }
  };

  const columns = [
    { key: 'username', header: 'Username', width: '150px' },
    { key: 'full_name', header: 'Tên', width: '150px' },
    { key: 'email', header: 'Email', width: '180px' },
    {
      key: 'role',
      header: 'Vai trò',
      width: '120px',
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${USER_ROLE_COLORS[v]}`}>
            {USER_ROLE_LABELS[v]}
          </span>
          {row.role !== USER_ROLES.CUSTOMER && (
            <button
              onClick={() => setRoleTarget(row)}
              className="text-blue-600 hover:text-blue-700"
              title="Đổi vai trò"
            >
              <Shield size={14} />
            </button>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: '120px',
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${USER_STATUS_COLORS[v]}`}>
            {USER_STATUS_LABELS[v]}
          </span>
          <button
            onClick={() => setStatusTarget(row)}
            className="text-orange-600 hover:text-orange-700"
            title="Đổi trạng thái"
          >
            <Lock size={14} />
          </button>
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Tạo lúc',
      width: '150px',
      render: (v) => formatDate(v, 'short'),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
        <p className="text-gray-600 mt-1">Quản lý user, staff, admin</p>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearchParams({ q: e.target.value, page: '1' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button variant="primary" onClick={handleAdd} icon={<Plus size={18} />}>
          Thêm user
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={usersData?.data || []}
        loading={loading}
        page={page}
        totalPages={usersData?.totalPages || 1}
        onPageChange={(p) => setSearchParams({ page: p.toString(), q: search })}
      />

      {/* Create User Modal */}
      {isModalOpen && (
        <Modal title="Thêm người dùng" onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Username" required error={errors.username?.message}>
              <input
                {...register('username')}
                type="text"
                placeholder="Username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>

            <FormField label="Email" required error={errors.email?.message}>
              <input
                {...register('email')}
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>

            <FormField label="Tên" required error={errors.full_name?.message}>
              <input
                {...register('full_name')}
                type="text"
                placeholder="Tên"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>

            <FormField label="Mật khẩu" required error={errors.password?.message}>
              <input
                {...register('password')}
                type="password"
                placeholder="Mật khẩu"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>

            <FormField label="Vai trò" required error={errors.role?.message}>
              <select
                {...register('role')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(USER_ROLES).map(([_, value]) => (
                  <option key={value} value={value}>
                    {USER_ROLE_LABELS[value]}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
                Tạo
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Change Role Modal */}
      {roleTarget && (
        <Modal title="Đổi vai trò" onClose={() => setRoleTarget(null)}>
          <div className="space-y-4">
            <p className="text-gray-600">
              Vai trò hiện tại: <span className="font-medium">{USER_ROLE_LABELS[roleTarget.role]}</span>
            </p>
            <div className="space-y-2">
              {Object.entries(USER_ROLES).map(([_, value]) => (
                <Button
                  key={value}
                  variant={roleTarget.role === value ? 'primary' : 'secondary'}
                  size="sm"
                  className="w-full"
                  onClick={() => handleChangeRole(roleTarget, value)}
                  loading={roleLoading}
                  disabled={roleLoading}
                >
                  {USER_ROLE_LABELS[value]}
                </Button>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Change Status Modal */}
      {statusTarget && (
        <Modal title="Đổi trạng thái" onClose={() => setStatusTarget(null)}>
          <div className="space-y-4">
            <p className="text-gray-600">
              Trạng thái hiện tại: <span className="font-medium">{USER_STATUS_LABELS[statusTarget.status]}</span>
            </p>
            <div className="space-y-2">
              {Object.entries(USER_STATUS).map(([_, value]) => (
                <Button
                  key={value}
                  variant={statusTarget.status === value ? 'primary' : 'secondary'}
                  size="sm"
                  className="w-full"
                  onClick={() => handleChangeStatus(statusTarget, value)}
                  loading={statusLoading}
                  disabled={statusLoading}
                >
                  {USER_STATUS_LABELS[value]}
                </Button>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserManagePage;
