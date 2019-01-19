import React, { Component } from 'react';
import AppRouter, { history } from './AppRouter';

import appSyncConfig from "./aws-exports";
import { ApolloProvider } from "react-apollo";
import AWSAppSyncClient, { defaultDataIdFromObject } from "aws-appsync";
import { Rehydrated } from "aws-appsync-react";

import './App.css';

const App = () => (
    <div className="App">
        <header>
            <AppRouter client={client} />
        </header>
    </div>
);

// class App extends Component {
//   render() {
//     return (
//       <div className="App">
//         <header>
//           <AppRouter/>
//         </header>
//       </div>
//     );
//   }
// }

const client = new AWSAppSyncClient({
    url: appSyncConfig.aws_appsync_graphqlEndpoint,
    region: appSyncConfig.aws_appsync_region,
    auth: {
        type: appSyncConfig.aws_appsync_authenticationType,
        apiKey: appSyncConfig.aws_appsync_apiKey,
    },
    cacheOptions: {
        dataIdFromObject: (obj) => {
            console.log("obj = ", obj);

            let id = defaultDataIdFromObject(obj);
            console.log("id 1 = ", id);
            if (!id) {
                const { __typename: typename } = obj;
                switch (typename) {
                    case 'Option':
                        console.log("coID = ", `${typename}:${obj.companyID}`);
                        return `${typename}:${obj.companyID}`;
                    default:
                        console.log("id 2 = ", id);
                        return id;
                }
            }
            console.log("id 3 = ", id);
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

