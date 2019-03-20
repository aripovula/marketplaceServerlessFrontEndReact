import React, { Component } from 'react'
import { Auth } from 'aws-amplify';
import { Router, Route } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';

import AllTraders from './AllTraders';
import LoginPage from './LoginPage';
import Search from './Search';
import { Source } from './Source';
import { Header } from './Header';

import { graphql, compose } from 'react-apollo'
import AddCompanyB from '../graphQL/mutationAddCompanyB';


export const history = createHistory();

class AppRouter extends Component {
    company = { userID: null, companyID: null, name: "Assembler Inc.",  yearsOfOperation: 10 }
    isNewCoStarted = false;
    Home = () => (
        <div className="ui container">
            <AllTraders client={this.props.client} 
            companyBID={this.company.companyID} 
            isNewUser={this.isNewCoStarted}/>
        </div>
    );

    AllTradersWithClient = () => (
        <AllTraders
            client = {this.props.client}
            companyBID = {this.company.companyID}
            isNewUser = {this.isNewCoStarted}
        />
    );

    SearchWithClient = () => (
        <Search client={this.props.client} 
            companyBID={this.company.companyID}
        />
    );

    constructor(props) {
        super(props);
        this.checkLoginStatus = this.checkLoginStatus.bind(this);
        this.state = {
            authState: 'loading',
        }
    }

    componentDidMount() {
        this.checkLoginStatus('componentDidMount');
    }

    componentWillReceiveProps() {
        this.checkLoginStatus('componentWillReceiveProps');
    }

    checkLoginStatus = async(sender) => {
        Auth.currentAuthenticatedUser().then(async(user) => {
            this.company.userID = user.username;
            this.company.companyID = user.username;
            if (sender === "Signup" && !this.isNewCoStarted) {
                this.isNewCoStarted = true;
                await this.props.onAddCo({...this.company});
            }
            console.log('currentAuthenticatedUser - ', user);
            this.setState({ authState: 'signedIn' });
            history.push('/multitrader');
        }).catch(e => {
            console.log(e);
            this.setState({ authState: 'signIn' });
            history.push('/login');
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
                <Header checkLoginStatus={this.checkLoginStatus} username={this.company.userID}/>
                <Route exact={true} path="/" component={this.Home} />
                <Route path="/multitrader" component={this.AllTradersWithClient} />
                <Route path="/search" component={this.SearchWithClient} />
                <Route path="/source" component={Source} />
                <Route path="/offers" component={this.Offers} />
                
                </div>
                </Router>
                </div>
            }
            {this.state.authState !== 'signedIn' &&
                <LoginPage 
                checkLoginStatus={this.checkLoginStatus}
                client={this.props.client}
                />
            }
      </div>
    )
  }
}

export default compose(
    graphql(AddCompanyB, {
        props: props => ({
            onAddCo: company => props.mutate({
                variables: company,
            })
        }),
    }),
)(AppRouter)

