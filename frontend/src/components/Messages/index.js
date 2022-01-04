import React from 'react';
import PropTypes from 'prop-types';
import { Empty, message, Spin } from 'antd';
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
  return (
    <div
      ref={blockRef}
      className={classNames('messages', { 'messages--loading': isLoading })}
    >
      {isLoading ? (
        <Spin size="large" tip="Загрузка сообщений..."></Spin>
      ) : items && !isLoading ? (
        items?.length > 0 ? (
          items.map((item) => {
            // console.log("TEST = ", currentDialog.chatMembers.find((member) => item.user_id === me))
            const sender = currentDialog?.chatMembers.find(
              (cm) => item.user_id == cm.user_id,
            );

            return (
              <>
                {item.repliedMessage ? (
                  <Message
                    key={'reply-message' + item.repliedMessage.message_id}
                    {...item.repliedMessage}
                    isMe={user?.user_id == sender?.user_id}
                    user={sender}
                    replied
                    replyMessage={() => {}}
                  />
                ) : null}
                <Message
                  key={item.message_id}
                  {...item}
                  isMe={user?.user_id == sender?.user_id}
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
          key={'rep-' + repliedMessage.message_id}
          {...repliedMessage}
          isMe={
            user?.user_id ===
            currentDialog.chatMembers.find(
              (cm) => repliedMessage?.user_id == cm?.user_id,
            ).user_id
          }
          user={currentDialog.chatMembers.find(
            (cm) => repliedMessage?.user_id == cm?.user_id,
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
