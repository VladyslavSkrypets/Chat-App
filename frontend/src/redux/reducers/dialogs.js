const initialState = {
  items: [],
  currentDialogId: window.location.pathname.split('dialog/')[1],
  isLoading: false,
  repliedMessageId: null,
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case 'DIALOGS:SET_ITEMS':
      return {
        ...state,
        items: payload,
      };
    case 'DIALOGS:SET_CURRENT_DIALOG_ID':
      return {
        ...state,
        currentDialogId: payload,
      };
    case 'DIALOGS:SET_REPLIED_MESSAGE_ID':
      return {
        ...state,
        repliedMessageId: payload,
      };
    case 'DIALOGS:ADD_ITEM':
      return {
        ...state,
        items: [...state.items, payload],
      };
    default:
      return state;
  }
};
