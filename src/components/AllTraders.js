import React, { Component } from 'react'
import AllTradersLineOne from './AllTradersLineOne';
import AllTradersLineTwo from './AllTradersLineTwo';


export class AllTrader extends Component {
  render() {
    return (
      <div className="margintop" id="container">
          <div id="left">
            {/*2nd*/}
            <div>
              LeftColumn - market info
            </div>
          </div>
  
          <div id="right">
            <AllTradersLineOne />
            <AllTradersLineTwo />

          </div>
          </div>
        )
  }
}

export default AllTrader
