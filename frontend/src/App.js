import React from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { Home } from './pages';

const App = (props) => {
  const { isAuth } = props;
  return (
    <div className="wrapper">
      <Switch>
        <Route path="/" render={() => <Home />} />
      </Switch>
    </div>
  );
};

export default connect(({ user }) => ({ isAuth: user.isAuth }))(App);
