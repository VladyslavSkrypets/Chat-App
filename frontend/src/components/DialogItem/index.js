import React from 'react';
import classNames from 'classnames';
import { IconReaded, Avatar } from '../';
import { format, isToday } from 'date-fns';
import { Link } from 'react-router-dom';

const getMessageTime = (createdAt) => {
  if (isToday(new Date(createdAt))) {
    return format(new Date(createdAt), 'HH:mm');
  } else {
    return format(new Date(createdAt), 'dd.MM.yyyy');
  }
};

const DialogItem = ({
  room,
  messages,
  chatMembers,
  unread,
  isGroup,
  chatName,
  photo,
  userEmail,
  currentDialogId,
  onSelect,
}) => (
  <Link to={`/dialog/${room}`}>
    <div
      className={classNames('dialogs__item', {
        'dialogs__item--online': false,
        // user.isOnline,
        'dialogs__item--selected': currentDialogId === room,
      })}
      onClick={() => onSelect(room)}
    >
      <div className="dialogs__item-avatar">
        <Avatar
          user={
            isGroup
              ? { photo, name: chatName, uuid: room }
              : {
                  ...chatMembers.find((cm) => cm.email !== userEmail),
                  uuid: room,
                }
          }
        />
      </div>
      <div className="dialogs__item-info">
        <div className="dialogs__item-info-top">
          <b>{chatName}</b>
          <span>
            {messages.length
              ? getMessageTime(messages[messages.length - 1].date)
              : null}
          </span>
        </div>
        <div className="dialogs__item-info-bottom">
          <p>
            {messages.length
              ? messages[messages.length - 1].text ??
                messages[messages.length - 1].photo
              : null}
          </p>
          {<IconReaded isMe={true} isReaded={true} />}
          {unread > 0 && (
            <div className="dialogs__item-info-bottom-count">
              {unread > 9 ? '+9' : unread}
            </div>
          )}
        </div>
      </div>
    </div>
  </Link>
);

export default DialogItem;
