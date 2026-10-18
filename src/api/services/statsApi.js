import axiosClient from '../axiosClient';
import { ENDPOINTS } from '../endpoints';
import { makeRequest } from '../request';

export const getDashboardStats = (params = {}) => {
  return makeRequest('getDashboardStats', [params], () =>
    axiosClient.get(ENDPOINTS.STATS?.DASHBOARD || '/stats/dashboard', { params })
  );
};

export const getRevenue = (params = {}) => {
  return makeRequest('getRevenueStats', [params], () =>
    axiosClient.get(ENDPOINTS.STATS.REVENUE, { params })
  );
};

export const getTopBooks = (params = {}) => {
  return makeRequest('getTopBooks', [params], async () =>
    axiosClient.get(ENDPOINTS.STATS.TOP_BOOKS, { params })
  ).then((res) => ({ data: res.topBooks || res.data?.topBooks || [] }));
};

export const exportStats = (params = {}) => {
  return makeRequest('exportReport', [params?.format || 'csv'], () =>
    axiosClient.get(ENDPOINTS.STATS.EXPORT, {
      params,
      responseType: 'blob',
    })
  );
};

export const getStats = () => {
  return makeRequest('getStats', [], () =>
    axiosClient.get('/stats/overview')
  );
};
