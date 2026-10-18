import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader, ShieldCheck, CreditCard, Banknote, MapPin, Truck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { createOrder } from '../../api/services/orderApi';
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '../../utils/constants';
import { formatVND } from '../../utils/formatters';
import { calculateCartTotal, isValidPhoneVN } from '../../utils/helpers';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Tên phải ít nhất 2 ký tự'),
  phone: z.string().refine(isValidPhoneVN, 'Số điện thoại không hợp lệ (ví dụ: 0912345678)'),
  email: z.string().email('Địa chỉ email không hợp lệ'),
  address: z.string().min(5, 'Địa chỉ chi tiết phải ít nhất 5 ký tự'),
  city: z.string().min(2, 'Vui lòng nhập tỉnh / thành phố'),
  district: z.string().min(2, 'Vui lòng nhập quận / huyện'),
  paymentMethod: z.enum(Object.values(PAYMENT_METHODS)),
  notes: z.string().optional(),
});

/**
 * CheckoutPage: Trang thanh toán đặt hàng tối ưu Responsive toàn diện
 */
const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: PAYMENT_METHODS.COD,
    },
  });

  const selectedPaymentMethod = watch('paymentMethod');
  const total = calculateCartTotal(cart?.items || []);

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <p className="text-gray-600 dark:text-gray-400">Giỏ hàng của bạn đang trống</p>
        <Button variant="primary" onClick={() => navigate('/books')}>
          Quay lại mua sắm
        </Button>
      </div>
    );
  }

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      const orderData = {
        customer_name: data.fullName,
        customer_phone: data.phone,
        customer_email: data.email,
        shipping_address: `${data.address}, ${data.district}, ${data.city}`,
        payment_method: data.paymentMethod,
        notes: data.notes,
        items: cart.items.map((item) => ({
          book_id: item.book_id,
          quantity: item.quantity,
        })),
      };

      const response = await createOrder(orderData);

      showToast({
        type: 'success',
        message: 'Đơn hàng đã được tạo thành công!',
      });

      await clearCart();
      navigate(`/orders/${response.data.id}`, { replace: true });
    } catch (err) {
      showToast({
        type: 'error',
        message: err?.message || 'Không thể tạo đơn hàng, vui lòng thử lại',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-indigo-600 transition mb-3"
        >
          <ArrowLeft size={16} />
          Quay lại giỏ hàng
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
          Thanh toán đơn hàng
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Vui lòng kiểm tra địa chỉ nhận hàng và phương thức thanh toán
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Form: Shipping Info & Payment Methods (7 or 8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Delivery Address Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl border border-gray-200/80 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-indigo-600" />
                Thông tin nhận hàng
              </h2>

              <div className="space-y-4">
                <FormField
                  label="Họ và tên người nhận"
                  required
                  error={errors.fullName?.message}
                >
                  <input
                    {...register('fullName')}
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Số điện thoại"
                    required
                    error={errors.phone?.message}
                  >
                    <input
                      {...register('phone')}
                      type="tel"
                      placeholder="0912345678"
                      className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </FormField>

                  <FormField
                    label="Email nhận thông báo"
                    required
                    error={errors.email?.message}
                  >
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="ban@gmail.com"
                      className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </FormField>
                </div>

                <FormField
                  label="Địa chỉ chi tiết (số nhà, ngõ, tên đường)"
                  required
                  error={errors.address?.message}
                >
                  <input
                    {...register('address')}
                    type="text"
                    placeholder="Số 12 ngõ 34 đường Giải Phóng"
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Quận / Huyện"
                    required
                    error={errors.district?.message}
                  >
                    <input
                      {...register('district')}
                      type="text"
                      placeholder="Quận Hai Bà Trưng"
                      className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </FormField>

                  <FormField
                    label="Tỉnh / Thành phố"
                    required
                    error={errors.city?.message}
                  >
                    <input
                      {...register('city')}
                      type="text"
                      placeholder="Hà Nội"
                      className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </FormField>
                </div>
              </div>
            </div>

            {/* Payment Methods Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl border border-gray-200/80 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-indigo-600" />
                Phương thức thanh toán
              </h2>

              <div className="space-y-3">
                {Object.entries(PAYMENT_METHODS).map(([key, value]) => {
                  const isChecked = selectedPaymentMethod === value;
                  return (
                    <label
                      key={value}
                      className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition ${
                        isChecked
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-600'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          {...register('paymentMethod')}
                          type="radio"
                          value={value}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <div className="flex items-center gap-2">
                          {value === PAYMENT_METHODS.COD ? (
                            <Banknote size={20} className="text-emerald-600" />
                          ) : (
                            <CreditCard size={20} className="text-indigo-600" />
                          )}
                          <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                            {PAYMENT_METHOD_LABELS[value]}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {value === PAYMENT_METHODS.COD ? 'Nhận hàng trả tiền' : 'Miễn phí tiện ích'}
                      </span>
                    </label>
                  );
                })}
              </div>

              {selectedPaymentMethod === PAYMENT_METHODS.COD && (
                <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <Truck size={16} className="flex-shrink-0" />
                  <span>Bạn có thể kiểm tra sách trước khi thanh toán cho shipper.</span>
                </div>
              )}
            </div>

            {/* Order Note */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl border border-gray-200/80 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white mb-2">
                Ghi chú cho đơn hàng
              </h2>
              <textarea
                {...register('notes')}
                placeholder="Ví dụ: Giao vào giờ hành chính, gọi điện trước khi giao..."
                rows={2}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

          </div>

          {/* Right Column: Order Review & Submit (4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl border border-gray-200/80 dark:border-gray-700 p-5 sm:p-6 shadow-sm sticky top-24 space-y-4">
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-700">
                Đơn hàng ({cart.items.length} món)
              </h2>

              {/* Items List Mini */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1 text-xs">
                {cart.items.map((item) => (
                  <div key={item.book_id} className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {item.title}
                      </p>
                      <p className="text-gray-400">SL: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-gray-100 flex-shrink-0">
                      {formatVND(item.quantity * item.unit_price)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Costs Breakdown */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tạm tính:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-200">{formatVND(total)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Phí giao hàng:</span>
                  <span className="font-semibold text-emerald-600">Miễn phí</span>
                </div>
              </div>

              {/* Final Total */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-baseline">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Tổng thanh toán</p>
                  <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {formatVND(total)}
                  </p>
                </div>
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold shadow-lg shadow-indigo-600/30"
              >
                {isSubmitting ? 'Đang gửi đơn hàng...' : 'Đặt hàng ngay'}
              </Button>

              <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Cam kết bảo mật & quyền lợi người mua</span>
              </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
