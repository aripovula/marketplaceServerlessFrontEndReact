import React, { Component } from 'react'
import AssemblingCompany from './AssemblingCompany';
import AssemblingCompany2 from './AssemblingCompany2';
import AssemblingCo from './AssemblingCo';
import { OrderStatus } from './OrderStatus';
import Search from './Search';
import PartsCompany from './PartsCompany';

export class AllTradersLineOne extends Component {
  render() {
    return (
      <div id="top">
        <div id="container2top">
          <div id="left2">
            <AssemblingCo
              companyID="d20cde2e-b0a4-441b-a8be-5a31e0eb09e8"
              companyName="Assembler Inc."
              client={this.props.client}
              limit={4}
              nextToken={null}
            />
          </div>

          <div id="middle2">
            <PartsCompany id='fef3f8e7-ef6f-4309-a80c-9781bb4ea7f0' client={this.props.client} />
            {/*
            <AssemblingCo
              companyID="6e11abc1-5d3f-41f8-8167-32b1efb7edcf"
              companyName="Finisher Co."
              client={this.props.client}
              limit={4}
              nextToken={null}
            />*/}

          </div>
          <div id="right2">
            {/*<AssemblingCo
              companyID="5c1b9f1d-a7fe-4780-85ad-443d176a182d"
              companyName="Last Line Ltd."
              client={this.props.client}
              limit={4}
              nextToken={null}
            /> */}    
          </div>
        </div>
        
        <div id="container2a">
          <div id="left2">
            <span className="responsiveFSize2">notifications & blockchain info:</span>
          </div>
          <div id="middle2">
            <span className="responsiveFSize2">notifications & blockchain info:</span>
          </div>
          <div id="right2">
            <span className="responsiveFSize2">notifications & blockchain info:</span>
          </div>
        </div>

      </div>
    )
  }
}

export default AllTradersLineOne
