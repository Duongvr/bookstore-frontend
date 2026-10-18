import axiosClient from '../axiosClient';
import { ENDPOINTS } from '../endpoints';
import { makeRequest } from '../request';

export const getCart = () => {
  return makeRequest('getCart', [], () => axiosClient.get(ENDPOINTS.CART.GET));
};

export const addToCart = (bookId, quantity = 1) => {
  return makeRequest('addItem', [bookId, quantity], () =>
    axiosClient.post(ENDPOINTS.CART.ADD_ITEM, {
      book_id: bookId,
      quantity,
    })
  );
};

export const updateCartItem = (bookId, quantity) => {
  return makeRequest('updateItem', [bookId, quantity], () =>
    axiosClient.put(ENDPOINTS.CART.UPDATE_ITEM(bookId), {
      quantity,
    })
  );
};

export const removeFromCart = (bookId) => {
  return makeRequest('removeItem', [bookId], () =>
    axiosClient.delete(ENDPOINTS.CART.REMOVE_ITEM(bookId))
  );
};

export const clearCart = () => {
  return makeRequest('clearCart', [], () =>
    axiosClient.post(ENDPOINTS.CART.CLEAR)
  );
};
