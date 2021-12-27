import React from 'react';
import { connect } from 'react-redux';
// eslint-disable-next-line no-unused-vars
import { Route, Redirect, Switch } from 'react-router-dom';

// eslint-disable-next-line no-unused-vars
import { Auth, Home } from './pages';

const App = (props) => {
  // eslint-disable-next-line no-unused-vars
  const { isAuth } = props;
  return (
    <div className="wrapper">
      <Switch>
        {/*<Route exact path={['/login', '/register']} component={Auth} />*/}
        <Route path="/" render={() => <Home />} />
      </Switch>
    </div>
  );
};

export default connect(({ user }) => ({ isAuth: user.isAuth }))(App);
