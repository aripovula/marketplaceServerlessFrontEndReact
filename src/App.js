import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Amplify, { Auth } from 'aws-amplify';
import { Authenticator } from 'aws-amplify-react';
import appSyncConfigCustom from './aws-appsync-exports';
import { ApolloProvider } from "react-apollo";
import AWSAppSyncClient, { defaultDataIdFromObject } from "aws-appsync";
import { Rehydrated } from "aws-appsync-react";

import './App.css';

import AppRouter from './components/AppRouter';


// uses IAM and Cognito
const client = new AWSAppSyncClient({
  url: appSyncConfigCustom.aws_appsync_graphqlEndpoint,
  region: appSyncConfigCustom.aws_appsync_region,
  auth: {
    type: appSyncConfigCustom.aws_appsync_authenticationType,
// apiKey: appSyncConfig.aws_appsync_apiKey,
credentials: () => Auth.currentCredentials(),
  },
  cacheOptions: {
dataIdFromObject: (obj) => {
let id = defaultDataIdFromObject(obj);

if (!id) {
const { __typename: typename } = obj;
switch (typename) {
case 'Company':
  return `${typename}:${obj.id}`;
case 'Offer':
  return `${typename}:${obj.companyID}${obj.offerID}`;
case 'Order':
  return `${typename}:${obj.companyID}${obj.orderID}`;
case 'ReOrderRule':
  return `${typename}:${obj.companyID}${obj.reorderRuleID}`;
case 'Product':
  return `${typename}:${obj.id}`;
case 'BlockchainBlock':
  return `${typename}:${obj.userID}${obj.blockchainID}`;
case 'Deal':
  return `${typename}:${obj.productID}${obj.dealID}`;
case 'Notification':
  return `${typename}:${obj.companyID}${obj.notificationID}`;
default:
  const typ = `${typename}`;
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
      <Authenticator
        hideDefault={true}
        amplifyConfig={appSyncConfigCustom}
      >
        <AppRouter client={client}/>
      </Authenticator>
    </Rehydrated>
  </ApolloProvider>
);

export default WithProvider;