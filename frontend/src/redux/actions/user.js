import { openNotification } from '../../utils/helpers';
import { userApi } from '../../utils/api';

import _getFingerprint from '../../utils/helpers/fingerprint';

const actions = {
  setUserData: (data) => ({
    type: 'USER:SET_DATA',
    payload: data,
  }),
  setIsAuth: (bool) => ({
    type: 'USER:SET_IS_AUTH',
    payload: bool,
  }),
  fetchUserData: () => (dispatch) => {
    userApi
      .getMe()
      .then(({ data }) => {
        dispatch(actions.setUserData(data));
      })
      .catch((err) => {
        if (err.response.status === 403) {
          dispatch(actions.setIsAuth(false));
          delete window.localStorage.accessToken;
        }
      });
  },
  fetchUserLogin: (postData) => async (dispatch) => {
    try {
      const fingerprint = await _getFingerprint();
      const { data, status } = await userApi.login({
        authCredentials: postData,
        fingerprint,
      });
      console.log('status=', status);
      const { accessToken, finishDate } = data;
      if (status === 201) {
        openNotification({
          title: 'Отлично!',
          text: 'Авторизация успешна.',
          type: 'success',
        });
        window.localStorage.setItem('accessToken', accessToken);
        window.localStorage.setItem('finishDate', finishDate);
        window.localStorage.setItem('fingerprint', fingerprint);
        dispatch(actions.fetchUserData());
        dispatch(actions.setIsAuth(true));
      }
      return { data, status };
    } catch (error) {
      console.log(error);
      openNotification({
        title: 'Ошибка при авторизации!',
        text: 'Неверный логин или пароль',
        type: 'error',
      });
    }
  },
  fetchUserRegister: (postData) => async (dispatch) => {
    try {
      const fingerprint = await _getFingerprint();
      const { data, status } = await userApi.register({
        user: {
          name: postData.userfullname,
          nickname: postData.username,
          password: postData.password,
          phone: postData.phone,
          email: postData.email,
        },
        fingerprint,
      });
      console.log('status=', status);
      const { accessToken } = data;
      if (status === 201) {
        openNotification({
          title: 'Отлично!',
          text: 'Регистрация успешна.',
          type: 'success',
        });

        window.localStorage['accessToken'] = accessToken;
        dispatch(actions.fetchUserData());
      }
      return { data, status };
    } catch (error) {
      openNotification({
        title: 'Ошибка при регистрации!',
        text: 'Неверный логин или пароль',
        type: 'error',
      });
    }
  },
};

export default actions;
