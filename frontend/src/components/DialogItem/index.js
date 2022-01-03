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
  name,
  room_id,
  last_message,
  chatMembers,
  message_text,
  unread,
  isGroup,
  chatName,
  photo,
  userEmail,
  currentDialogId,
  onSelect,
}) => (
  <Link to={`/dialog/${room_id}`}>
    <div
      className={classNames('dialogs__item', {
        'dialogs__item--online': false,
        'dialogs__item--selected': currentDialogId === room_id,
      })}
      onClick={() => onSelect(room_id)}
    >
      <div className="dialogs__item-avatar">
        <Avatar
          user={{ photo, name: name, uuid: room_id }
          }
        />
      </div>
      <div className="dialogs__item-info">
        <div className="dialogs__item-info-top">
          <b>{name}</b>
          <span>
            {last_message.length
              ? last_message.sent_at
              : null}
          </span>
        </div>
        <div className="dialogs__item-info-bottom">
          <p>
            {message_text
              ? message_text
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
