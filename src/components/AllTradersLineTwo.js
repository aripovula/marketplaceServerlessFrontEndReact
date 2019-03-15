import React, { Component } from 'react'
import PartsCompany from './PartsCompany';
import Notifications from './Notifications';

export class AllTradersLineTwo extends Component {
  render() {
    console.log('props in TWO2 -', this.props);
    
    return (
      <div id="bottom">
        <div id="container2">
          <div id="left2">
            <PartsCompany id='29de327d-7d96-4e0f-a2cc-c46636d7bfaa' client={this.props.client} />
          </div>
          {/*<div id="middle2">
            <PartsCompany id='653fbaef-9655-4ec6-a1e4-f0073cd78c8b' client={this.props.client}/>
          </div>*/}
          <div id="right2">
            {/*<PartsCompany id='fef3f8e7-ef6f-4309-a80c-9781bb4ea7f0' client={this.props.client} />*/}
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
          {/*<div id="middle2">
            <Notifications/>
        </div>*/}
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
