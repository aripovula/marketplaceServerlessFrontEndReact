import React from 'react';
import ReactTable from "react-table";
import { render } from "react-dom";
import numeral from 'numeral';
import "react-table/react-table.css";

import ModalInfo from "./ModalInfo";

// local imports
// import { selectFinancialData } from '../selectors/financialData';
// import { Tips } from "../utils/tableUtils";
// import { setStartDate, setEndDate } from '../actions/filters';

// let date = new Date();
// const pydate = moment().subtract(1, 'years').endOf('year');
let dataPrev;

class MarketDataTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // reportDate2: ' pick report date',
            classNameLeft: "left",
            classNameRight: "right",
            classNameCenter: "center",
            nameColumnWidth: parseInt(this.props.nameColumnWidth),
            numberColumnWidth: parseInt(this.props.numberColumnWidth),
            fontSize: parseInt(this.props.fontSize),
            isDataSelectionEnabled: (this.props.isDataSelectionEnabled == 'true'),
            // isFullDateFormat: (this.props.isFullDateFormat == 'true'),
            infoModalData: null
        };
        //{this.props.dispatch(setEndDate(moment()))}
        this.handleInfoModalClose = this.handleInfoModalClose.bind(this);
    }

    // processReportDateChange(date) {
    //     this.setState({
    //         reportDate2: this.state.reportDate2 == ' pick report date' ? 'pick report date' : ' pick report date'
    //     }, () => {
    //         this.props.dispatch(setEndDate(moment(date)));
    //         this.props.dispatch(setStartDate(moment(pydate)));
    //     });
    // }

    handleInfoModalClose() {
        this.setState({ infoModalData: null });
    }


    render() {
        // const dataTemp = this.props.financialData;
        // console.log('postingsInFinStatementUpdated Render DATA');
        console.log('mTable props - ', this.props);
        // console.log('data prev');
        // console.log(dataPrev);
        // console.log('BEFORE CallinG findUpdatedOnes');
        // const data = dataPrev != null ? this.findUpdatedOnes(dataTemp, dataPrev) : dataTemp;
        // dataPrev = dataTemp;
        // const data = [{
        //     name: 'Tanner - T232',
        //     lowPrice: {
        //         price: 12345,
        //         direction: 1
        //     },
        //     highPrice: {
        //         price: 12345,
        //         direction: -1
        //     }
        // }, {
        //     name: 'Banner - B232',
        //     lowPrice: {
        //         price: 12345,
        //         direction: -1
        //     },
        //     highPrice: {
        //         price: 12345,
        //         direction: 1
        //     }
        // }]


        const data = [];
        this.props.deals.map((deal) => {
            let isFound = false; let xF =-1;
            for (let x = 0; x < data.length; x++) {
                if (data[x].prodID === deal.productID) {
                    isFound = true; xF = x;
                }
            }
             
            if (isFound) {
                if (data[xF].lowPrice.price > deal.dealPrice) {
                    data[xF].lowPrice.price = deal.dealPrice
                }
                if (data[xF].highPrice.price < deal.dealPrice) {
                    data[xF].highPrice.price = deal.dealPrice
                }
            } else {                
                let prodName = 'unknown';
                this.props.products.map((prod) => {
                    console.log('mTable ', prod.id, deal.productID);
                    
                    if (prod.id === deal.productID) prodName = prod.name + '-' + prod.modelNo;
                });
                const aDeal = {
                    prodID: deal.productID,
                    name: prodName,
                    lowPrice: {
                        price: deal.dealPrice,
                        direction: -1
                    },
                    highPrice: {
                        price: deal.dealPrice,
                        direction: 1
                    }
                };
                data.push(aDeal);
            }            
        });

        const columns = [{
            Header: 'item name',
            accessor: 'name', // String-based value accessors!
            className: this.state.classNameLeft,
            // width: this.state.nameColumnWidth,
            Cell: props => <span
                style={{
                    // width: "40%",
                    // backgroundColor: "#dadada",
                    // borderRadius: "2px"
                }}
                onClick={() => {
                    this.setState(() => ({
                        infoModalData: {
                            mainText: 'Product specification',
                            shortText: 'Product specification',
                            name: props.value,
                            model: '',
                        }
                    }));
                }}            // className='number'
                className="addnlightbg notbold cursorpointer"
            >{props.value}</span>
        }, {
            Header: 'lowest, $',
            accessor: 'lowPrice',
            className: this.state.classNameCenter,
            width: this.state.numberColumnWidth,
            Cell: row => (<span
                className="responsiveFSize2"
                style={{
                    // width: "28%",
                    // backgroundColor: "#dadada",
                    // borderRadius: "2px"
                }}
            >{' ' + numeral(row.value.price).format('000,000')}&nbsp;&nbsp;
                {row.value.direction == 1 && <span style={{
                    color: '#ff2e00',
                    transition: 'all .3s ease'
                }}>
                    &#9650;
                  </span>}

                {row.value.direction == 0 && <span style={{
                    color: '#ffbf00',
                    transition: 'all .3s ease'
                }}>
                    &#9656;
                  </span>}

                {row.value.direction == -1 && <span style={{
                    color: '#57d500',
                    transition: 'all .3s ease'
                }}>
                    &#9660;
                  </span>}

            </span>) // Custom cell components!
        }, {
            Header: 'highest, $',
            accessor: 'highPrice',
            className: this.state.classNameCenter,
            width: this.state.numberColumnWidth,
                Cell: row => (<span
                    className="responsiveFSize2"
                    style={{
                        // width: "28%",
                        // backgroundColor: "#dadada",
                        // borderRadius: "2px"
                    }}
                >{' ' + numeral(row.value.price).format('000,000')}&nbsp;&nbsp;
                    {row.value.direction == 1 && <span style={{
                        color: '#ff2e00',
                        transition: 'all .3s ease'
                    }}>
                        &#9650;
                  </span>}

                    {row.value.direction == 0 && <span style={{
                        color: '#ffbf00',
                        transition: 'all .3s ease'
                    }}>
                        &#9656;
                  </span>}

                    {row.value.direction == -1 && <span style={{
                        color: '#57d500',
                        transition: 'all .3s ease'
                    }}>
                        &#9660;
                  </span>}
                </span>) // Custom cell components!
        }]

        return <div style={{ fontSize: this.state.fontSize }}>
        
        <ReactTable
            data={data}
            columns={columns}
            showPagination={false}
            defaultPageSize={data.length }
            className="-striped -highlight"

        />
            {this.state.infoModalData &&
                <ModalInfo
                    data={this.state.infoModalData}
                    handleInfoModalClose={this.handleInfoModalClose}
                />
            }
        </div>
    }
    

    findUpdatedOnes = (dataTemp, dataPrev) => {
        // console.log('findUpdatedOnes dataTemp='+dataTemp.length+' dataPrev='+dataPrev.length);
        // console.log(dataTemp);
        if (dataTemp != null && dataPrev != null) {
            // console.log('findUpdatedOnes 2');
            for (let x = 0; x < dataTemp.length; x++) {
                let tempItem = dataTemp[x];
                // console.log('tempItem');
                // console.log(tempItem);
                //for (let y = 0; y < dataPrev.length; y++) {
                let y = tempItem.TBLineItemsID - 1;
                // console.log(y);
                let prevItem = dataPrev[y];
                // console.log(tempItem.TBLineItems.lineItem + ' - ' + prevItem.TBLineItems.lineItem);
                if (tempItem.TBLineItems.lineItem === prevItem.TBLineItems.lineItem) {
                    //console.log(tempItem.amounts_current.balance+ ' - '+ prevItem.amounts_current.balance);
                    if (tempItem.amounts_current.balance != prevItem.amounts_current.balance) {
                        dataTemp[x].TBLineItems.isUpdated = true;
                        dataTemp[x].amounts_current.isUpdated = true;
                        dataTemp[x].amounts_comparatives.isUpdated = true;
                    }
                }
            }
        }
        return dataTemp;
    }
}


export default MarketDataTable;
