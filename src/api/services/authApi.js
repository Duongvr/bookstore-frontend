import axiosClient from '../axiosClient';
import { ENDPOINTS } from '../endpoints';
import { makeRequest } from '../request';

export const login = (username, password) => {
  return makeRequest('login', [username, password], () =>
    axiosClient.post(ENDPOINTS.AUTH.LOGIN, { username, password })
  );
};

export const register = (data) => {
  return makeRequest('register', [data], () =>
    axiosClient.post(ENDPOINTS.AUTH.REGISTER, data)
  );
};

export const getMe = () => {
  return makeRequest('getMe', [], () => axiosClient.get(ENDPOINTS.AUTH.ME));
};

export const changePassword = (data) => {
  return makeRequest('changePassword', [data], () =>
    axiosClient.post(ENDPOINTS.USERS.UPDATE_PASSWORD, data)
  );
};

export const updateProfile = (data) => {
  return makeRequest('updateProfile', [data], () =>
    axiosClient.put('/auth/profile', data)
  );
};
