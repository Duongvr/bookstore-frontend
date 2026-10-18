/**
 * Tất cả đường dẫn API định nghĩa tại đây
 * Đối chiếu với Swagger trước khi dùng: https://ecommercenest.duckdns.org/api/docs
 * Chỉ sửa file này khi đổi API path, component không chứa chuỗi URL
 */

export const BASE_URL = import.meta.env.VITE_API_URL;

export const ENDPOINTS = {
  // ========== AUTH ==========
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
  },

  // ========== BOOKS ==========
  BOOKS: {
    LIST: '/books',
    DETAIL: (id) => `/books/${id}`,
    SEARCH: '/books/search',
  },

  // ========== CATEGORIES ==========
  CATEGORIES: {
    LIST: '/categories',
    DETAIL: (id) => `/categories/${id}`,
    CREATE: '/categories',
    UPDATE: (id) => `/categories/${id}`,
    DELETE: (id) => `/categories/${id}`,
  },

  // ========== AUTHORS ==========
  AUTHORS: {
    LIST: '/authors',
    DETAIL: (id) => `/authors/${id}`,
    CREATE: '/authors',
    UPDATE: (id) => `/authors/${id}`,
    DELETE: (id) => `/authors/${id}`,
  },

  // ========== PUBLISHERS ==========
  PUBLISHERS: {
    LIST: '/publishers',
    DETAIL: (id) => `/publishers/${id}`,
    CREATE: '/publishers',
    UPDATE: (id) => `/publishers/${id}`,
    DELETE: (id) => `/publishers/${id}`,
  },

  // ========== CART ==========
  CART: {
    GET: '/cart',
    ADD_ITEM: '/cart/items',
    UPDATE_ITEM: (bookId) => `/cart/items/${bookId}`,
    REMOVE_ITEM: (bookId) => `/cart/items/${bookId}`,
    CLEAR: '/cart/clear',
  },

  // ========== ORDERS ==========
  ORDERS: {
    LIST: '/orders',
    DETAIL: (id) => `/orders/${id}`,
    CREATE: '/orders',
    CANCEL: (id) => `/orders/${id}/cancel`,
    STATUS: (id) => `/orders/${id}/status`,
    HISTORY: (id) => `/orders/${id}/status-history`,
  },

  // ========== PAYMENTS ==========
  PAYMENTS: {
    CREATE: '/payments',
    VERIFY: (id) => `/payments/${id}/verify`,
    HISTORY: (id) => `/payments/order/${id}`,
  },

  // ========== INVENTORY ==========
  INVENTORY: {
    LIST: '/inventory',
    IMPORT: '/inventory/import',
    HISTORY: '/inventory/history',
    EXPORT: '/inventory/export',
  },

  // ========== USERS ==========
  USERS: {
    LIST: '/admin/users',
    DETAIL: (id) => `/admin/users/${id}`,
    CREATE: '/admin/users',
    UPDATE: (id) => `/admin/users/${id}`,
    UPDATE_ROLE: (id) => `/admin/users/${id}/role`,
    UPDATE_STATUS: (id) => `/admin/users/${id}/status`,
    DELETE: (id) => `/admin/users/${id}`,
    UPDATE_PASSWORD: '/auth/change-password',
  },

  // ========== STATISTICS ==========
  STATS: {
    REVENUE: '/stats/revenue',
    TOP_BOOKS: '/stats/top-books',
    EXPORT: '/stats/export',
  },

  // ========== AI CHAT ==========
  AI: {
    CHAT: '/ai/chat',
    SUGGEST_BOOKS: '/ai/suggest-books',
  },
};
