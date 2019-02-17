import React, { Component } from 'react'
import AllTradersLineOne from './AllTradersLineOne';
import AllTradersLineTwo from './AllTradersLineTwo';
import Deals from './Deals';
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
    console.log('props in AllT -', this.props);
    return (
      <div className="margintop" id="container">
          <div id="left">
            {/*2nd*/}
            <div>
              <div className="center"><i>Marketplace Board</i></div>
              <hr/>
              Deal prices &nbsp;
              <span className="responsiveFSize2">(last 2 days lowest / highest price)</span>
              <br/>
              <span
              className="addnlightbg notbold cursorpointer"
              data-tip="permanently deletes entry. You will be prompted to confirm"
              onClick={() => {
                this.setState(() => ({
                  shortText: 'New request',
                  mainText: "Request addition of new traded product"
                }));
              }}>request new product</span>
              &nbsp; &nbsp;
              <span className="responsiveFSize2">hover for more info</span>

            <Deals client={this.props.client}/>
            <span className="verIndent"></span>
            <span className="responsiveFSize2">Data exchange between each company takes place as an end-to-end communication (exclusively through AppSync based serverless back-end). None of companies exchange data locally.</span>
            <span className="responsiveFSize2">Please try opening this app at least in one another browser (better in another computer) logging in with the same user name and password to see how components communicate with each other.</span>
            <ModalProduct
              // selectedOption = {this.state.selectedOption}

              // companyID={id}
              client={this.props.client}
              mainText={this.state.mainText}
              shortText={this.state.shortText}
              handleModalCloseOptionSelected={this.handleModalCloseOptionSelected}
            />
            </div>
          </div>
  
          <div id="right">
            <AllTradersLineOne client={this.props.client}/>
            <AllTradersLineTwo client={this.props.client}/>

          </div>
          </div>
        )
  }
}

export default AllTrader
