import axiosClient from '../axiosClient';
import { ENDPOINTS } from '../endpoints';
import { makeRequest } from '../request';

export const sendChatMessage = (data) => {
  return makeRequest('chatWithAI', [data], () =>
    axiosClient.post(ENDPOINTS.AI.CHAT, data)
  );
};

export const getSuggestedBooks = (params = {}) => {
  return makeRequest('suggestBooks', [params], () =>
    axiosClient.get(ENDPOINTS.AI.SUGGEST_BOOKS, { params })
  );
};

export const suggestBooks = (params = {}) => {
  return makeRequest('suggestBooks', [params], () =>
    axiosClient.get(ENDPOINTS.AI.SUGGEST_BOOKS, { params })
  );
};

export const chatWithAI = (data) => {
  return makeRequest('chatWithAI', [data], () =>
    axiosClient.post(ENDPOINTS.AI.CHAT, data)
  );
};
