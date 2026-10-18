import axiosClient from '../axiosClient';
import { ENDPOINTS } from '../endpoints';
import { makeRequest } from '../request';

export const getInventory = (params = {}) => {
  return makeRequest('getInventory', [params], () =>
    axiosClient.get(ENDPOINTS.INVENTORY.LIST, { params })
  );
};

export const importInventory = (data) => {
  return makeRequest('importStock', [data], () =>
    axiosClient.post(ENDPOINTS.INVENTORY.IMPORT, data)
  );
};

export const getInventoryHistory = (params = {}) => {
  return makeRequest('getInventoryHistory', [params], () =>
    axiosClient.get(ENDPOINTS.INVENTORY.HISTORY, { params })
  );
};

export const adjustInventory = (data) => {
  return makeRequest('importStock', [{ ...data, quantity: -Number(data.quantity) }], () =>
    axiosClient.post(ENDPOINTS.INVENTORY.EXPORT, data)
  );
};
