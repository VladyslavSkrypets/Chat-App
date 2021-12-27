import React, { useEffect, useState } from 'react';
import { ChatInfo as BaseChatInfo } from '../components';
import { connect } from 'react-redux';
import { dialogsActions } from '../redux/actions';
import { chatsApi, userApi } from '../utils/api';
import socket from '../core/socket';
const ChatInfo = ({
  currentDialogId,
  items,
  changeDialogPhoto,
  user,
  setChatMembers,
}) => {
  const currentChatObj = items.find((i) => i.chatUUID === currentDialogId);
  const [editMode, setEditMode] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState(currentChatObj.chatName);
  const [value, setValue] = useState('');

  useEffect(() => {
    socket.on('CHAT_EDIT', (res) => {
      changeDialogPhoto(res);
    });
    socket.on('SET_CHAT_MEMBERS', (res) => {
      console.log(res);
      setChatMembers(res.chatMembers);
    });
  }, []);
  const onToggleEdit = () => {
    setEditMode(!editMode);
  };
  const onAddFile = (file) => {
    console.log(file);
    setPhotoFile(file[0]);
  };
  const changeChatPhoto = async () => {
    console.log(photoFile, currentDialogId);
    await chatsApi.postChatPhoto(photoFile, currentDialogId);
  };
  const onSearch = async (val) => {
    setValue(val);
    const { data } = await userApi.findUsersByEmail(val);
    const index = data.findIndex((u) => u.email == user.email);
    if (index !== -1) data.splice(index, 1);
    setUsers(
      data.map((us) => {
        return { ...us, checked: false };
      }),
    );
  };
  const onAddMembers = () => {
    const chatMembersDTO = users.map((u) => {
      return { userEmail: u.email, chatUUID: currentDialogId };
    });
    socket.emit('ADD_CHAT_MEMBERS', chatMembersDTO);
  };
  const onSelectUser = (selUser) => {
    const index = users.findIndex((u) => u.email === selUser.email);
    const selUsers = [...users];
    selUsers[index].checked = !selUsers[index].checked;
    setUsers(selUsers);
  };
  const onMemberRemove = (email) => {
    socket.emit('REMOVE_CHAT_MEMBER', {
      userEmail: email,
      chatUUID: currentDialogId,
    });
  };
  return (
    <BaseChatInfo
      editMode={editMode}
      {...currentChatObj}
      onToggleEdit={onToggleEdit}
      onSelectUser={onSelectUser}
      onMemberRemove={onMemberRemove}
      onAddMembers={onAddMembers}
      onNameChange={(n) => setName(n)}
      chatName={name}
      onAddFile={onAddFile}
      changeChatPhoto={changeChatPhoto}
      isMe={user.email === currentChatObj.ownerEmail}
      value={value}
      onChangeValue={onSearch}
      users={users}
    />
  );
};

export default connect(
  ({ dialogs, user }) => ({
    currentDialogId: dialogs.currentDialogId,
    items: dialogs.items,
    user: user.data,
  }),
  dialogsActions,
)(ChatInfo);
