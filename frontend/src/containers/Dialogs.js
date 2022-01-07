import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { dialogsActions, messagesActions } from '../redux/actions'
import socket from '../core/socket';
import { userActions } from '../redux/actions';
import store from '../redux/store';
import { openNotification } from '../utils/helpers';

import { Dialogs as BaseDialogs } from '../components';

const Dialogs = ({
  addMessageToDialog,
  fetchMessages,
  setDialogs,
  currentDialogId,
  setCurrentDialogId,
  addDialog,
  items,
  userEmail,
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
      addDialog(res);
      openNotification({
        text: `Вы были добавлены в чат "${res.name}"`,
        duration: 3
      })
    });

    localStorage.setItem('accessToken', token ? token : localStorage.getItem('accessToken'));
    socket.emit('connected', token ? token : localStorage.getItem('accessToken'))
    socket.on('user:connected', (userData) => {
      store.dispatch(userActions.fetchUserData(userData.user));
      setDialogs(userData.chats)
      history.replace('/');
    })

    socket.on('MESSAGE:ADD_LAST', (res) => {
      const dialog_id = window.location.pathname.split('dialog/')[1];
      addMessageToDialog(res)
      if (dialog_id != res.room_id) {
        openNotification({
          type: 'success',
          text: `У вас новое сообщенние в чате "${res.room_name}"`,
          duration: 2
        })
      }
    });
  }, []);

  useEffect(() => {
    socket.on('CHATS:UPDATE', (data) => {
      console.log("NEW CHATS =", data.chats)
      setDialogs(data.chats);
      setFiltredItems(data.chats);
      if (data.clear) {
        openNotification({
          title: `Вы были удалены из чата "${data.room_name}"`,
          duration: 3
        })
      }
      if (data.is_added) {
        openNotification({
          title: `Вы были добавлены в чат "${data.room_name}"`,
          duration: 3
        })
      }
    })
  }, [])

  filtred.sort(function (a, b) {
    if (a.name > b.name) {
      return 1;
    }
    if (a.name < b.name) {
      return -1;
    }
    return 0;
  });

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
    currentDialogId: dialogs.currentDialogId
  }),
  { ...messagesActions,...dialogsActions }
)(Dialogs);
