import React, { Component } from 'react'
import { Auth } from 'aws-amplify';
import { Router, Route } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';

import AllTraders from './AllTraders';
import { LoginPage } from './LoginPage';
import { OneTrader } from './OneTrader';
import { Source } from './Source';
import { Header } from './Header';

export const history = createHistory();

class AppRouter extends Component {

    Home = () => (
        <div className="ui container">
            <AllTraders client={this.props.client} />
        </div>
    );

    AllTradersWithClient = () => (
        <AllTraders client={this.props.client} />
    );

    OneTraderWithClient = () => (
        <OneTrader client={this.props.client} />
    );

    constructor(props) {
        super(props);
        this.checkLoginStatus = this.checkLoginStatus.bind(this);
        this.state = {
            authState: 'loading'
        }
    }

    componentDidMount() {
        this.checkLoginStatus('componentDidMount');
    }

    componentWillReceiveProps() {
        this.checkLoginStatus('componentWillReceiveProps');
    }

    checkLoginStatus(sender) {
        console.log('client in router', this.props.client);
        Auth.currentAuthenticatedUser().then(user => {
            console.log(user);
            this.setState({ authState: 'signedIn' });
            history.push('/multitrader');
            console.log('AppRouter - authState from ', sender, this.state.authState);

        }).catch(e => {
            console.log(e);
            this.setState({ authState: 'signIn' });
            history.push('/login');
            console.log('AppRouter - authState 2 from ', sender, this.state.authState);
        });
    }

  render() {
      console.log('router props', this.props);
    return (
      <div>
            {this.state.authState === 'signedIn' &&
            <div>
            <Router history={history}>
            <div>
            <Header checkLoginStatus={this.checkLoginStatus}/>
            <Route exact={true} path="/" component={this.Home} />
            <Route path="/multitrader" component={this.AllTradersWithClient} />
            <Route path="/onetrader" component={this.OneTraderWithClient} />
            <Route path="/source" component={Source} />
            <Route path="/offers" component={this.Offers} />
            
            </div>
            </Router>
            </div>
            }
            {this.state.authState !== 'signedIn' &&
                <LoginPage 
                checkLoginStatus={this.checkLoginStatus}
                />
            }
      </div>
    )
  }
}

export default AppRouter
