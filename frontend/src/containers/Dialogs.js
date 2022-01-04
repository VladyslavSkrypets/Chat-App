import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { dialogsActions } from '../redux/actions';
import socket from '../core/socket';
import { chatsApi } from '../utils/api';
import { userActions } from '../redux/actions';
import store from '../redux/store';

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
  const token = new URLSearchParams(useLocation().search).get('token');

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
      console.log("CREATED CHAT DATA = ", res);
      addDialog(res);
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

    socket.on('CHATS:UPDATE', (data) => {
      setDialogs(data.chats);
      // history.replace('/');
    })

    localStorage.setItem('accessToken', token ? token : localStorage.getItem('accessToken'));
    socket.emit('connected', token ? token : localStorage.getItem('accessToken'))
    socket.on('user:connected', (userData) => {
      console.log("GOT USER DATA", userData.user);
      store.dispatch(userActions.fetchUserData(userData.user));
      setDialogs(userData.chats)
    })
    history.replace('/');

    // socket.on('add_message', (res) => addMessageToDialog(res));
    socket.on('add_message', (res) => console.log("res = ", res));
    socket.on('UPDATE_CHAT_PHOTO', (res) => changeDialogPhoto(res));
    return () => {
      socket.off('room-create');
      // socket.off('add_message');
      socket.off('user:chats');
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
