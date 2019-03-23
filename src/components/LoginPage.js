import React, { Component } from 'react';
import Amplify, { Auth } from 'aws-amplify';

import { v4 as uuid } from "uuid";
import Loader from 'react-loader-spinner';

export class LoginPage extends Component {

  constructor(props) {
    super(props);
    this.tryLogin = this.tryLogin.bind(this);
    this.trySignUp = this.trySignUp.bind(this);
    this.state = {
      userData: {
        username: uuid(),
        password: 'Orchard1!'
      },
      isSignedIn: false,
      loading: false
    }
  }

  tryLogin(type) {
    this.setState({ loading: true });
    Auth.signIn({
        username: this.state.userData.username, 
        password: this.state.userData.password,
    })
    .then(user => {
      console.log('User', user)
      this.setState({loading: false});
      this.props.checkLoginStatus(type);
    })
    .catch(err => {
        console.log('User', err);
        this.setState({ loading: false });
        // this.trySignUp();
    });
  }

  trySignUp() {
    this.setState({ loading: true });
    Auth.signUp({
      'username': this.state.userData.username,
      'password': this.state.userData.password,
      'attributes': {
        'email': this.state.userData.username+'@example.com',
      }
    }).then(user => {
      console.log('UserSignUp', user)
      // this.props.checkLoginStatus('Signup');
      this.tryLogin('Signup');
    })
      .catch(err => {
        console.log('UserSignUp', err);
        alert('Could not sign up !')
      });
  }

  handleChange(field, { target: { value } }) {
    const { userData } = this.state;
    userData[field] = value;
    this.setState({ userData });
  }

  render() {
    console.log('props LOGIN', this.props);
    return (
      <div style={{ marginLeft: 30 }}>        
        <h3>
          <span className="horIndent" />
        Niche marketplace - supply chain</h3>
        <div id="containerLogin">
          <div id="leftLogin">
            <span className="horIndent" />
            <img alt="" src={require('../assets/GQLAppSync.png')} height="160px;"/>
        </div>
          <div id="rightLogin">

            <img alt="" src={require('../assets/lambda-pre-sign-up.png')} height="160px;"/>
          </div>
        </div>
        
        <div id="containerLogin">
          <div id="leftLogin">
          <span className="verIndent"></span>
          <h4 className="is-active">
            <span className="horIndent"></span>
            Just click 'Login' button - demo version
                </h4>
        <span className="horIndent" />
            <span className="smalltable">A random username will be used to sign up programmatically with Cognito</span>
        <br/><span className="horIndent" />
            <span className="smalltable"> when you click 'Login'. Changing standard password is optional.</span>

         </div>
          <div id="rightLogin">
            <span className="verIndent"></span>
            <h4 className="is-active">
              <span className="horIndent"></span>
              Subscriptions work and update data
                </h4>
            <span className="horIndent" />
            <span className="smalltable">You can open this app in another browser or computer to see it working.</span>
            <br /><span className="horIndent" />
            <span className="smalltable">Login, click 'Show username', copy and paste below in another browser</span>
            {this.state.loading && <div><br/><br/><Loader
              type="CradleLoader"
              color="#00BFFF"
              height="100"
              width="100"
            /></div>}

          </div>
        </div>

        <div id="containerLogin">
          <div id="leftLogin">
            <div className="card-4">
        <br/>
        <div style={{ width: 300 }}>
          <span className="horIndent"></span>
          <input
            type="text"
            defaultValue={this.state.userData.username}
            autoComplete="off"
            placeholder="username"
            onChange={this.handleChange.bind(this, 'username')}
            disabled
          /></div>


        <div style={{ width: 300 }}>
          <span className="horIndent"></span>
          <input
            type="password"
            defaultValue={this.state.userData.password}
            autoComplete="off"
            placeholder="password"
            onChange={this.handleChange.bind(this, 'password')}
          /></div>

        <br />
        <span className="horIndent"></span>
        <button
          className="button button1"
          onClick={this.trySignUp}
        >First time Login</button>
              <br />
              <br />
        </div>
            <span className="smalltext">* by default Cognito requires sign-up verification. </span><br/>
            <span className="smalltext">&nbsp;&nbsp;Pre sign-up lambda eliminates this need in this demo version.</span>
          </div>
          <div id="rightLogin">
            <div className="card-4">
        <br />
        <div style={{ width: 300 }}>
          <span className="horIndent"></span>
          <input
            type="text"
            autoComplete="off"
            placeholder="paste username"
            onChange={this.handleChange.bind(this, 'username')}
          /></div>


        <div style={{ width: 300 }}>
          <span className="horIndent"></span>
          <input
            type="password"
            defaultValue={this.state.userData.password}
            autoComplete="off"
            placeholder="password"
            onChange={this.handleChange.bind(this, 'password')}
          /></div>

        <br />
        <span className="horIndent"></span>
        <button
          className="button button1"
          onClick={() => this.tryLogin('Login')}
        >Login with copied username</button>
        <br /><br />
      </div>
      <br/>
      </div>
      </div>
      </div>
    )
  }
}

export default LoginPage
