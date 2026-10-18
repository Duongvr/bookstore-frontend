import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles, BookOpen, ArrowLeft } from 'lucide-react';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { ToastContainer } from '../components/common/Toast';

/**
 * AuthLayout: Giao diện đăng nhập/đăng ký chuẩn Responsive
 * Tự động chuyển đổi cột đơn trên điện thoại và 2 cột trên máy tính
 */
const AuthLayout = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col md:flex-row">
        
        {/* Left Side: Brand Visual (Desktop only) */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 p-8 lg:p-12 text-white flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-200 hover:text-white transition z-10"
          >
            <ArrowLeft size={16} />
            Quay về trang chủ
          </Link>

          {/* Hero text */}
          <div className="max-w-md space-y-4 z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-xl border border-white/20">
              <BookOpen size={28} />
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
              Phương Anh Bookstore
            </h1>
            <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
              Khám phá kho tàng tri thức với hàng triệu cuốn sách chọn lọc. Tận hưởng tiện ích mua sắm thông minh cùng trợ lý AI!
            </p>
          </div>

          {/* Footer note */}
          <div className="text-xs text-indigo-200/80 z-10 flex items-center gap-2">
            <Sparkles size={14} className="text-amber-300" />
            <span>Trải nghiệm đọc sách & mua sắm hoàn hảo trên mọi thiết bị.</span>
          </div>
        </div>

        {/* Right Side: Form Container */}
        <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 min-h-screen md:min-h-0">
          <div className="w-full max-w-md">
            {/* Mobile Back Link */}
            <div className="md:hidden mb-6 flex items-center justify-between">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-indigo-600"
              >
                <ArrowLeft size={16} />
                Trang chủ
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                  P
                </div>
                <span className="font-extrabold text-sm text-gray-900 dark:text-white">Phương Anh</span>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 dark:border-gray-700 p-6 sm:p-8 shadow-xl shadow-gray-200/40 dark:shadow-none">
              <Outlet />
            </div>
          </div>
        </div>

      </div>

      <ToastContainer />
    </ErrorBoundary>
  );
};

export default AuthLayout;
