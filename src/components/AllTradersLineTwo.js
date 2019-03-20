import React, { Component } from 'react'
import PartsCompany from './PartsCompany';
import Notifications from './Notifications';

export class AllTradersLineTwo extends Component {
  render() {
    
    return (
      <div id="bottom">
        <div id="container2">
          <div id="left2">
            <PartsCompany id='29de327d-7d96-4e0f-a2cc-c46636d7bfaa' client={this.props.client} />
          </div>
          <div id="right2">
            <PartsCompany id='39b5c071-43c7-4de9-9abc-23a70df4cdc6' client={this.props.client} />
          </div>
        </div>

        <div id="container2a">
          <div id="left2">
            <span className="smalltext">notifications & blockchain info:</span>
            <Notifications
              client={this.props.client}
            />
          </div>
          <div id="right2">
            <span className="smalltext">notifications & blockchain info:</span>
            <Notifications
              client={this.props.client}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default AllTradersLineTwo
