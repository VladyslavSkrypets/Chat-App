import React from 'react';
import { ChatInput as BaseChatInput } from '../components';
import { connect } from 'react-redux';
import { messagesActions } from '../redux/actions';
import { socket } from '../core';

const ChatInput = ({ currentDialogId, user, repliedMessageId }) => {
  const onSendMessage = (value, room) => {
    socket.emit('incoming-msg', {
      msg: value,
      room: room,
      username: user.data.username,
      reply_to_id: repliedMessageId
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
