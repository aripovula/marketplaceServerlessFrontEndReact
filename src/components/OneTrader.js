import React, { Component } from 'react'
import Search from './Search';
import AssemblingCo from './AssemblingCo2';
import PartsCo from './PartsCo';

export class OneTrader extends Component {
  render() {
    return (
      <div className="margintop">
        Onetrader
        <Search id='d20cde2e-b0a4-441b-a8be-5a31e0eb09e8' client={this.props.client} />
        {/*<AssemblingCo
        // limit={10}
          companyID="d20cde2e-b0a4-441b-a8be-5a31e0eb09e8"
        client={this.props.client}
        // nextToken={null}
        />*/}

        <PartsCo
          companyID="b254c829-2bca-434c-96d3-41b9e140f004"
          limit={10}
          nextToken={null}
          client={this.props.client}
        />
      </div>
    )
  }
}

export default OneTrader
