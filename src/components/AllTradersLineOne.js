import React, { Component } from 'react'
import AssemblingCompany from './AssemblingCompany';
import AssemblingCompany2 from './AssemblingCompany2';
import AssemblingCo from './AssemblingCo';
import { OrderStatus } from './OrderStatus';
import Search from './Search';
import PartsCompany from './PartsCompany';
import Notifications from './Notifications';

export class AllTradersLineOne extends Component {
  render() {
    return (
      <div id="top">
        <div id="container2top">
          <div id="left2">
            <AssemblingCo
              companyID= {this.props.companyBID} // "02ff9041-c352-4705-a2f0-7295e55886b5"
              companyName="Assembler Inc."
              client={this.props.client}
              limit={4}
              nextToken={null}
              isNewUser={this.props.isNewUser}
            />
          </div>

          <div id="right2">
            <PartsCompany id='165f7de9-21bc-4bd4-a9b9-01740aa74ad2' client={this.props.client} />
            {/*
            <AssemblingCo
              companyID="6e11abc1-5d3f-41f8-8167-32b1efb7edcf"
              companyName="Finisher Co."
              client={this.props.client}
              limit={4}
              nextToken={null}
            />*/}

          </div>
          {/*<div id="right2">
            <AssemblingCo
              companyID="5c1b9f1d-a7fe-4780-85ad-443d176a182d"
              companyName="Last Line Ltd."
              client={this.props.client}
              limit={4}
              nextToken={null}
            />
          </div>*/}
        </div>
        
        <div id="container2a">
          <div id="left2">
            <span className="smalltext">notifications & blockchain info:</span>
            <Notifications 
              client={this.props.client}
            />
          </div>
          {/*<div id="middle2">
            <span className="responsiveFSize2">notifications & blockchain info:</span>
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

export default AllTradersLineOne
