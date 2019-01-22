import React, { Component } from 'react'

export class LoginPage extends Component {

  checkClient() {
    // const { client } = this.props;
    console.log('props 11= ', this.props);
    console.log('client 11= ', this.props.client);

  }

  render() {
    return (
      <div className="margintop">
        Login Page
        {this.checkClient()}
      </div>
    )
  }
}

export default LoginPage
