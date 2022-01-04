import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';

import { dialogsActions, messagesActions } from '../redux/actions'
import socket from '../core/socket';

import { Messages as BaseMessages } from '../components';
import { Empty } from 'antd';

const Dialogs = ({
  currentDialogId,
  dialogs,
  fetchMessages,
  addMessage,
  items,
  user,
  isLoading,
  setRepliedMessageId
}) => {
  const [repliedMessage, setRepliedMessage] = useState(null);

  const messagesRef = useRef(null);

  const onNewMessage = (data) => {
    addMessage(data);
  };

  useEffect(() => {
    if (currentDialogId) {
      console.log("messages dialog_id = ", currentDialogId)
      fetchMessages(currentDialogId);
    }
    socket.on('add_message', onNewMessage);
    return () => socket.off('add_message');
  }, [currentDialogId]);

  useEffect(() => {
    messagesRef.current?.scrollTo(0, 999999);
  }, [items]);

  if (!currentDialogId) return <Empty description="Откройте диалог" />;

  return (
    <BaseMessages
      user={user}
      blockRef={messagesRef}
      items={items}
      isLoading={isLoading && !user}
      currentDialog={dialogs.items.find((c) => c.room_id === currentDialogId)}
      repliedMessage={repliedMessage}
      onReplyMessage={(message) => {
        setRepliedMessageId(message?.message_id ?? null);
        setRepliedMessage(message);
      }}
    />
  );
};

export default connect(
  ({ dialogs, messages, user }) => ({
    dialogs: dialogs,
    currentDialogId: dialogs.currentDialogId,
    items: messages.items,
    isLoading: messages.isLoading,
    user: user.data,
  }),{ ...messagesActions,...dialogsActions }
)(Dialogs);
