import React, { Component } from 'react'
import AssemblingCo from './AssemblingCo';
import PartsCompany from './PartsCompany';
import Notifications from './Notifications';
import UsersCompanyContext from '../context/UsersCompanyContext'

export class AllTradersLineOne extends Component {
  static contextType = UsersCompanyContext;
  render() {
    console.log('{this.context}=', this.context);
    
    return (
      <div id="top">
        <div id="container2top">
          <div id="left2">
            <AssemblingCo
              companyID={this.context} // {this.props.companyBID}
              companyName="Assembler Inc."
              client={this.props.client}
              limit={4}
              nextToken={null}
              isNewUser={this.props.isNewUser}
            />
          </div>

          <div id="right2">
            <PartsCompany id='165f7de9-21bc-4bd4-a9b9-01740aa74ad2' client={this.props.client} />
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

export default AllTradersLineOne
