import React, { Component } from 'react'
import { PartsProducer } from './PartsProducer';

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
