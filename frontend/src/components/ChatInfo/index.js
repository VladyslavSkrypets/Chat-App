import { Avatar, Button, UserOptions } from '../index';
import React from 'react';
import './ChatInfo.scss';
const ChatInfo = ({
  editMode,
  room_id,
  name,
  photo,
  value,
  isMe,
  chatMembers = [],
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
      <div style={{width: '100px', height: '100px', margin: 'auto', marginTop: '15px'}}>
        <Avatar user={{ photo, name: name, uuid: room_id }} />
      </div>
      {/* {editMode ? (
        <div className={'fileUpload'}>
          <label htmlFor="file">Choose images to upload (PNG, JPG)</label>
          <input
            type="file"
            id={'file'}
            onChange={({ target }) => onAddFile(target.files)}
          />
          <Button onClick={changeChatPhoto}>Submit</Button>
        </div>
      ) : null} */}
      <div className={'chatName'}>{name}</div>
      {chatMembers.map((cm) => (
        <div key={cm.email} className={'chatMember'}>
          <div>{cm.username}</div>
          {editMode ? (
            <div>
              <Button
                onClick={() => {
                  onMemberRemove(cm.user_id);
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
