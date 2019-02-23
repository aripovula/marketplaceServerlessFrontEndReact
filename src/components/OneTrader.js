import React, { Component } from 'react'
import Search from './Search';

export class OneTrader extends Component {
  render() {
    return (
      <div className="margintop">
        Onetrader
        <Search id='d20cde2e-b0a4-441b-a8be-5a31e0eb09e8' client={this.props.client} />
      </div>
    )
  }
}

export default OneTrader
