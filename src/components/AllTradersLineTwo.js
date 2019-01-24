import React, { Component } from 'react'
import { PartsProducer } from './PartsProducer';
import CompanyOffersTable from './CompanyOffersTable';
// import { ViewCompanyOffers } from './ViewCompanyWithData';

export class AllTradersLineTwo extends Component {
  render() {
    return (
      <div id="bottom">
        <div id="container2">
          <div id="left2">
            <span className="responsiveFSize">Components Ltd. - products offered:</span><br/>
            <PartsProducer/>
          </div>
          <div id="middle2">
            Fittings Co.
            <CompanyOffersTable id='bb1'/>
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
