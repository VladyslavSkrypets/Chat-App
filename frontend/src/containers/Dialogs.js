import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { dialogsActions } from '../redux/actions';
import socket from '../core/socket';

import { Dialogs as BaseDialogs } from '../components';

const Dialogs = ({
  addMessageToDialog,
  setDialogs,
  currentDialogId,
  setCurrentDialogId,
  addDialog,
  items,
  userEmail,
  removeDialog,
  changeDialogPhoto,
}) => {
  const [inputValue, setValue] = useState('');
  const [filtred, setFiltredItems] = useState(items);

  const history = useHistory();
  const onChangeInput = (value = '') => {
    setFiltredItems(
      items.filter(
        (dialog) =>
          dialog.chatName.toLowerCase().indexOf(value.toLowerCase()) >= 0,
      ),
    );
    setValue(value);
  };

  useEffect(() => {
    if (items.length) {
      onChangeInput('');
    }
  }, [items]);

  useEffect(() => {
    socket.on('ADD_CHAT', (res) => {
      addDialog(res);
      setFiltredItems([...filtred, res]);
    });
    socket.on('REMOVE_CHAT', (res) => {
      removeDialog(res);
      history.push('/');
      setCurrentDialogId('');
      const filt = items;
      const index = filt.findIndex((c) => c.chatUUID === res.chatUUID);
      filt.splice(index, 1);
      setFiltredItems(filt);
    });
    socket.on('CONNECT', (res) => setDialogs(res.chats));
    socket.on('ADD_MESSAGE', (res) => addMessageToDialog(res));
    socket.on('UPDATE_CHAT_PHOTO', (res) => changeDialogPhoto(res));
    return () => {
      socket.off('ADD_CHAT');
      socket.off('CONNECT');
      socket.off('ADD_MESSAGE');
    };
  }, []);

  return (
    <BaseDialogs
      userEmail={userEmail}
      items={filtred}
      onSearch={onChangeInput}
      inputValue={inputValue}
      onSelectDialog={setCurrentDialogId}
      currentDialogId={currentDialogId}
    />
  );
};

export default connect(
  ({ dialogs }) => ({
    dialogs: dialogs,
    items: dialogs.items,
  }),
  dialogsActions,
)(Dialogs);
