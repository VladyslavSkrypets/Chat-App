const initialState = {
  data: null,
  accessToken: window.localStorage.accessToken,
  isAuth: !!window.localStorage.accessToken,
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case 'USER:SET_DATA':
      return {
        ...state,
        data: payload,
        isAuth: true,
        accessToken: window.localStorage.accessToken,
      };
    case 'USER:SET_IS_AUTH':
      return {
        ...state,
        isAuth: payload,
      };
    default:
      return state;
  }
};
