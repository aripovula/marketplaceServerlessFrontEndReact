import React, { Component } from 'react'
import { Authenticator } from 'aws-amplify-react'; // or 'aws-amplify-react-native'
import appSyncConfig from "../aws-exports";

class AppWithAuth extends Component {
    render() {
        return (
            <div>
            <h1>Auth page</h1>
                <Authenticator
                    onStateChange={(authState) => console.log(authState)} 
                    amplifyConfig={appSyncConfig}
                >
                    <div>I am always here to show current auth state: {this.props.authState}</div>
                </Authenticator>
                {this.props.authState === 'signUp' &&
                    <div>
                        My Custom SignUp Component
          <button onClick={this.gotoSignIn}>Goto SignIn</button>
                    </div>
                }
            </div>
        );
    }
}

export default AppWithAuth;
