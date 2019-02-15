import React, { Component } from 'react'
import Amplify, { Auth } from 'aws-amplify';

export class LoginPage extends Component {

  constructor(props) {
    super(props);
    this.tryLogin = this.tryLogin.bind(this);
    this.state = {
      userData: {
        username: 'component',
        password: 'Orchard1!'
      },
      isSignedIn: false
    }
  }

  tryLogin() {
      Auth.signIn({
        username: this.state.userData.username, 
        password: this.state.userData.password,
    }).then(user => {
      console.log('Wow', user)
      this.props.checkLoginStatus('Login');
    })
      .catch(err => {
        console.log('Wow', err);
        this.trySignUp();
      });
  }

  trySignUp() {
    Auth.signUp({
      'username': this.state.userData.username,
      'password': this.state.userData.password,
      'attributes': {
        'email': this.state.userData.username+'@example.com',
      }
    }).then(user => {
      console.log('WowSignUp', user)
      this.tryLogin();
    })
      .catch(err => {
        console.log('WowSignUp', err);
      });
  }

  handleChange(field, { target: { value } }) {
    const { userData } = this.state;
    userData[field] = value;
    this.setState({ userData });
    console.log('handleChange', this.state.userData);
  }

  render() {
    console.log('props LOGIN', this.props);
    return (
      <div className="card-4" >
        <div>
          <span className="verIndent"></span>
          <h4 className="is-active">
            <span className="horIndent"></span>
            Just click 'Login' button - demo version
                </h4>
        </div>

        <span className="horIndent" />
        <span className="postLineList">A random username and password were composed and will be signed up</span>
        <br /><span className="horIndent" />
        <span className="postLineList">programmatically with Amazon Cognito when you click 'Login'.</span>
        <br /><span className="horIndent" />
        <span className="postLineList">All data will be wiped off from DynamoDB as soon as you log out.</span>
        <br /><br />

        <div style={{ width: 300 }}>
          <span className="horIndent"></span>
          <input
            type="text"
            defaultValue={this.state.userData.username}
            autoComplete="off"
            placeholder="username"
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
          onClick={this.tryLogin}
        >Login</button>
        <br /><br />
      </div>
    )
  }
}

export default LoginPage
