import React, { Component } from 'react'
import Search from './Search';
import AssemblingCo from './AssemblingCo';

export class OneTrader extends Component {
  render() {
    return (
      <div className="margintop">
        Onetrader
        <Search id='d20cde2e-b0a4-441b-a8be-5a31e0eb09e8' client={this.props.client} />
        <AssemblingCo
        limit={4}
        companyID='6e11abc1-5d3f-41f8-8167-32b1efb7edcf'
        client={this.props.client}
        nextToken={null}
        />
      </div>
    )
  }
}

export default OneTrader
