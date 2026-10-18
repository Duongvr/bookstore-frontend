import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  BarChart3,
  Package,
  FolderOpen,
  Users,
  Zap,
  ShoppingCart,
  LogOut,
  User,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { ToastContainer } from '../components/common/Toast';

/**
 * AdminLayout: Layout quản trị viên tối ưu toàn diện cho Desktop, Tablet & Mobile
 */
const AdminLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Đóng sidebar mobile khi chuyển trang
    setMobileSidebarOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isAdmin = user?.role === 'ADMIN';

  const menuItems = [
    { label: 'Tổng quan', to: '/admin', icon: BarChart3 },
    { label: 'Quản lý sách', to: '/admin/books', icon: Package },
    isAdmin && { label: 'Danh mục', to: '/admin/categories', icon: FolderOpen },
    isAdmin && { label: 'Tác giả', to: '/admin/authors', icon: Users },
    isAdmin && { label: 'Nhà xuất bản', to: '/admin/publishers', icon: Zap },
    { label: 'Quản lý kho', to: '/admin/inventory', icon: Package },
    { label: 'Đơn hàng', to: '/admin/orders', icon: ShoppingCart },
    isAdmin && { label: 'Khách hàng', to: '/admin/customers', icon: Users },
    isAdmin && { label: 'Tài khoản hệ thống', to: '/admin/users', icon: ShieldAlert },
    isAdmin && { label: 'Báo cáo thống kê', to: '/admin/statistics', icon: BarChart3 },
  ].filter(Boolean);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col md:flex-row antialiased">
        
        {/* Desktop Sidebar (Permanent) */}
        <aside className="hidden md:flex flex-col w-64 bg-gray-900 text-gray-200 border-r border-gray-800 flex-shrink-0 h-screen sticky top-0 z-30">
          {/* Brand Logo */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800 h-16">
            <Link to="/admin" className="flex items-center gap-2.5 font-extrabold text-base text-white">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow">
                P
              </div>
              <div className="flex flex-col">
                <span className="leading-tight">Phương Anh</span>
                <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">Admin Portal</span>
              </div>
            </Link>
          </div>

          {/* Navigation items */}
          <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive =
                item.to === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.to);

              return (
                <Link
                  key={idx}
                  to={item.to}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="text-white/80" />}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Sidebar: Store Link */}
          <div className="p-3 border-t border-gray-800 space-y-2">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition"
            >
              <span className="flex items-center gap-2">
                <ExternalLink size={14} />
                Xem cửa hàng
              </span>
              <span className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded text-gray-400">Live</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-rose-400 hover:bg-rose-950/40 transition"
            >
              <LogOut size={16} />
              Đăng xuất
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileSidebarOpen(false)}
            />

            {/* Sidebar Drawer Panel */}
            <div className="relative w-72 max-w-xs bg-gray-900 text-gray-200 h-full flex flex-col justify-between z-10 shadow-2xl animate-slide-up">
              <div>
                <div className="flex items-center justify-between p-4 border-b border-gray-800 h-16">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold">
                      P
                    </div>
                    <span>Phương Anh Admin</span>
                  </div>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
                  >
                    <X size={20} />
                  </button>
                </div>

                <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
                  {menuItems.map((item, idx) => {
                    const Icon = item.icon;
                    const isActive =
                      item.to === '/admin'
                        ? location.pathname === '/admin'
                        : location.pathname.startsWith(item.to);

                    return (
                      <Link
                        key={idx}
                        to={item.to}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="p-4 border-t border-gray-800 space-y-2">
                <Link
                  to="/"
                  className="flex items-center gap-2 text-xs text-indigo-400 font-semibold"
                >
                  <ExternalLink size={14} />
                  Xem giao diện khách hàng
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-rose-400 hover:bg-rose-950/40"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Sticky Top Header Bar */}
          <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20 h-16 flex items-center px-4 sm:px-6 lg:px-8 shadow-sm">
            <div className="flex items-center justify-between w-full">
              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                aria-label="Mở menu quản trị"
              >
                <Menu size={22} />
              </button>

              <div className="hidden sm:block">
                <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Hệ thống quản lý cửa hàng sách
                </h2>
              </div>

              {/* User profile dropdown badge */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white leading-tight">
                    {user?.full_name || 'Quản trị viên'}
                  </p>
                  <StatusBadge type="user-role" value={user?.role} />
                </div>

                <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm shadow-sm">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <User size={16} />}
                </div>
              </div>
            </div>
          </header>

          {/* Page Content Body */}
          <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-x-hidden">
            <Outlet />
          </main>
        </div>

      </div>

      <ToastContainer />
    </ErrorBoundary>
  );
};

export default AdminLayout;
