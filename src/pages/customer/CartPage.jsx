import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ArrowRight, X, ShoppingBag, ArrowLeft, BookOpen } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { formatVND } from '../../utils/formatters';
import { calculateCartTotal } from '../../utils/helpers';
import Button from '../../components/common/Button';
import QuantityInput from '../../components/common/QuantityInput';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/common/EmptyState';

/**
 * CartPage: Trang giỏ hàng tối ưu Responsive toàn diện
 * Desktop hiển thị bảng rộng, Mobile hiển thị danh sách thẻ tiện thao tác
 */
const CartPage = () => {
  const { cart, updateItem, removeItem, clearCart } = useCart();
  const { showToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  const handleQuantityChange = async (bookId, newQuantity) => {
    try {
      if (newQuantity === 0) {
        setDeleteTarget({ id: bookId });
      } else {
        await updateItem(bookId, newQuantity);
      }
    } catch (err) {
      showToast({
        type: 'error',
        message: err?.message || 'Không thể cập nhật số lượng',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      await removeItem(deleteTarget.id);
      showToast({
        type: 'success',
        message: 'Đã xóa sản phẩm khỏi giỏ hàng',
      });
      setDeleteTarget(null);
    } catch (err) {
      showToast({
        type: 'error',
        message: err?.message || 'Không thể xóa sản phẩm',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      setClearConfirm(false);
      showToast({
        type: 'success',
        message: 'Đã xóa toàn bộ giỏ hàng',
      });
    } catch (err) {
      showToast({
        type: 'error',
        message: err?.message || 'Không thể xóa giỏ hàng',
      });
    }
  };

  const total = calculateCartTotal(cart?.items || []);

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 bg-indigo-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
          <ShoppingBag size={36} />
        </div>
        <EmptyState
          title="Giỏ hàng của bạn đang trống"
          description="Hãy khám phá hàng ngàn cuốn sách hấp dẫn và thêm vào giỏ hàng ngay nhé!"
        />
        <div className="pt-4">
          <Link to="/books">
            <Button
              variant="primary"
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
              icon={<ArrowRight size={18} />}
              iconPosition="right"
            >
              Khám phá sách ngay
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Giỏ hàng của bạn
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Bạn đang có <strong className="text-indigo-600">{cart.items.length}</strong> loại sản phẩm
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/books"
            className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            Tiếp tục mua sách
          </Link>
          <button
            onClick={() => setClearConfirm(true)}
            className="text-xs text-rose-500 hover:text-rose-600 font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
          >
            Xóa tất cả
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cart Items List / Table */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Mobile View: Flexible Card Items */}
          <div className="block lg:hidden space-y-3">
            {cart.items.map((item) => (
              <div
                key={item.id || item.book_id}
                className="bg-white dark:bg-gray-800 p-3.5 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm flex gap-3"
              >
                {/* Book Thumbnail */}
                <Link
                  to={`/books/${item.book_id}`}
                  className="w-20 h-28 bg-slate-100 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0 relative border border-gray-200 dark:border-gray-700"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-indigo-400">
                      <BookOpen size={24} />
                    </div>
                  )}
                </Link>

                {/* Book Detail & Action */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/books/${item.book_id}`}
                        className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-2 hover:text-indigo-600"
                      >
                        {item.title}
                      </Link>
                      <button
                        onClick={() => setDeleteTarget({ id: item.book_id })}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg transition"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                      {formatVND(item.unit_price)}
                    </p>
                  </div>

                  {/* Quantity Stepper & Subtotal */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700/60 mt-2">
                    <QuantityInput
                      value={item.quantity}
                      onChange={(newQty) => handleQuantityChange(item.book_id, newQty)}
                      size="sm"
                    />
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400">Thành tiền</p>
                      <p className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white">
                        {formatVND(item.quantity * item.unit_price)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View: Full Data Table */}
          <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-gray-900/50 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-5 py-3.5">Cuốn sách</th>
                  <th className="px-4 py-3.5 text-center">Đơn giá</th>
                  <th className="px-4 py-3.5 text-center">Số lượng</th>
                  <th className="px-4 py-3.5 text-right">Thành tiền</th>
                  <th className="px-4 py-3.5 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-sm">
                {cart.items.map((item) => (
                  <tr key={item.id || item.book_id} className="hover:bg-slate-50/50 dark:hover:bg-gray-700/20 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/books/${item.book_id}`}
                          className="w-14 h-20 rounded-lg bg-slate-100 dark:bg-gray-700 overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700"
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-indigo-400">
                              <BookOpen size={20} />
                            </div>
                          )}
                        </Link>
                        <Link
                          to={`/books/${item.book_id}`}
                          className="font-bold text-gray-900 dark:text-gray-100 hover:text-indigo-600 line-clamp-2 max-w-xs"
                        >
                          {item.title}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center font-semibold text-gray-700 dark:text-gray-300">
                      {formatVND(item.unit_price)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="inline-block">
                        <QuantityInput
                          value={item.quantity}
                          onChange={(newQty) => handleQuantityChange(item.book_id, newQty)}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-extrabold text-indigo-600 dark:text-indigo-400">
                      {formatVND(item.quantity * item.unit_price)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => setDeleteTarget({ id: item.book_id })}
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition"
                        title="Xóa cuốn sách này"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Summary Column (Sticky) */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl border border-gray-200/80 dark:border-gray-700 p-5 sm:p-6 shadow-sm sticky top-24 space-y-5">
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-700">
              Tóm tắt đơn hàng
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tạm tính ({cart.items.length} món):</span>
                <span className="font-semibold text-gray-900 dark:text-gray-200">{formatVND(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Phí vận chuyển:</span>
                <span className="font-semibold text-emerald-600">Miễn phí giao hàng</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Thuế VAT:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-200">Đã bao gồm</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-baseline">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Tổng thanh toán</p>
                <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {formatVND(total)}
                </p>
              </div>
            </div>

            <Link to="/checkout" className="block w-full">
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight size={18} />}
                iconPosition="right"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold shadow-lg shadow-indigo-600/30"
              >
                Tiến hành đặt hàng
              </Button>
            </Link>

            <p className="text-[11px] text-center text-gray-400">
              🔒 Bảo mật thông tin thanh toán & Hỗ trợ kiểm hàng khi nhận
            </p>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <ConfirmModal
          title="Xóa cuốn sách khỏi giỏ?"
          message="Bạn có chắc chắn muốn bỏ cuốn sách này ra khỏi giỏ hàng của mình không?"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
          isLoading={isDeleting}
          confirmText="Xác nhận xóa"
          confirmVariant="danger"
        />
      )}

      {/* Clear cart confirmation modal */}
      {clearConfirm && (
        <ConfirmModal
          title="Làm trống toàn bộ giỏ hàng?"
          message="Toàn bộ sách trong giỏ hàng sẽ bị xóa. Bạn có muốn tiếp tục?"
          onConfirm={handleClearCart}
          onCancel={() => setClearConfirm(false)}
          confirmText="Xóa tất cả"
          confirmVariant="danger"
        />
      )}
    </div>
  );
};

export default CartPage;
