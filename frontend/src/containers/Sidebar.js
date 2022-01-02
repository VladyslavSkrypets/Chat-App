import React, { useState } from 'react';
import { connect } from 'react-redux';
import { userApi } from '../utils/api';
import socket from '../core/socket';
import { Sidebar } from '../components';

const SidebarContainer = ({ user }) => {
  const [visible, setVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [chatName, setChatName] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const onClose = () => {
    setVisible(false);
  };

  const onShow = () => {
    setVisible(true);
  };

  const onSearch = async (value) => {
    setIsLoading(true);
    const { data } = await userApi.findUsersByNickname(value);
    console.log("SERACH DATA = ", data)
    if (data.length) {
      const index = data.findIndex((u) => u.email == user.email);
      if (index !== -1) data.splice(index, 1);
      setUsers(
        data.map((us) => {
          return { ...us, checked: false };
        }),
      );
      setIsLoading(false);
    }
  };

  const onAddDialog = () => {
    const usersData = users.filter((us) => us.checked).map((us) => {return {'user_id': us.user_id}});

    console.log('add users to chat', usersData);

    socket.emit('room-create', {
        room_name: chatName,
        members: [...usersData],
        creator_id: user.user_id
      })
  };

  const handleChangeInput = async (value) => {
    setInputValue(value.target.value);
    await onSearch(value.target.value);
  };

  const onChangeTextArea = (e) => {
    setChatName(e.target.value);
  };

  const onSelectUser = (selUser) => {
    const index = users.findIndex((u) => u.email === selUser.email);
    let selUsers = [...users];
    selUsers[index].checked = !selUsers[index].checked;
    setUsers(selUsers);
  };

  return (
    <Sidebar
      user={user}
      inputValue={inputValue}
      visible={visible}
      isLoading={isLoading}
      onClose={onClose}
      onShow={onShow}
      onSearch={onSearch}
      onChangeInput={handleChangeInput}
      onSelectUser={onSelectUser}
      onModalOk={onAddDialog}
      onChangeTextArea={onChangeTextArea}
      chatName={chatName}
      users={users}
    />
  );
};

export default connect(({ user }) => ({ user: user.data }))(SidebarContainer);
