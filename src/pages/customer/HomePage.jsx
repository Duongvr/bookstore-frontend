import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Sparkles, TrendingUp, Award, Clock } from 'lucide-react';
import { getIcon } from '../../utils/iconMap';
import { useFetch } from '../../hooks/useFetch';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { getBooks } from '../../api/services/bookApi';
import { getCategories } from '../../api/services/categoryApi';
import { suggestBooks } from '../../api/services/aiApi';
import BookCard from '../../components/features/BookCard';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';

/**
 * HomePage: Trang chủ tối ưu Responsive cho Mobile & Desktop
 */
const HomePage = () => {
  const { addItem } = useCart();
  const { showToast } = useToast();

  // Fetch categories
  const { data: categoriesData, loading: categoriesLoading } = useFetch(
    async () => {
      const res = await getCategories();
      return res.data || [];
    },
    []
  );

  // Fetch new books
  const { data: newBooks, loading: newBooksLoading } = useFetch(
    async () => {
      const res = await getBooks({ limit: 8, sort: 'newest' });
      return res.data || [];
    },
    []
  );

  // Fetch AI suggestions
  const { data: suggestedBooks, loading: suggestedLoading } = useFetch(
    async () => {
      try {
        const res = await suggestBooks();
        return res.data || [];
      } catch {
        return [];
      }
    },
    []
  );

  const handleAddToCart = async (book) => {
    try {
      await addItem(book.id, 1);
      showToast({
        type: 'success',
        message: `Đã thêm "${book.title}" vào giỏ hàng`,
      });
    } catch (err) {
      showToast({
        type: 'error',
        message: err?.message || 'Không thể thêm vào giỏ',
      });
    }
  };

  return (
    <div className="space-y-8 sm:space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        {/* Abstract background decorative shapes */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-medium text-indigo-200">
                <Sparkles size={16} className="text-amber-300" />
                <span>Nhà sách trực tuyến thông minh với AI</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Mở cuốn sách, <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-amber-300 via-pink-300 to-indigo-200 bg-clip-text text-transparent">
                  khám phá thế giới mới
                </span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-indigo-100 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Hàng ngàn đầu sách chọn lọc từ văn học, kỹ năng, kinh tế đến khoa học.
                Tận hưởng trải nghiệm tìm sách dễ dàng, giao nhanh tận tay.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center lg:justify-start">
                <Link to="/books" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 font-bold border-none shadow-lg shadow-amber-500/20"
                    icon={<ArrowRight size={18} />}
                    iconPosition="right"
                  >
                    Khám phá kho sách
                  </Button>
                </Link>
                <a href="#categories" className="w-full sm:w-auto">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full sm:w-auto text-white border border-white/30 hover:bg-white/10"
                  >
                    Xem thể loại
                  </Button>
                </a>
              </div>

              {/* Trust badges */}
              <div className="pt-4 grid grid-cols-3 gap-2 sm:gap-6 border-t border-indigo-700/60 max-w-lg mx-auto lg:mx-0 text-center">
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-amber-300">10k+</p>
                  <p className="text-[11px] sm:text-xs text-indigo-200">Đầu sách hay</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-amber-300">50k+</p>
                  <p className="text-[11px] sm:text-xs text-indigo-200">Độc giả tin cậy</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-amber-300">2 Giờ</p>
                  <p className="text-[11px] sm:text-xs text-indigo-200">Giao hỏa tốc</p>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative mx-auto max-w-sm">
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/30 to-indigo-500/30 rounded-3xl transform rotate-3 blur-sm"></div>
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">Top đề xuất hôm nay</span>
                    <span className="flex items-center gap-1 text-xs text-amber-300 font-bold">
                      <Award size={14} /> Best Seller
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-white/10 p-3 rounded-2xl">
                      <div className="w-12 h-16 bg-indigo-700 rounded-lg flex items-center justify-center font-bold text-xl shadow">
                        📚
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">Đắc Nhân Tâm</h4>
                        <p className="text-xs text-indigo-200">Dale Carnegie</p>
                        <p className="text-xs font-bold text-amber-300 mt-1">86.000 ₫</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white/10 p-3 rounded-2xl">
                      <div className="w-12 h-16 bg-purple-700 rounded-lg flex items-center justify-center font-bold text-xl shadow">
                        📖
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">Nhà Giả Kim</h4>
                        <p className="text-xs text-indigo-200">Paulo Coelho</p>
                        <p className="text-xs font-bold text-amber-300 mt-1">79.000 ₫</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 text-center text-xs text-indigo-200">
                    <p>⚡ Giảm thêm 10% khi thanh toán trực tuyến</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white">
              Danh mục nổi bật
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Tìm sách nhanh chóng theo chủ đề yêu thích
            </p>
          </div>
          <Link
            to="/books"
            className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 transition"
          >
            Tất cả thể loại
            <ArrowRight size={14} />
          </Link>
        </div>

        {categoriesLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categoriesData?.map((category) => {
              const Icon = getIcon(category.icon);
              return (
                <Link
                  key={category.id}
                  to={`/books?category=${category.id}`}
                  className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-center transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-indigo-50 text-indigo-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 line-clamp-1">
                    {category.name}
                  </h3>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* New Books Section (Responsive 2-column mobile, 3-4 column desktop) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 sm:h-8 bg-indigo-600 rounded-full"></div>
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                Sách mới lên kệ
                <span className="hidden sm:inline-flex text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  Mới nhất
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Các tác phẩm được tuyển chọn vừa phát hành
              </p>
            </div>
          </div>
          <Link
            to="/books"
            className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 transition"
          >
            Xem tất cả
            <ArrowRight size={14} />
          </Link>
        </div>

        {newBooksLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {newBooks?.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </section>

      {/* AI Personalized Recommendations Section */}
      {suggestedBooks && suggestedBooks.length > 0 && (
        <section className="bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-pink-50/60 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-gray-900 py-10 sm:py-14 border-y border-indigo-100 dark:border-indigo-900/40">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
                    Gợi ý riêng cho bạn từ AI
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Dựa trên xu hướng đọc và sở thích độc giả tương tự
                  </p>
                </div>
              </div>
            </div>

            {suggestedLoading ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {suggestedBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
