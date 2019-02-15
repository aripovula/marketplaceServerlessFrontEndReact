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

// Amplify init
// Amplify.configure({
//   Auth: {
//     appSyncConfigCustom
//   }
// });


// const handleAuthStateChange = (authState) => {
//   if (authState === 'signedIn') {
//     isSignedIn = true;
//     /* Do something when the user has signed-in */
//     console.log('Logged IN');
//   } else {
//     isSignedIn = false;
//     console.log('Please Log IN');
//   }
// }


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
      <Authenticator
        hideDefault={true}
        // onStateChange={
        //   (authstate) => {
        //     console.log('state-', authstate);
        //     handleAuthStateChange(authstate)
        //   }
        // }
        amplifyConfig={appSyncConfigCustom}
      >
        <AppRouter client={client}/>
      </Authenticator>
    </Rehydrated>
  </ApolloProvider>
);

export default WithProvider;