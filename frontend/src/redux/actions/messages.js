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
      if (currentDialogId === message.chatUUID) {
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
  fetchMessages: (chatUUID) => (dispatch, getState) => {
    dispatch(actions.setIsLoading(true));
    const { dialogs } = getState();
    const { items } = dialogs;
    const messages = items.find((c) => c.chatUUID === chatUUID).messages;
    dispatch({ type: 'MESSAGES:SET_ITEMS', payload: messages });
  },
};

export default actions;
