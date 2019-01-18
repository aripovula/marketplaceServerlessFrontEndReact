import React from 'react';
import { Router, Route, Switch, Link, NavLink } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';

import LoginPage from './components/LoginPage';
import { Header } from './components/Header';
import AllTraders from './components/AllTraders';
import { OneTrader } from './components/OneTrader';
import { DataRoom } from './components/DataRoom';
// import PrivateRoute from './PrivateRoute';
// import PublicRoute from './PublicRoute';

export const history = createHistory();


const AppRouter = () => (
    <Router history={history}>
    <div>
        <Header />
            <Switch>
                <Route path="/" component={LoginPage} exact={true} />
                <Route path="/multitrader" component={AllTraders} exact={true} />
                <Route path="/onetrader" component={OneTrader} exact={true} />
                <Route path="/dataroom" component={DataRoom} exact={true} />
            </Switch>
        </div>
    </Router>
);

export default AppRouter;

// <PrivateRoute path="/postings" component={MainAllPostings} exact={true} />
//     <PrivateRoute path="/createposting" component={MainAddPosting} exact={true} />
//     <PrivateRoute path="/editposting/:id" component={MainAddPosting} exact={true} />
