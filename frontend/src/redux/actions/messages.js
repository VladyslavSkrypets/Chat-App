import { messagesApi } from '../../utils/api';
let sended = false;
const actions = {
  setMessages: (items) => ({
    type: 'MESSAGES:SET_ITEMS',
    payload: items,
  }),
  addMessage: (message) => (dispatch, getState) => {
    if (!sended) {
      const { dialogs } = getState();
      const { currentDialogId } = dialogs;
      if (currentDialogId === message.room) {
        dispatch({
          type: 'MESSAGES:ADD_MESSAGE',
          payload: message,
        });
      }
      sended = true;
    } else {
      setTimeout(() => {
        sended = false;
      }, 10);
    }
  },
  // eslint-disable-next-line no-unused-vars
  fetchSendMessage: (text, dialogId) => (dispatch) => {
    return messagesApi.send(text, dialogId);
  },
  setIsLoading: (bool) => ({
    type: 'MESSAGES:SET_IS_LOADING',
    payload: bool,
  }),
  fetchMessages: (room_id) => (dispatch, getState) => {
    dispatch(actions.setIsLoading(true));
    const { dialogs } = getState();
    console.log("dialogs = ", dialogs)
    const { items } = dialogs;
    // const messages = items.find((c) => c.room === room).messages;
    // const messages = messagesApi.getMessages(room_id);
    messagesApi.getMessages(room_id).then((response) => dispatch({ type: 'MESSAGES:SET_ITEMS', payload: response.data }));
    // dispatch({ type: 'MESSAGES:SET_ITEMS', payload: [] });
  },
};

export default actions;
