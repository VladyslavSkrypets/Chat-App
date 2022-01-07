import React, { useEffect, useState } from 'react';
import { ChatInfo as BaseChatInfo } from '../components';
import { connect } from 'react-redux';
import { dialogsActions } from '../redux/actions';
import { chatsApi, userApi } from '../utils/api';
import socket from '../core/socket';
import { openNotification } from '../utils/helpers';
const ChatInfo = ({
  currentDialogId,
  items,
  changeDialogPhoto,
  user,
  setChatMembers,
}) => {
  const currentChatObj = items.find((i) => i.room_id === currentDialogId);
  const membersId = currentChatObj.chatMembers.map((member) => member.user_id);
  const [editMode, setEditMode] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState(currentChatObj.room_id);
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
    const { data } = await userApi.findUsersByNickname(val);
    if (data.length) {
      const index = data.findIndex((u) => u.email == user.email);
      if (index !== -1) data.splice(index, 1);
      
      setUsers(
        data.map((us) => {
          return { ...us, checked: false };
        }).filter((us) => !membersId.includes(us.user_id)),
      );
    }
  };
  const onAddMembers = () => {
    const chatMembersDTO = users.filter((us) => us.checked === true).map((new_user) => {
      return { user_id: new_user.user_id, room_id: currentDialogId, creator_id: user.user_id }; 
    });
    socket.emit('ROOM:ADD_USER', chatMembersDTO);
  };
  const onSelectUser = (selUser) => {
    const index = users.findIndex((u) => u.user_id === selUser.user_id);
    const selUsers = [...users];
    selUsers[index].checked = !selUsers[index].checked;
    setUsers(selUsers);
  };
  const onMemberRemove = (user_id) => {
    socket.emit('ROOM:REMOVE_USER', {
      user_id: user_id,
      room_id: currentDialogId,
      creator_id: currentChatObj.creator_id
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
      isMe={user.user_id === currentChatObj.creator_id}
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
    user: user.data
  }),
  dialogsActions,
)(ChatInfo);
