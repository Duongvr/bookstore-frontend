import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShoppingCart,
  ArrowLeft,
  Heart,
  Share2,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  BookOpen,
  Zap,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { getBookDetail, getBooks } from '../../api/services/bookApi';
import { formatVND, formatDate } from '../../utils/formatters';
import { getStockStatus } from '../../utils/helpers';
import { STOCK_STATUS_LABELS, STOCK_STATUS_COLORS } from '../../utils/constants';
import BookCard from '../../components/features/BookCard';
import Button from '../../components/common/Button';
import QuantityInput from '../../components/common/QuantityInput';
import Spinner from '../../components/common/Spinner';
import ErrorState from '../../components/common/ErrorState';

/**
 * BookDetailPage: Trang chi tiết sách tối ưu Responsive hoàn hảo
 * Kèm thanh Sticky Bar mua hàng trên điện thoại
 */
const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Fetch book detail
  const {
    data: book,
    loading: bookLoading,
    error: bookError,
    refetch,
  } = useFetch(
    async () => {
      const res = await getBookDetail(id);
      return res.data;
    },
    [id]
  );

  // Fetch related books
  const { data: relatedBooks } = useFetch(
    async () => {
      if (!book?.category) return [];
      const res = await getBooks({ category: book.category.id, limit: 4 });
      return res.data?.filter((b) => b.id !== book.id) || [];
    },
    [book?.category?.id, book?.id]
  );

  const stockStatus = getStockStatus(book?.stock);
  const isOutOfStock = stockStatus === 'out_of_stock';

  const handleAddToCart = async (buyNow = false) => {
    try {
      await addItem(book.id, quantity);
      showToast({
        type: 'success',
        message: `Đã thêm ${quantity} cuốn "${book.title}" vào giỏ hàng`,
      });
      if (buyNow) {
        navigate('/cart');
      }
    } catch (err) {
      showToast({
        type: 'error',
        message: err?.message || 'Không thể thêm vào giỏ hàng',
      });
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    const text = `Xem cuốn sách "${book.title}" tại Phương Anh Bookstore`;

    if (navigator.share) {
      navigator.share({
        title: book.title,
        text,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      showToast({ type: 'info', message: 'Đã sao chép liên kết vào bộ nhớ tạm' });
    }
  };

  if (bookLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (bookError || !book) {
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
        <ErrorState message="Không thể tải thông tin cuốn sách này" onRetry={refetch} />
      </div>
    );
  }

  const discountPercent =
    book.originalPrice && book.originalPrice > book.price
      ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-8 pb-24 md:pb-10">
      {/* Back & Breadcrumb navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-indigo-600 transition"
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>

        {book.category && (
          <Link
            to={`/books?category=${book.category.id}`}
            className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100"
          >
            {book.category.name}
          </Link>
        )}
      </div>

      {/* Main Book Detail Container */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl border border-gray-200/80 dark:border-gray-700 p-4 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-10">
          
          {/* Left Column: Book Image (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 dark:bg-gray-900 shadow-md border border-gray-200 dark:border-gray-700">
              {book.image && !imgError ? (
                <img
                  src={book.image}
                  alt={book.title}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-gray-800 dark:to-gray-900">
                  <BookOpen size={64} className="text-indigo-400 mb-3" />
                  <p className="font-bold text-gray-700 dark:text-gray-200">{book.title}</p>
                </div>
              )}

              {discountPercent > 0 && (
                <div className="absolute top-3 left-3 bg-rose-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg shadow">
                  GIẢM {discountPercent}%
                </div>
              )}
            </div>

            {/* Sub-actions under image */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm mt-4">
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  isWishlisted
                    ? 'bg-rose-50 border-rose-300 text-rose-600'
                    : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-rose-500'
                }`}
              >
                <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                {isWishlisted ? 'Đã thích' : 'Yêu thích'}
              </button>

              <button
                onClick={handleShare}
                className="py-2 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 text-gray-700 dark:text-gray-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Share2 size={16} />
                Chia sẻ
              </button>
            </div>
          </div>

          {/* Right Column: Book Metadata & Buy Actions (7 cols) */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-5">
            <div>
              {/* Title */}
              <h1 className="text-xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight mb-2">
                {book.title}
              </h1>

              {/* Authors, Rating & Stock Status */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
                {book.authors && book.authors.length > 0 && (
                  <div>
                    <span>Tác giả: </span>
                    <strong className="text-gray-900 dark:text-gray-200">
                      {book.authors.map((a) => a.name).join(', ')}
                    </strong>
                  </div>
                )}
                {book.publisher && (
                  <div>
                    <span>NXB: </span>
                    <strong className="text-gray-900 dark:text-gray-200">{book.publisher.name}</strong>
                  </div>
                )}
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star size={14} fill="currentColor" />
                  <span>4.9</span>
                </div>
                <div className={`px-2 py-0.5 rounded-md text-xs font-semibold ${STOCK_STATUS_COLORS[stockStatus]}`}>
                  {STOCK_STATUS_LABELS[stockStatus]}
                </div>
              </div>

              {/* Price Box */}
              <div className="bg-slate-50 dark:bg-gray-900/60 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-baseline gap-3 mb-6">
                <span className="text-2xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {formatVND(book.price)}
                </span>
                {book.originalPrice && book.originalPrice > book.price && (
                  <span className="text-sm sm:text-base text-gray-400 line-through">
                    {formatVND(book.originalPrice)}
                  </span>
                )}
              </div>

              {/* Desktop Quantity & Action Buttons */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Số lượng:
                  </span>
                  <QuantityInput
                    value={quantity}
                    onChange={setQuantity}
                    max={book.stock}
                    disabled={isOutOfStock}
                  />
                  <span className="text-xs text-gray-400">
                    ({book.stock || 0} sản phẩm có sẵn)
                  </span>
                </div>

                <div className="hidden sm:grid grid-cols-2 gap-3 pt-2">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => handleAddToCart(false)}
                    disabled={isOutOfStock}
                    icon={<ShoppingCart size={18} />}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30 font-bold"
                  >
                    Thêm vào giỏ hàng
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => handleAddToCart(true)}
                    disabled={isOutOfStock}
                    icon={<Zap size={18} />}
                    className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 font-bold border-none shadow-md shadow-amber-500/20"
                  >
                    Mua ngay
                  </Button>
                </div>
              </div>
            </div>

            {/* Quality & Delivery Assurances */}
            <div className="border-t border-gray-100 dark:border-gray-700/80 pt-4 grid grid-cols-3 gap-2 text-center text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">
              <div className="flex flex-col items-center gap-1">
                <Truck size={18} className="text-indigo-600 dark:text-indigo-400" />
                <span>Giao hàng toàn quốc</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
                <span>Cam kết chính hãng</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw size={18} className="text-purple-600 dark:text-purple-400" />
                <span>Đổi trả trong 7 ngày</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl border border-gray-200/80 dark:border-gray-700 p-5 sm:p-8">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BookOpen size={20} className="text-indigo-600" />
          Mô tả nội dung cuốn sách
        </h2>
        <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
          {book.description || 'Nội dung cuốn sách đang được cập nhật thêm. Bạn có thể hỏi trực tiếp Trợ lý AI ở góc màn hình để nhận thêm tóm tắt!'}
        </div>
      </div>

      {/* Related Books */}
      {relatedBooks && relatedBooks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Có thể bạn cũng thích
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {relatedBooks.map((relBook) => (
              <BookCard key={relBook.id} book={relBook} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Action Bar (Fixed on phones for easy thumb clicks) */}
      <div className="sm:hidden fixed bottom-14 left-0 right-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 p-3 shadow-lg flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] text-gray-500 uppercase font-semibold">Giá sản phẩm</p>
          <p className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
            {formatVND(book.price)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAddToCart(false)}
            disabled={isOutOfStock}
            className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 active:scale-95 transition"
            aria-label="Thêm vào giỏ"
          >
            <ShoppingCart size={18} />
          </button>
          <button
            onClick={() => handleAddToCart(true)}
            disabled={isOutOfStock}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-md shadow-indigo-600/30 active:scale-95 transition"
          >
            {isOutOfStock ? 'Hết hàng' : 'Mua ngay'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
