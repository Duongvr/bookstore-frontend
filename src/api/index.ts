/**
 * Central export point for all API services
 * Import all services from here for easier access
 */

// Config & Types
export * from './apiConfig';
export { default as axiosClient } from './axiosClient';

// Services
export { default as catalogService } from './services/catalogService';
export { default as authService } from './services/authService';
export { default as orderService } from './services/orderService';
export { default as inventoryService } from './services/inventoryService';

// Individual service imports for flexibility
export { catalogService } from './services/catalogService';
export { authService } from './services/authService';
export { orderService } from './services/orderService';
export { inventoryService } from './services/inventoryService';

/**
 * Quick access to all services
 * Usage: import { services } from '@/api'
 *        services.catalog.searchBooks()
 */
export const services = {
  catalog: require('./services/catalogService').default,
  auth: require('./services/authService').default,
  order: require('./services/orderService').default,
  inventory: require('./services/inventoryService').default,
};
