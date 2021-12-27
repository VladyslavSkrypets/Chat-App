/* eslint-disable no-unused-vars */
import React from 'react';
// eslint-disable-next-line no-unused-vars
import { Button, Modal, Select, Input, Form } from 'antd';
import { TeamOutlined, FormOutlined } from '@ant-design/icons';
import { Dialogs } from '../../containers';
import { UserOptions } from '../index';

const { Option } = Select;
const { TextArea } = Input;

const Sidebar = ({
  user,
  visible,
  inputValue,
  isLoading,
  users,
  onShow,
  onClose,
  onChangeInput,
  onSelectUser,
  onModalOk,
  chatName,
  onChangeTextArea,
}) => {
  return (
    <div className="chat__sidebar">
      <div className="chat__sidebar-header">
        <div>
          <TeamOutlined shape="circle" />
          <span>Список диалогов</span>
        </div>
        <Button
          onClick={onShow}
          type="link"
          shape="circle"
          icon={<FormOutlined />}
        />
      </div>
      <div className="chat__sidebar-dialogs">
        <Dialogs userEmail={user && user.email} />
      </div>
      <Modal
        title="Создать диалог"
        visible={visible}
        onCancel={onClose}
        footer={[
          <Button key="black" onClick={onClose}>
            Закрыть
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isLoading}
            onClick={onModalOk}
          >
            Создать
          </Button>,
        ]}
      >
        <Form className="add-dialog-form">
          <Form.Item label="Введите имя пользователя или E-Mail">
            <input
              value={inputValue}
              onChange={onChangeInput}
              placeholder={'Найти пользователя'}
              style={{ width: '100%' }}
            />
            <UserOptions users={users} onSelectUser={onSelectUser} />
          </Form.Item>

          {/*{selectedUserId && (*/}
          <Form.Item label="Введите название чата">
            <TextArea
              placeholder=""
              autoSize={{ minRows: 3, maxRows: 10 }}
              onChange={onChangeTextArea}
              value={chatName}
            />
          </Form.Item>
          {/*)}*/}
        </Form>
      </Modal>
    </div>
  );
};

Sidebar.defaultProps = {
  users: [],
};

export default Sidebar;
