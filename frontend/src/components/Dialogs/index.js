import React from 'react';
import { Input, Empty } from 'antd';

// import orderBy from 'lodash/orderBy';

import DialogItem from '../DialogItem';

import './Dialogs.scss';

const Dialogs = ({
  items,
  userEmail,
  onSearch,
  inputValue,
  currentDialogId,
  onSelectDialog,
}) => (
  <div className="dialogs">
    <div className="dialogs__search">
      <Input.Search
        placeholder="Поиск среди контактов"
        onChange={(e) => onSearch(e.target.value)}
        value={inputValue}
      />
    </div>
    {items.length ? (
      items
        .sort((a, b) =>
          a.messages.length && b.messages.length
            ? Number(new Date(b.messages[b.messages.length - 1].date)) -
              Number(new Date(a.messages[a.messages.length - 1].date))
            : 0,
        )
        .map((item) => (
          <DialogItem
            onSelect={onSelectDialog}
            key={item.chatUUID}
            // isMe={item.user.id === userId}
            userEmail={userEmail}
            currentDialogId={currentDialogId}
            {...item}
          />
        ))
    ) : (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Ничего не найдено"
      />
    )}
  </div>
);

export default Dialogs;
