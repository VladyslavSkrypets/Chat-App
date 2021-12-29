import React from 'react';
import PropTypes from 'prop-types';
import { Empty, Spin } from 'antd';
import classNames from 'classnames';

import { Message } from '../';

import './Messages.scss';

const Messages = ({
  blockRef,
  isLoading,
  items,
  user,
  currentDialog,
  repliedMessage,
  onReplyMessage,
}) => {

  console.log("current dialog = ", currentDialog)
  return (
    <div
      ref={blockRef}
      className={classNames('messages', { 'messages--loading': isLoading })}
    >
      {isLoading ? (
        <Spin size="large" tip="Загрузка сообщений..."></Spin>
      ) : items && !isLoading ? (
        items.length > 0 ? (
          items.map((item) => {
            const sender = currentDialog.chatMembers.find(
              (cm) => item.userEmail == cm.email,
            );

            return (
              <>
                {item.repliedMessage ? (
                  <Message
                    key={'' + item.repliedMessage.messagesUUID}
                    {...item.repliedMessage}
                    isMe={user.email == sender.email}
                    user={sender}
                    replied
                    replyMessage={() => {}}
                  />
                ) : null}
                <Message
                  key={item.messagesUUID}
                  {...item}
                  isMe={user.email == sender.email}
                  user={sender}
                  replyMessage={() => onReplyMessage(item)}
                />
              </>
            );
          })
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Нет сообщений"
          />
        )
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Откройте диалог"
        />
      )}
      {repliedMessage ? (
        <Message
          key={'rep-' + repliedMessage.messagesUUID}
          {...repliedMessage}
          isMe={
            user?.email ==
            currentDialog.chatMembers.find(
              (cm) => repliedMessage.userEmail == cm.email,
            ).email
          }
          user={currentDialog.chatMembers.find(
            (cm) => repliedMessage.userEmail == cm.email,
          )}
          replied
          replyMessage={() => onReplyMessage(null)}
        />
      ) : null}
    </div>
  );
};

Messages.propTypes = {
  items: PropTypes.array,
  replied: PropTypes.bool,
  onReplyMessage: PropTypes.func,
};

export default Messages;
