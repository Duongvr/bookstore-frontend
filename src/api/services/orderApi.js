import axiosClient from '../axiosClient';
import { ENDPOINTS } from '../endpoints';
import { makeRequest } from '../request';

export const getOrders = (params = {}) => {
  return makeRequest('getOrders', [params], () =>
    axiosClient.get(ENDPOINTS.ORDERS.LIST, { params })
  );
};

export const getOrderDetail = (id) => {
  return makeRequest('getOrderDetail', [id], () =>
    axiosClient.get(ENDPOINTS.ORDERS.DETAIL(id))
  );
};

export const createOrder = (data) => {
  return makeRequest('createOrder', [data], () =>
    axiosClient.post(ENDPOINTS.ORDERS.CREATE, data)
  );
};

export const cancelOrder = (id, data = {}) => {
  return makeRequest('cancelOrder', [id, data?.reason], () =>
    axiosClient.post(ENDPOINTS.ORDERS.CANCEL(id), data)
  );
};

export const updateOrderStatus = (id, data) => {
  return makeRequest('updateOrderStatus', [id, data?.status || data, data?.note || data?.notes], () =>
    axiosClient.put(ENDPOINTS.ORDERS.STATUS(id), data)
  );
};

export const confirmOrder = (id) => {
  return makeRequest('updateOrderStatus', [id, 'CONFIRMED', 'Xác nhận đơn hàng'], () =>
    axiosClient.post(ENDPOINTS.ORDERS.STATUS(id), { status: 'CONFIRMED' })
  );
};

export const getOrderStatusHistory = (id) => {
  return makeRequest('getOrderDetail', [id], async () =>
    axiosClient.get(ENDPOINTS.ORDERS.HISTORY(id))
  ).then((res) => ({ data: res.status_history || res.data?.status_history || [] }));
};
