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
              <span className="smalltext">(days lowest / highest prices)</span>
              <span className="horIndent"></span>
              <span
              className="addnlightbg notbold cursorpointer"
              data-tip="permanently deletes entry. You will be prompted to confirm"
              onClick={() => {
                this.setState(() => ({
                  shortText: 'New request',
                  mainText: "Request addition of new traded product"
                }));
              }}>request new product</span>

            <Deals client={this.props.client}/>
            <span className="verIndent"></span><span className="verIndent"></span>
            <span className="responsiveFSize2">Data exchange between each company takes place as an end-to-end communication (through AppSync based serverless back-end).</span>
            <span className="verIndent"></span>
            <span className="responsiveFSize2">When order is placed DynamoDB record triggers Lambda function. This function (1) gets info on offered products by all companies, (2) selects best offer, (3) records Deal data in DealTable in DynamoDB, (4) amends Available products on OffersTable, (5) changes status of order in OrderTable and (6) triggers a new notification with blockchain block. Since front end app is subscribed to changes on OfferTable, OrderTable and NotificationTable when steps (4), (5) and (6) take place front end app gets data from AppSync and updates table data in the app.</span>
            <span className="verIndent"></span>
            <span className="responsiveFSize2">- You can add a new re-order rule (please select 're-order rule' and not 'one-off order'). Then click on green triangle. It starts auto-re-orders.</span>
            <span className="verIndent"></span>
            <span className="responsiveFSize2">- You can open this app in another browser or computer to see how components communicate with each other. For this click 'Show username' next to Logout button and copy username.</span>
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
            <AllTradersLineOne
              client={this.props.client} 
              companyBID={this.props.companyBID}
              isNewUser={this.props.isNewUser}
            />
            <AllTradersLineTwo client={this.props.client}/>

          </div>
          </div>
        )
  }
}

export default AllTrader
