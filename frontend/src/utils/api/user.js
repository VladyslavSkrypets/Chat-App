import { instance } from '../../core';
import axios from 'axios';
export default {
  login: (postData) => instance.post('/api/auth/login', postData),
  register: (postData) => instance.post('/api/auth/signup', postData),
  getMe: () => instance.get('/get-user-data'),
  findUsersByEmail: (value) =>
    instance.get('/api/users/email', { params: { email: value } }),
  findUsersByNickname: (value) =>
    instance.get(`/get-user?name=${value}`),
  findUsersByName: (value) =>
    instance.get('/api/users/name', { params: { name: value } }),
  logout: async () => {
    await instance.get('/logout');
  },
  refresh: async (fingerprint) => {
    const res = await axios.post('/api/auth/refresh', { fingerprint });
    return res.data;
  },
};
