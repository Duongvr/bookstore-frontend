import axiosClient from '../axiosClient';
import { ENDPOINTS } from '../endpoints';
import { makeRequest } from '../request';

export const getUsers = (params = {}) => {
  return makeRequest('getUsers', [params], () =>
    axiosClient.get(ENDPOINTS.USERS.LIST, { params })
  );
};

export const getUserDetail = (id) => {
  return makeRequest('getUsers', [], async () =>
    axiosClient.get(ENDPOINTS.USERS.DETAIL(id))
  ).then((res) => {
    const list = res.data || res.items || [];
    const found = list.find((u) => String(u.id) === String(id));
    return { data: found, ...found };
  });
};

export const createUser = (data) => {
  return makeRequest('register', [data], () =>
    axiosClient.post(ENDPOINTS.USERS.CREATE, data)
  );
};

export const updateUser = (id, data) => {
  return makeRequest('updateProfile', [data], () =>
    axiosClient.put(ENDPOINTS.USERS.UPDATE(id), data)
  );
};

export const updateUserProfile = (data) => {
  return makeRequest('updateProfile', [data], () =>
    axiosClient.put('/auth/profile', data)
  );
};

export const changePassword = (data) => {
  return makeRequest('changePassword', [data], () =>
    axiosClient.post(ENDPOINTS.USERS.UPDATE_PASSWORD, data)
  );
};

export const updateUserRole = (id, data) => {
  return makeRequest('updateUserRole', [id, data?.role || data], () =>
    axiosClient.put(ENDPOINTS.USERS.UPDATE_ROLE(id), data)
  );
};

export const updateUserStatus = (id, data) => {
  return makeRequest('updateUserStatus', [id, data?.status || data], () =>
    axiosClient.put(ENDPOINTS.USERS.UPDATE_STATUS(id), data)
  );
};

export const deleteUser = (id) => {
  return makeRequest('updateUserStatus', [id, 'LOCKED'], () =>
    axiosClient.delete(ENDPOINTS.USERS.DELETE(id))
  );
};
