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
      shortText: undefined,
      showGuide: false
    };
    this.handleModalCloseOptionSelected = this.handleModalCloseOptionSelected.bind(this);
  }

  handleModalCloseOptionSelected = () => {
    this.setState(() => ({ mainText: undefined }));
  }

  render() {
    return (
      <div className="margintop" id="container">
          <div id="left">
            <div>
              <div className="center"><i>Marketplace Board</i></div>
              <hr/>
              Deal prices &nbsp;
              <span className="smalltext">(days lowest / highest prices)</span>
              <span className="horIndent"></span>
              <span
              className="addnlightbg notbold cursorpointer"
              onClick={() => {
                this.setState(() => ({
                  shortText: 'New request',
                  mainText: "Request addition of new traded product"
                }));
              }}>request new product</span>

            <Deals client={this.props.client}/>
            <span className="verIndent"></span><span className="verIndent"></span>
            <span className="responsiveFSize2">Data exchange between each company takes place as an end-to-end communication (through AppSync based serverless back-end).</span>
            
            <br /><br />
            <span className="addnlightbg notbold cursorpointer" onClick={() => {
              this.setState(() => ({ showGuide: !this.state.showGuide })) 
              setTimeout(() => { this.setState(() => ({ showGuide: !this.state.showGuide })) }, 3 * 60 * 1000)
            }}>{this.state.showGuide ? '( hide info and guide )' : '( show more info and guide )'}</span>
            {this.state.showGuide &&
              <div>
                <span className="verIndent"></span>
                <span className="responsiveFSize2b">All four companies are separate legal entities. Assembler Inc. is the only ordering / purchasing co. All other three are suppliers offering their goods. In this demo app ( unlike in real life ) you can access user interface of all four companies.</span>
                <span className="verIndent"></span>
                <span className="responsiveFSize2b">When order is placed (by Assembler Inc.) DynamoDB record triggers Lambda function. This function (1) gets info on offered products by all companies, (2) selects best offer, (3) records Deal data in DealTable in DynamoDB, (4) amends Available products on OffersTable, (5) changes status of order in OrderTable and (6) triggers a new notification with blockchain block. Since front end app is subscribed to changes on OfferTable, OrderTable and NotificationTable and since steps (4), (5) and (6) are done THROUGH AppSync front end app gets data from AppSync and updates table data in the app. Please see Lambda function for details. Link is provided in 'Link to source' page.</span>
                <span className="verIndent"></span>
                <span className="responsiveFSize2b">- You can add a new re-order rule (please select 're-order rule' and not 'one-off order' inside of pop-up modal). Then click on green triangle. It starts auto-re-orders.</span>
                <span className="verIndent"></span>
                <span className="responsiveFSize2b">- You can add a new product. A notification should appear on top of each company section ( not like other notifications ).</span>
                <span className="verIndent"></span>
                <span className="responsiveFSize2b">- You can open this app in another browser or computer to see how components communicate with each other. For this click 'Show username' next to Logout button and copy username.</span>
              </div>
            }
      
            { this.state.showGuide &&
              <span className="addnlightbg notbold cursorpointer" onClick={() => { this.setState(() => ({ showGuide: !this.state.showGuide })) }}><br />( hide info and guide )<br/><br/></span>
            }
            
            <ModalProduct
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
              // companyBID={this.props.companyBID}
              isNewUser={this.props.isNewUser}
            />
            <AllTradersLineTwo client={this.props.client}/>

          </div>
          </div>
        )
  }
}

export default AllTrader
