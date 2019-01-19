import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import appSyncConfig from "./aws-exports";
import { ApolloProvider } from "react-apollo";
import AWSAppSyncClient, { defaultDataIdFromObject } from "aws-appsync";
import { Rehydrated } from "aws-appsync-react";

import './App.css';
import DataRoom from './components/DataRoom';
import AllTraders from './components/AllTraders';
import OneTrader from './components/OneTrader';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';


const Home = () => (
  <div className="ui container">
    <DataRoom />
    {console.log('client = ', client)
    }
  </div>
);

const App = () => (
  <Router>
    <div>
      <Header/>
      <Route exact={true} path="/" component={Home} />
      <Route path="/multitrader" component={AllTraders} />
      <Route path="/onetrader" component={OneTrader} />
      <Route path="/dataroom" component={DataRoom} />
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
          case 'Offer':
            return `${typename}:${obj.companyID}`;
          default:
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