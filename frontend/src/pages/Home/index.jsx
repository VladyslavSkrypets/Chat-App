import React, { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { socket } from '../../core'
import { Messages, ChatInput, Status, Sidebar } from '../../containers';
import { userActions } from '../../redux/actions';

import store from '../../redux/store';

import './Home.scss';

const Home = () => {
  // const history = useHistory();
  // const token = new URLSearchParams(useLocation().search).get('token');

  // useEffect(() => {
  //   localStorage.setItem('accessToken', token ? token : localStorage.getItem('accessToken'));
  //   console.log("SAVING USER")
  //   socket.emit('connected', token ? token : localStorage.getItem('accessToken'))
  //   socket.on('user:connected', (userData) => store.dispatch(userActions.fetchUserData(userData.user)))
  //   history.replace('/');
  // }, [])

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
