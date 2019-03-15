import React, { Component } from 'react'
import { Auth } from 'aws-amplify';
import { Router, Route } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';
import { v4 as uuid } from "uuid";

import AllTraders from './AllTraders';
import LoginPage from './LoginPage';
import { OneTrader } from './OneTrader';
import { Source } from './Source';
import { Header } from './Header';

import { graphql, compose } from 'react-apollo'
import AddCompany from '../graphQL/mutationAddCompany';
import AddCompanyB from '../graphQL/mutationAddCompanyB';
import ListCompanies from "../graphQL/queryAllCompanies";
import NewCompanySubscription from "../graphQL/subscriptionCompanyNew";


export const history = createHistory();

class AppRouter extends Component {
    company = { userID: null, companyID: null, name: "Assembler Inc.",  yearsOfOperation: 10 }
    isNewCoStarted = false;
    Home = () => (
        <div className="ui container">
            <AllTraders client={this.props.client} />
        </div>
    );

    AllTradersWithClient = () => (
        <AllTraders client={this.props.client} companyBID = {this.company.companyID} />
    );

    OneTraderWithClient = () => (
        <OneTrader client={this.props.client} />
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
        console.log('client in router', this.props.client);
        Auth.currentAuthenticatedUser().then(async(user) => {
            console.log('state in router', this.state);
            if (!this.isNewCoStarted) {
                this.company.userID = user.username;
                this.company.companyID = user.username;
                this.isNewCoStarted = true;
                await this.props.onAddCo({...this.company});
            }
            console.log('currentAuthenticatedUser - ', user);
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
                client={this.props.client}
                />
            }
      </div>
    )
  }
}

export default compose(
    // graphql(ListCompanies, {
    //     options: () => {
    //         return ({
    //             // variables: { limit, nextToken, companyID },
    //             fetchPolicy: 'cache-and-network'
    //         });
    //     },
    //     // options: {
    //     //     fetchPolicy: 'cache-and-network'
    //     // },
    //     props: props => ({
    //         data: {
    //             listCompanies: {
    //                 items: props.data.listCompanies ? props.data.listCompanies.items : [],
    //             }
    //         },
    //         subscribeToNewCompanies: params => {
    //             props.data.subscribeToMore({
    //                 document: NewCompanySubscription,
    //                 updateQuery: (prev, { subscriptionData: { data: { onCreateCompany } } }) => {
    //                     return {
    //                         ...prev,
    //                         listCompanies: {
    //                             __typename: 'CompanyConnection',
    //                             items: [onCreateCompany, ...prev.listCompanies.items.filter(company => company.id !== onCreateCompany.id)]
    //                         }
    //                     }
    //                 }
    //             })
    //         }
    //     })
    // }),
    // graphql(ListCompanies, {
    //     // options: ({ limit, nextToken, companyID }) => {
    //     //     return ({
    //     //         variables: { limit, nextToken, companyID },
    //     //         fetchPolicy: 'cache-and-network'
    //     //     });
    //     // },
    //     options: {
    //         fetchPolicy: 'cache-and-network'
    //     },
    //     props: props => ({
    //         data: {
    //             listCompanies2: {
    //                 items: props.data.listCompanies ? props.data.listCompanies.items : [],
    //             }
    //         },
    //         subscribeToNewOffers2: params => {
    //             props.data.subscribeToMore({
    //                 document: NewCompanySubscription,
    //                 updateQuery: (prev, { subscriptionData: { data: { onCreateCompany } } }) => {
    //                     return {
    //                         ...prev,
    //                         listCompanies2: {
    //                             __typename: 'OfferConnection',
    //                             items: [onCreateCompany, ...prev.listCompanies.items.filter(company => company.id !== onCreateCompany.id)]
    //                         }
    //                     }
    //                 }
    //             })
    //         }
    //     })
    // }),

    graphql(AddCompanyB, {
        props: props => ({
            onAddCo: company => props.mutate({
                variables: company,
                optimisticResponse: {
                    __typename: 'Mutation',
                    createCompany: { ...company, id: '' + Math.round(Math.random() * -1000000), __typename: 'Company' }
                },
                update: (proxy, { data: { createCompany } }) => {
                    console.log('proxy b4', proxy);

                    // const data = proxy.readQuery({
                    //     query: ListCompanies,
                    //     // variables: {
                    //     //     limit: props.ownProps.limit,
                    //     //     nextToken: null,
                    //     //     companyID: props.ownProps.companyID
                    //     // }
                    // });
                    // console.log('data 1 after read', data.listCompanies.items.length, JSON.stringify(data));

                    // // data.listCompanies.items.push(createCompany);

                    // data.listCompanies.items = [
                    //     ...data.listCompanies.items.filter(e => {
                    //         // console.log('e = ', e);
                    //         // console.log('e.orderID = ', e.orderID);
                    //         return e.id !== createCompany.id
                    //     })
                    //     , createCompany];

                    // console.log('data 2 b4 write', data.listCompanies.items.length, JSON.stringify(data));
                    // proxy.writeQuery({ query: ListCompanies, data });

                    // //////

                    // const data2 = proxy.readQuery({
                    //     query: ListCompanies,
                    // });
                    // console.log('data2 1 after read', data2.listCompanies.items.length, JSON.stringify(data2));

                    // // data.listCompanies.items.push(createCompany);

                    // data2.listCompanies.items = [
                    //     ...data2.listCompanies.items.filter(e => {
                    //         // console.log('e = ', e);
                    //         // console.log('e.orderID = ', e.orderID);
                    //         return e.id !== createCompany.id
                    //     })
                    //     , createCompany];

                    // console.log('data2 2 b4 write', data2.listCompanies.items.length, JSON.stringify(data2));
                    // proxy.writeQuery({ query: ListCompanies, data: data2 });
                }
            })
        }),
    })
)(AppRouter)

