import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Amplify, { Auth } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
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

// Amplify init
Amplify.configure({
  Auth: {

    // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
    identityPoolId: 'us-east-1:76c25d29-c711-4548-98c1-c168faa890ff',

    // REQUIRED - Amazon Cognito Region
    region: 'us-east-1',

    // OPTIONAL - Amazon Cognito Federated Identity Pool Region 
    // Required only if it's different from Amazon Cognito Region
    identityPoolRegion: 'us-east-1',

    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: 'us-east-1_BfCOXB7tr',

    // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: '7d8m9a4koeqv1shkpro8f5lqif',

    // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
    mandatorySignIn: true,

  }
});

// const signIn = async (username, password) => {
// try {
//   const user = await Auth.signIn(username, password);
//   if (user.challengeName === 'SMS_MFA' ||
//     user.challengeName === 'SOFTWARE_TOKEN_MFA') {
//     // You need to get the code from the UI inputs
//     // and then trigger the following function with a button click

//   } else if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
//     const { requiredAttributes } = user.challengeParam; // the array of required attributes, e.g ['email', 'phone_number']
//     // You need to get the new password and required attributes from the UI inputs
//     // and then trigger the following function with a button click
//     // For example, the email and phone_number are required attributes
//   } else if (user.challengeName === 'MFA_SETUP') {
//     // This happens when the MFA method is TOTP
//     // The user needs to setup the TOTP before using it
//     // More info please check the Enabling MFA part
//     Auth.setupTOTP(user);
//   } else {
//     // The user directly signs in
//     console.log(user)
//   }
// } catch (err) {
//   if (err.code === 'UserNotConfirmedException') {
//     // The error happens if the user didn't finish the confirmation step when signing up
//     // In this case you need to resend the code and confirm the user
//     // About how to resend the code and confirm the user, please check the signUp part
//   } else if (err.code === 'PasswordResetRequiredException') {
//     // The error happens when the password is reset in the Cognito console
//     // In this case you need to call forgotPassword to reset the password
//     // Please check the Forgot Password part.
//   } else {
//     console.log(err);
//   }
// }
// }

// For advanced usage
// You can pass an object which has the username, password and validationData which is sent to a PreAuthentication Lambda trigger
Auth.signIn({
  username: "component", // Required, the username
  password: "Orchard1!", // Optional, the password
}).then(user => console.log('Wow', user))
  .catch(err => console.log('Wow', err));

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

const AppWithAuth = withAuthenticator(App, true);

const WithProvider = () => (
  <ApolloProvider client={client}>
    <Rehydrated>
      <App />
    </Rehydrated>
  </ApolloProvider>
);

export default WithProvider;