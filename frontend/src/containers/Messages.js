import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';

import { messagesActions } from '../redux/actions';
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
}) => {
  const [repliedMessage, setRepliedMessage] = useState(null);

  if (!currentDialogId) return <Empty description="Откройте диалог" />;

  const messagesRef = useRef(null);

  const onNewMessage = (data) => {
    addMessage(data);
  };

  useEffect(() => {
    if (currentDialogId) {
      fetchMessages(currentDialogId);
    }
    socket.on('ADD_MESSAGE', onNewMessage);
    return () => socket.off('SERVER:NEW_MESSAGE');
  }, [currentDialogId]);

  useEffect(() => {
    messagesRef.current.scrollTo(0, 999999);
  }, [items]);
  return (
    <BaseMessages
      user={user}
      blockRef={messagesRef}
      items={items}
      isLoading={isLoading && !user}
      currentDialog={dialogs.items.find((c) => c.chatUUID === currentDialogId)}
      repliedMessage={repliedMessage}
      onReplyMessage={(message) => {
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
  }),
  messagesActions,
)(Dialogs);
