const splitWithChat = (getState, room = null) => {
  const { dialogs } = getState();
  if (!room) room = dialogs.currentDialogId;
  const chats = [...dialogs.items];
  const chatIndex = chats.findIndex((ch) => ch.room === room);
  const chat = chats.splice(chatIndex, 1)[0];
  return { chat, chats };
};
const actions = {
  setDialogs: (items) => ({
    type: 'DIALOGS:SET_ITEMS',
    payload: items,
  }),
  setCurrentDialogId: (room_id) => ({
    type: 'DIALOGS:SET_CURRENT_DIALOG_ID',
    payload: room_id,
  }),
  setRepliedMessageId: (repliedMessageID) => ({
    type: 'DIALOGS:SET_REPLIED_MESSAGE_ID',
    payload: repliedMessageID,
  }),
  addDialog: (item) => ({
    type: 'DIALOGS:ADD_ITEM',
    payload: item,
  }),
  addMessageToDialog: (message) => (dispatch, getState) => {
    const { chats, chat } = splitWithChat(getState);
    const totalChats = [...chats, chat]
    for (let ch of totalChats) {
      if (ch.room_id === message.room_id) {
        console.log("find chat");
        ch.last_message = message;
      }
    }

    dispatch(actions.setDialogs([...chats, chat]));
  },
  changeDialogPhoto: ({ photo, room }) => (dispatch, getState) => {
    const { chats, chat } = splitWithChat(getState, room);
    dispatch(actions.setDialogs([...chats, { ...chat, photo }]));
  },
  setChatMembers: (chatMembers) => (dispatch, getState) => {
    const { chats, chat } = splitWithChat(getState);
    console.log(chatMembers);
    dispatch(actions.setDialogs([...chats, { ...chat, chatMembers }]));
  },
  removeDialog: (room) => (dispatch, getState) => {
    const { chats } = splitWithChat(getState, room);
    dispatch(actions.setDialogs([...chats]));
  },
};

export default actions;
