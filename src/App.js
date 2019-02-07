import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import appSyncConfig from "./aws-exports";
import { ApolloProvider } from "react-apollo";
import AWSAppSyncClient, { defaultDataIdFromObject } from "aws-appsync";
import { Rehydrated } from "aws-appsync-react";

import './App.css';

import AllTraders from './components/AllTraders';
import OneTrader from './components/OneTrader';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import Offers from './components/Offers';


const Home = () => (
  <div className="ui container">
    <AllTraders client={client}/>
  </div>
);

const AllTradersWithClient = () => (
    <AllTraders client={client}/>
);

const OneTraderWithClient = () => (
  <OneTrader client={client} />
);


const App = () => (
  <Router>
    <div>
      <Header/>
      <Route exact={true} path="/" component={Home} />
      <Route path="/multitrader" component={AllTradersWithClient} />
      <Route path="/onetrader" component={OneTraderWithClient} />
      <Route path="/offers" component={Offers} />
      {/*<Route path="/offer/:id" component={ViewCompanyOffers} />*/}
      <Route path="/login" component={LoginPage} />

    </div>
  </Router>
);

const client = new AWSAppSyncClient({
  url: appSyncConfig.aws_appsync_graphqlEndpoint,
  region: appSyncConfig.aws_appsync_region,
  auth: {
    type: appSyncConfig.aws_appsync_authenticationType,
    apiKey: appSyncConfig.aws_appsync_apiKey,
  },
  cacheOptions: {
    dataIdFromObject: (obj) => {
      let id = defaultDataIdFromObject(obj);

      if (!id) {
        const { __typename: typename } = obj;
        switch (typename) {
          case 'Company':
            const cos = `${typename}:${obj.id}`;
            console.log('in COMPANIES S -', cos);
            return `${typename}:${obj.id}`;
          case 'Offer':
            const offers = `${typename}:${obj.price}`;
            console.log('in OFFER S -',  offers);
            return `${typename}:${obj.offerID}`;
          case 'Order':
            const orders = `${typename}:${obj.price}`;
            console.log('in ORDER S -', orders);
            return `${typename}:${obj.orderID}`;
          case 'Product':
            const products = `${typename}:${obj.name}`;;
            console.log('in PRODUCT S - ', products);
            return `${typename}:${obj.id}`;
          default:
            console.log('in default type');
            return id;
        }
      }

      return id;
    }
  }
});

const WithProvider = () => (
  <ApolloProvider client={client}>
    <Rehydrated>
      <App />
    </Rehydrated>
  </ApolloProvider>
);

export default WithProvider;