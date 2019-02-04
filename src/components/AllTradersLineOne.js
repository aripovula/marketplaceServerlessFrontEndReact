import React, { Component } from 'react'
import AssemblingCompany from './AssemblingCompany';

export class AllTradersLineOne extends Component {
  render() {
    return (
      <div id="top">
        <div id="container2top">
          <div id="left2">
            <AssemblingCompany id='d20cde2e-b0a4-441b-a8be-5a31e0eb09e8' client={this.props.client} />
          </div>
          <div id="middle2">
            UPPER-CENTER - Last Line Ltd.
          </div>
          <div id="right2">
            UPPER-RIGHT - Finisher Co.
          </div>
        </div>

        <div id="container2a">
          <div id="left2">
            blockChain part
          </div>
          <div id="middle2">
            blockChain part
          </div>
          <div id="right2">
            blockChain part
          </div>
        </div>

      </div>
    )
  }
}

export default AllTradersLineOne
