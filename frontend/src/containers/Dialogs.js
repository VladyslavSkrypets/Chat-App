import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { dialogsActions } from '../redux/actions';
import { chatsApi } from '../utils/api';
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
          dialog.name.toLowerCase().indexOf(value.toLowerCase()) >= 0,
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
    socket.on('add_chat', (res) => {
      addDialog(res);
      setFiltredItems([...filtred, res]);
    });
    socket.on('remove_chat', (res) => {
      removeDialog(res);
      history.push('/');
      setCurrentDialogId('');
      const filt = items;
      const index = filt.findIndex((c) => c.room === res.room);
      filt.splice(index, 1);
      setFiltredItems(filt);
    });
    chatsApi.getAll().then(({data}) => setDialogs(data.chats ? data.chats : []));
    socket.on('add_message', (res) => addMessageToDialog(res));
    socket.on('UPDATE_CHAT_PHOTO', (res) => changeDialogPhoto(res));
    return () => {
      socket.off('room-create');
      socket.off('incoming-msg');
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
