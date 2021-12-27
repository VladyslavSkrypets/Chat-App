import axios from 'axios';
import { userApi } from '../utils/api';

const instance = axios.create({
  baseURL: process.env.API_URL,
});
instance.interceptors.request.use(
  (req) => {
    req.headers.authorization =
      'Bearer ' + window.localStorage.getItem('accessToken');
    if (
      Number(window.localStorage.getItem('finishDate')) < Number(new Date()) &&
      window.localStorage.getItem('accessToken')
    ) {
      return userApi
        .refresh(window.localStorage.getItem('fingerprint'))
        .then((response) => {
          window.localStorage.setItem('accessToken', response.accessToken);
          window.localStorage.setItem('finishDate', response.finishDate);
          req.headers.authorization =
            'Bearer ' + window.localStorage.getItem('accessToken');
          return req;
        })
        .catch((error) => Promise.reject(error));
    } else {
      return req;
    }
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default instance;
