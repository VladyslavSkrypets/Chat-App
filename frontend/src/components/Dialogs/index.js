import React from 'react';
import { Input, Empty } from 'antd';

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
        placeholder="Поиск среди чатов"
        onChange={(e) => onSearch(e.target.value)}
        value={inputValue}
      />
    </div>
    {items?.length ? (
      items.map((item) => (
          <DialogItem
            onSelect={onSelectDialog}
            key={item.room_id}
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
