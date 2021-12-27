import { Avatar, Button, UserOptions } from '../index';
import React from 'react';
import './ChatInfo.scss';
const ChatInfo = ({
  editMode,
  chatUUID,
  chatName,
  photo,
  value,
  isMe,
  chatMembers = [],
  // onNameChange,
  onSelectUser,
  users = [],
  onAddMembers,
  onMemberRemove,
  onAddFile,
  changeChatPhoto,
  onChangeValue,
  onToggleEdit,
}) => {
  return (
    <div className={'chatInfo'}>
      {isMe ? <Button onClick={onToggleEdit}>Edit</Button> : null}
      <Avatar user={{ photo, name: chatName, uuid: chatUUID }} />
      {editMode ? (
        <div className={'fileUpload'}>
          <label htmlFor="file">Choose images to upload (PNG, JPG)</label>
          <input
            type="file"
            id={'file'}
            onChange={({ target }) => onAddFile(target.files)}
          />
          <Button onClick={changeChatPhoto}>Submit</Button>
        </div>
      ) : null}
      {/*{editMode ? (*/}
      {/*  <>*/}
      {/*    <label htmlFor="chatName">Input new member email:</label>*/}
      {/*    <input*/}
      {/*      id={'chatName'}*/}
      {/*      onChange={({ target }) => onNameChange(target.value)}*/}
      {/*      value={chatName}*/}
      {/*    />*/}
      {/*  </>*/}
      {/*) : (*/}
      <div className={'chatName'}>{chatName}</div>
      {/*)}*/}
      {chatMembers.map((cm) => (
        <div key={cm.email} className={'chatMember'}>
          <div>{cm.name}</div>
          {editMode ? (
            <div>
              <Button
                onClick={() => {
                  onMemberRemove(cm.email);
                }}
              >
                Remove
              </Button>
            </div>
          ) : null}
        </div>
      ))}

      {editMode ? (
        <>
          <input
            value={value}
            onChange={({ target }) => onChangeValue(target.value)}
          />
          <UserOptions onSelectUser={onSelectUser} users={users} />
          <Button onClick={onAddMembers}>Add Members</Button>
        </>
      ) : null}
    </div>
  );
};
export default ChatInfo;
