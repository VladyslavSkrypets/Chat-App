import React from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from 'antd';
import { Messages, ChatInput, Status, Sidebar } from '../../containers';
import { userApi } from '../../utils/api';

import './Home.scss';

const Home = () => {
  const history = useHistory();

  const logOut = () => {
    localStorage.clear();
    userApi.logout();
    history.push('/login', { from: 'Home' });
  };
  return (
    <section className="home">
      <div className="chat">
        <Sidebar />
        <div className="chat__dialog">
          <div className="chat__dialog-header">
            <div />
            <Status online />
            <Button onClick={logOut} type="link" shape="circle">
              Выйти
            </Button>
          </div>
          <div className="chat__dialog-messages">
            <Messages />
          </div>
          <div className="chat__dialog-input">
            <ChatInput />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
