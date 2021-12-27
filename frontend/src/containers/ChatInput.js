import React from 'react';
import { ChatInput as BaseChatInput } from '../components';
import { connect } from 'react-redux';
import { messagesActions } from '../redux/actions';
import { socket } from '../core';

const ChatInput = ({ currentDialogId, user, repliedMessageId }) => {
  const onSendMessage = (value, chatUUID) => {
    socket.emit('ADD_MESSAGE', {
      text: value,
      chatUUID: chatUUID,
      userEmail: user.data.email,
    });
  };

  return (
    <BaseChatInput
      onSendMessage={onSendMessage}
      currentDialogId={currentDialogId}
    />
  );
};

export default connect(
  ({ dialogs, user }) => ({
    currentDialogId: dialogs.currentDialogId,
    repliedMessageId: dialogs.repliedMessageId,
    user: user,
  }),
  messagesActions,
)(ChatInput);
