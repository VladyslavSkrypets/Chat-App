import React, { useState } from 'react';
import { Status as BaseStatus } from '../components';
import { connect } from 'react-redux';
import { Modal } from 'antd';
import { ChatInfo } from './index';
import { useHistory } from 'react-router-dom';
import { dialogsActions } from '../redux/actions';


const Status = ({ currentDialogId, user, dialogs, setCurrentDialogId }) => {
  console.log("IN STATIS")
  const [showModal, setShowModal] = useState(false);
  const history = useHistory();

  if (!dialogs.length || !currentDialogId) {
    return null;
  }

  const currentDialogObj = dialogs.find(
    (dialog) => dialog.room_id === currentDialogId,
  );
  const toggleShowModal = () => {
    setShowModal(!showModal);
  };
  if (!currentDialogObj) {
    history.push('/');
    setCurrentDialogId('');
  }
  return (
    <>
      <Modal
        title={'Chat Info'}
        visible={showModal}
        onCancel={toggleShowModal}
        onOk={toggleShowModal}
      >
        <ChatInfo />
      </Modal>
      <BaseStatus
        // online={false}
        onClick={toggleShowModal}
        fullname={currentDialogObj?.name}
      />
    </>
  );
  
};

export default connect(
  ({ dialogs, user }) => ({
    dialogs: dialogs.items,
    currentDialogId: dialogs.currentDialogId,
    user: user.data,
  }),
  dialogsActions,
)(Status);
