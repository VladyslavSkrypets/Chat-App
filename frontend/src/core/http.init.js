import axios from 'axios';
import { userApi } from '../utils/api';

const instance = axios.create({
  baseURL: process.env.API_URL,
});
instance.interceptors.request.use(
  (req) => {
    req.headers.authorization =
      'Bearer ' + window.localStorage.getItem('accessToken');
      return req;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
