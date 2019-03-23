import React, { Component } from 'react'
import { Router, Route, Switch, Link, NavLink } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';

import LoginPage from './components/LoginPage';
import { Header } from './components/Header';
import AllTraders from './components/AllTraders';
import { OneTrader } from './components/OneTrader';
import { DataRoom } from './components/DataRoom';

export const history = createHistory();

export class AppRouter extends Component {
  render() {
    return (
        <Router history={history}>
            <div>
                    {console.log('props 112 = ', this.props)}
                    {console.log('client 112 = ', this.props.client)}

                <Header />
                <Switch>
                    <Route path="/" component={LoginPage} exact={true} />
                    <Route path="/multitrader" component={AllTraders} exact={true} />
                    <Route path="/onetrader" component={OneTrader} exact={true} />
                    <Route path="/dataroom" component={DataRoom} exact={true} />
                </Switch>
            </div>
        </Router>
    )
  }
}

export default AppRouter
