import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { useDebounce } from '../../hooks/useDebounce';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { getBooks } from '../../api/services/bookApi';
import { getCategories } from '../../api/services/categoryApi';
import { getAuthors } from '../../api/services/authorApi';
import { getPublishers } from '../../api/services/publisherApi';
import BookCard from '../../components/features/BookCard';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';

/**
 * BookListPage: Danh sách sách với bộ lọc Drawer Responsive
 */
const BookListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  const { addItem } = useCart();
  const { showToast } = useToast();

  // Get params from URL
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 12;
  const category = searchParams.get('category') || '';
  const author = searchParams.get('author') || '';
  const publisher = searchParams.get('publisher') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  // Fetch books
  const { data: booksData, loading: booksLoading } = useFetch(
    async () => {
      const res = await getBooks({
        q: debouncedSearchTerm,
        category,
        author,
        publisher,
        minPrice,
        maxPrice,
        page,
        limit,
      });
      return res;
    },
    [debouncedSearchTerm, category, author, publisher, minPrice, maxPrice, page]
  );

  // Fetch filter options
  const { data: categories } = useFetch(
    async () => {
      const res = await getCategories();
      return res.data || [];
    },
    []
  );

  const { data: authors } = useFetch(
    async () => {
      const res = await getAuthors();
      return res.data || [];
    },
    []
  );

  const { data: publishers } = useFetch(
    async () => {
      const res = await getPublishers();
      return res.data || [];
    },
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSearchParams((prev) => {
      if (value) {
        prev.set('q', value);
      } else {
        prev.delete('q');
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handleFilterChange = (key, value) => {
    setSearchParams((prev) => {
      if (value) {
        prev.set(key, value);
      } else {
        prev.delete(key);
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSearchParams({});
    setShowFiltersModal(false);
  };

  const handlePageChange = (newPage) => {
    setSearchParams((prev) => {
      prev.set('page', newPage.toString());
      return prev;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = async (book) => {
    try {
      await addItem(book.id, 1);
      showToast({
        type: 'success',
        message: `Đã thêm "${book.title}" vào giỏ`,
      });
    } catch (err) {
      showToast({
        type: 'error',
        message: err?.message || 'Không thể thêm vào giỏ',
      });
    }
  };

  const hasActiveFilters =
    searchTerm || category || author || publisher || minPrice || maxPrice;

  // Filter content component reusable for desktop sidebar & mobile drawer
  const FilterContent = () => (
    <div className="space-y-5">
      {/* Category Filter */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
          Danh mục thể loại
        </label>
        <select
          value={category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Tất cả thể loại</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Author Filter */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
          Tác giả
        </label>
        <select
          value={author}
          onChange={(e) => handleFilterChange('author', e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Tất cả tác giả</option>
          {authors?.map((aut) => (
            <option key={aut.id} value={aut.id}>
              {aut.name}
            </option>
          ))}
        </select>
      </div>

      {/* Publisher Filter */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
          Nhà xuất bản
        </label>
        <select
          value={publisher}
          onChange={(e) => handleFilterChange('publisher', e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Tất cả nhà xuất bản</option>
          {publishers?.map((pub) => (
            <option key={pub.id} value={pub.id}>
              {pub.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
          Khoảng giá (VNĐ)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Từ"
            value={minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="number"
            placeholder="Đến"
            value={maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={handleClearFilters}
          className="w-full py-2.5 px-3 rounded-xl border border-rose-300 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold flex items-center justify-center gap-1.5 transition"
        >
          <X size={15} />
          Xóa toàn bộ bộ lọc
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Kho sách Phương Anh
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {booksData?.total ? `${booksData.total} cuốn sách phù hợp` : 'Khám phá tất cả các cuốn sách'}
          </p>
        </div>

        {/* Mobile Filter Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm sách..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <button
            onClick={() => setShowFiltersModal(true)}
            className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition flex-shrink-0 ${
              hasActiveFilters
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700'
            }`}
          >
            <SlidersHorizontal size={16} />
            <span>Bộ lọc {hasActiveFilters && '•'}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Desktop Sidebar Filter */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700 mb-4">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-indigo-600" />
                Bộ lọc tìm kiếm
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-rose-500 hover:underline"
                >
                  Xóa lọc
                </button>
              )}
            </div>

            {/* Desktop Search Inside Sidebar */}
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                Từ khóa
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập tên sách..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <FilterContent />
          </div>
        </aside>

        {/* Mobile Filter Modal / Drawer */}
        {showFiltersModal && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setShowFiltersModal(false)}
            />

            {/* Drawer */}
            <div className="relative w-full max-w-xs bg-white dark:bg-gray-900 h-full p-5 overflow-y-auto z-10 flex flex-col justify-between animate-slide-up">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800 mb-5">
                  <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
                    <SlidersHorizontal size={18} className="text-indigo-600" />
                    Bộ lọc nâng cao
                  </h3>
                  <button
                    onClick={() => setShowFiltersModal(false)}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X size={20} />
                  </button>
                </div>

                <FilterContent />
              </div>

              <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-800">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => setShowFiltersModal(false)}
                >
                  Xem kết quả
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content: Books Grid */}
        <main className="flex-1">
          {booksLoading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : booksData?.data?.length > 0 ? (
            <>
              {/* Responsive 2-column on mobile, 3-4 column on desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 mb-8">
                {booksData.data.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>

              {/* Pagination */}
              {booksData.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4 pb-8">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    ← Trước
                  </Button>
                  <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    Trang {page} / {booksData.totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page >= booksData.totalPages}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    Tiếp →
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
              <EmptyState
                title="Không tìm thấy cuốn sách nào"
                description="Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt các bộ lọc"
              />
              {hasActiveFilters && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleClearFilters}
                  className="mt-4"
                >
                  Xóa toàn bộ bộ lọc
                </Button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BookListPage;
