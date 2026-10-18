import axiosClient from '../axiosClient';
import { ENDPOINTS } from '../endpoints';
import { makeRequest } from '../request';

export const getBooks = (params) => {
  return makeRequest('getBooks', [params], () =>
    axiosClient.get(ENDPOINTS.BOOKS.LIST, { params })
  );
};

export const getBookDetail = (id) => {
  return makeRequest('getBookDetail', [id], () =>
    axiosClient.get(ENDPOINTS.BOOKS.DETAIL(id))
  );
};

export const searchBooks = (q, params = {}) => {
  return makeRequest('getBooks', [{ q, ...params }], () =>
    axiosClient.get(ENDPOINTS.BOOKS.SEARCH, { params: { q, ...params } })
  );
};

export const createBook = (data) => {
  return makeRequest('createBook', [data], () =>
    axiosClient.post(ENDPOINTS.BOOKS.LIST, data)
  );
};

export const updateBook = (id, data) => {
  return makeRequest('updateBook', [id, data], () =>
    axiosClient.put(ENDPOINTS.BOOKS.DETAIL(id), data)
  );
};

export const deleteBook = (id) => {
  return makeRequest('deleteBook', [id], () =>
    axiosClient.delete(ENDPOINTS.BOOKS.DETAIL(id))
  );
};

export const mapBook = (apiData) => ({
  id: apiData.book_id || apiData.id,
  title: apiData.title,
  price: apiData.price,
  originalPrice: apiData.originalPrice,
  stock: apiData.stock_quantity !== undefined ? apiData.stock_quantity : apiData.stock,
  description: apiData.description,
  category: apiData.category,
  publisher: apiData.publisher,
  authors: apiData.authors || [],
  image: apiData.image_url || apiData.image,
  createdAt: apiData.created_at || apiData.createdAt,
});
