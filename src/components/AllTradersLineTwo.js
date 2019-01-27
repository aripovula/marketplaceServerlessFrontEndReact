import React, { Component } from 'react'
import { PartsProducer } from './PartsProducer';
import CompanyOffersTable from './CompanyOffersTable';
// import { ViewCompanyOffers } from './ViewCompanyWithData';

export class AllTradersLineTwo extends Component {
  render() {
    console.log('props in TWO2 -', this.props);
    
    return (
      <div id="bottom">
        <div id="container2">
          <div id="left2">
            <span className="responsiveFSize">Components Ltd. - products offered:</span><br/>
            <PartsProducer/>
          </div>
          <div id="middle2">
            <CompanyOffersTable id='653fbaef-9655-4ec6-a1e4-f0073cd78c8b' client={this.props.client}/>
          </div>
          <div id="right2">
            Parts LLC
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

export default AllTradersLineTwo
