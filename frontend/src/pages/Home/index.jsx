import React, { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Button } from 'antd';
import { Messages, ChatInput, Status, Sidebar } from '../../containers';
import { userApi } from '../../utils/api';

import './Home.scss';

const Home = () => {
  const history = useHistory();
  const token = new URLSearchParams(useLocation().search).get('token');

  useEffect(() => {
    localStorage.setItem('accessToken', token ? token : localStorage.getItem('accessToken'));
    console.log(token, history);
    userApi.getMe()
    history.replace('/');
  }, [])

  return (
    <section className="home">
      <div className="chat">
        <Sidebar />
        <div className="chat__dialog">
          <div className="chat__dialog-header">
            <div />
            <Status online />
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
