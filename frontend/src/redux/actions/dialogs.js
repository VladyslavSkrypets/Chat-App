// import { chatsApi } from '../../utils/api';
const splitWithChat = (getState, chatUUID = null) => {
  const { dialogs } = getState();
  if (!chatUUID) chatUUID = dialogs.currentDialogId;
  const chats = [...dialogs.items];
  const chatIndex = chats.findIndex((ch) => ch.chatUUID === chatUUID);
  const chat = chats.splice(chatIndex, 1)[0];
  return { chat, chats };
};
const actions = {
  setDialogs: (items) => ({
    type: 'DIALOGS:SET_ITEMS',
    payload: items,
  }),
  setCurrentDialogId: (id) => ({
    type: 'DIALOGS:SET_CURRENT_DIALOG_ID',
    payload: id,
  }),
  addDialog: (item) => ({
    type: 'DIALOGS:ADD_ITEM',
    payload: item,
  }),
  addMessageToDialog: (message) => (dispatch, getState) => {
    const { chats, chat } = splitWithChat(getState);
    let messages = [...chat.messages];
    messages.push(message);
    if (messages.length > 100) messages = messages.splice(1);

    dispatch(actions.setDialogs([...chats, { ...chat, messages }]));
  },
  changeDialogPhoto: ({ photo, chatUUID }) => (dispatch, getState) => {
    const { chats, chat } = splitWithChat(getState, chatUUID);
    dispatch(actions.setDialogs([...chats, { ...chat, photo }]));
  },
  setChatMembers: (chatMembers) => (dispatch, getState) => {
    const { chats, chat } = splitWithChat(getState);
    console.log(chatMembers);
    dispatch(actions.setDialogs([...chats, { ...chat, chatMembers }]));
  },
  removeDialog: (chatUUID) => (dispatch, getState) => {
    const { chats } = splitWithChat(getState, chatUUID);
    dispatch(actions.setDialogs([...chats]));
  },
};

export default actions;
