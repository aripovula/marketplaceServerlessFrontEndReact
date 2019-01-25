import React, { Component } from 'react'
import AllTradersLineOne from './AllTradersLineOne';
import AllTradersLineTwo from './AllTradersLineTwo';
import Offers from './Offers';
import ModalProduct from './ModalProduct';


export class AllTrader extends Component {

  constructor(props) {
    super(props);

    this.state = {
      mainText: undefined,
      shortText: undefined
    };
    this.handleModalCloseOptionSelected = this.handleModalCloseOptionSelected.bind(this);
  }

  handleModalCloseOptionSelected = () => {
    this.setState(() => ({ mainText: undefined }));
    console.log('HHHHHHH mainText ', this.state.mainText);
  }

  render() {
    return (
      <div className="margintop" id="container">
          <div id="left">
            {/*2nd*/}
            <div>
              Market info &nbsp;  &nbsp;
              <span
              className="addnlightbg notbold cursorpointer"
              data-tip="permanently deletes entry. You will be prompted to confirm"
              onClick={() => {
                this.setState(() => ({
                  shortText: 'New request',
                  mainText: "Request addition of new traded product"
                }));
              }}>request new product</span>
            <br/>
            <span className="responsiveFSize2">to obtain info click product name</span>

            <ModalProduct
              // selectedOption = {this.state.selectedOption}

              // companyID={id}
              mainText={this.state.mainText}
              shortText={this.state.shortText}
              handleModalCloseOptionSelected={this.handleModalCloseOptionSelected}
            />
              
              <Offers/>
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
