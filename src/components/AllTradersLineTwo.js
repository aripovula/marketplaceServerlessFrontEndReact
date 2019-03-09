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
            <PartsCompany id='b254c829-2bca-434c-96d3-41b9e140f004' client={this.props.client} />
          </div>
          {/*<div id="middle2">
            <PartsCompany id='653fbaef-9655-4ec6-a1e4-f0073cd78c8b' client={this.props.client}/>
          </div>*/}
          <div id="right2">
            {/*<PartsCompany id='fef3f8e7-ef6f-4309-a80c-9781bb4ea7f0' client={this.props.client} />*/}
            <PartsCompany id='653fbaef-9655-4ec6-a1e4-f0073cd78c8b' client={this.props.client} />
          </div>
        </div>

        <div id="container2a">
          <div id="left2">
            <Notifications/>
          </div>
          {/*<div id="middle2">
            <Notifications/>
        </div>*/}
          <div id="right2">
            <span className="responsiveFSize2">notifications & blockchain info:</span>
          </div>
        </div>

      </div>
    )
  }
}

export default AllTradersLineTwo
