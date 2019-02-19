import React, { Component } from 'react'
import AssemblingCompany from './AssemblingCompany';
import { OrderStatus } from './OrderStatus';

export class AllTradersLineOne extends Component {
  render() {
    return (
      <div id="top">
        <div id="container2top">
          <div id="left2">
            <AssemblingCompany id='d20cde2e-b0a4-441b-a8be-5a31e0eb09e8' client={this.props.client} />
          </div>
          <div id="middle2">
            
          </div>
          <div id="right2">
            
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
