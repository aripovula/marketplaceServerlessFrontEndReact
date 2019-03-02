import React, { Component } from 'react'
import AssemblingCompany from './AssemblingCompany';
import AssemblingCompany2 from './AssemblingCompany2';
import AssemblingCo from './AssemblingCo';
import { OrderStatus } from './OrderStatus';
import Search from './Search';

export class AllTradersLineOne extends Component {
  render() {
    return (
      <div id="top">
        <div id="container2top">
          <div id="left2">
            <AssemblingCompany id='d20cde2e-b0a4-441b-a8be-5a31e0eb09e8' client={this.props.client} />
          </div>
          <div id="middle2">
            {/*<AssemblingCompany2 id='6e11abc1-5d3f-41f8-8167-32b1efb7edcf' client={this.props.client} />*/}
          </div>
          <div id="right2">
            <AssemblingCo
              companyID="6e11abc1-5d3f-41f8-8167-32b1efb7edcf"
              companyName="Finisher Ltd."
              client={this.props.client}
              limit={4}
              nextToken={null}
            />
            
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
