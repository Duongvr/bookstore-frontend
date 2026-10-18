import axiosClient from '../axiosClient';
import { ENDPOINTS } from '../endpoints';

/**
 * Tạo yêu cầu thanh toán
 * @param {object} data - {order_id, payment_method, amount}
 * @returns {Promise<object>}
 */
export const createPayment = (data) => {
  return axiosClient.post(ENDPOINTS.PAYMENTS.CREATE, data);
};

/**
 * Xác nhận thanh toán
 * @param {number|string} id
 * @param {object} data - {transaction_id, status}
 * @returns {Promise<object>}
 */
export const verifyPayment = (id, data = {}) => {
  return axiosClient.post(ENDPOINTS.PAYMENTS.VERIFY(id), data);
};

/**
 * Lấy lịch sử thanh toán của đơn hàng
 * @param {number|string} orderId
 * @returns {Promise<Array>}
 */
export const getPaymentHistory = (orderId) => {
  return axiosClient.get(ENDPOINTS.PAYMENTS.HISTORY(orderId));
};
