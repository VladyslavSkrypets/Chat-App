import { messagesApi } from '../../utils/api';
let sended = false;
const actions = {
  setMessages: (items) => ({
    type: 'MESSAGES:SET_ITEMS',
    payload: items,
  }),
  addMessage: (message) => (dispatch, getState) => {
    const { dialogs } = getState();
    const { currentDialogId } = dialogs;
    console.log("MESSAGE", message)
    console.log("CUR DIALOG ID", currentDialogId)
    if (currentDialogId === message.room_id) {
      dispatch({
        type: 'MESSAGES:ADD_MESSAGE',
        payload: message,
      });
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
