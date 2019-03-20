import React from 'react'


import { graphql, compose } from 'react-apollo'
import ListDeals from "../graphQL/queryAllDeals";
import QueryAllProducts from "../graphQL/queryAllProducts";
import NewDealSubscription from '../graphQL/subscriptionDeals';
import ModalInfo from "./ModalInfo";

let dataPrev;

class Deals extends React.Component {
    
    dealSubscription;
    
    constructor(props) {
        super(props);
        this.state = {
            infoModalData: null
        };
        this.handleInfoModalClose = this.handleInfoModalClose.bind(this);
    }

    componentWillMount() {
        this.dealSubscription = this.props.subscribeToNewDeals();
    }

    componentWillUnmount() {
        // this.dealSubscription();
    }

    handleInfoModalClose() {
        this.setState({ infoModalData: null });
    }

    // prepared data for prices table
    generateData(currentDeals) {
        const dataTemp = [];
        currentDeals.map((deal) => {
            let isFound = false; let xF = -1;
            for (let x = 0; x < dataTemp.length; x++) {
                if (dataTemp[x].prodID === deal.productID) {
                    isFound = true; xF = x;
                }
            }
            if (isFound) {
                if (dataTemp[xF].lowPrice.price > deal.dealPrice) {
                    dataTemp[xF].lowPrice.price = deal.dealPrice;
                }
                if (dataTemp[xF].highPrice.price < deal.dealPrice) {
                    dataTemp[xF].highPrice.price = deal.dealPrice
                }                
            } else {
                let prodName = 'unknown';
                let productsFromStore;
                try {
                    productsFromStore = this.props.client.readQuery({
                        query: QueryAllProducts
                    });
                } catch(e) {
                    console.log('prodReadQueryError-', e);
                    productsFromStore = null;
                }

                if (productsFromStore && productsFromStore.listProducts && productsFromStore.listProducts.items) {
                    productsFromStore.listProducts.items.map((prod) => {
                        if (prod.id === deal.productID) prodName = prod.name + '-' + prod.modelNo;
                    });
                    const aDeal = {
                        prodID: deal.productID,
                        name: prodName,
                        lowPrice: {
                            price: deal.dealPrice,
                            direction: 0
                        },
                        highPrice: {
                            price: deal.dealPrice,
                            direction: 0
                        }
                    };
                    dataTemp.push(aDeal);
                }
            }
        });

        
        // determine whether price increased or decreased
        if (dataPrev) {
            for (let x = 0; x < dataTemp.length; x++) {
                let prevLow, prevHigh, prevDirLow, prevDirHigh;
                for (let y = 0; y < dataPrev.length; y++) {
                    if (dataPrev[y].prodID === dataTemp[x].prodID) {
                        prevLow = dataPrev[y].lowPrice.price;
                        prevDirLow = dataPrev[y].lowPrice.direction;
                        prevHigh = dataPrev[y].highPrice.price;
                        prevDirHigh = dataPrev[y].highPrice.direction;
                        if (dataTemp[x].lowPrice.price < prevLow) dataTemp[x].lowPrice.direction = -1;
                        if (dataTemp[x].lowPrice.price > prevLow) dataTemp[x].lowPrice.direction = 1;
                        if (dataTemp[x].lowPrice.price === prevLow) dataTemp[x].lowPrice.direction = prevDirLow;
                        if (dataTemp[x].highPrice.price > prevHigh) dataTemp[x].highPrice.direction = 1;
                        if (dataTemp[x].highPrice.price < prevHigh) dataTemp[x].highPrice.direction = -1;
                        if (dataTemp[x].highPrice.price === prevHigh) dataTemp[x].highPrice.direction = prevDirHigh;
                        break;
                    }
                }
            }
        }

        dataPrev = dataTemp;
        return dataTemp;
    }

    render() {
        console.log('Deals props', this.props);
        const tData = this.generateData(this.props.deals);


        return (
            <div className="">
                <table id="tableFM">
                    <tbody>
                        <tr>
                            <td align="center">item name</td>
                            <td align="center">lowest, $</td>
                            <td align="center">highest, $</td>
                        </tr>
                        {tData && tData.length === 0 &&
                            <tr>
                                <td align="center">( no deals )</td>
                                <td align="center">&nbsp;</td>
                                <td align="center">&nbsp;</td>
                            </tr>
                        }
                        {tData && [].concat(tData).sort((a, b) =>
                            a.name.localeCompare(b.name)).map((item) =>
                                <tr key={item.prodID}>
                                    <td>
                                        <span className="addnlightbg notbold cursorpointer"
                                            onClick={() => {
                                                this.setState(() => ({
                                                    infoModalData: {
                                                        type: 'prodSpec',
                                                        mainText: 'Product specification',
                                                        shortText: 'Product specification',
                                                        name: item.name,
                                                        model: '',
                                                    }
                                                }));
                                            }}            
                                            >&nbsp;{item.name}
                                        </span>
                                    </td>

                                    <td align="center">{item.lowPrice.price.toFixed(2)}&nbsp;
                                        {item.lowPrice.direction === 1 && <span style={{ color: '#ff2e00' }}>&#9650;</span>}
                                        {item.lowPrice.direction === 0 && <span style={{ color: '#ffbf00' }}>&#9656;</span>}
                                        {item.lowPrice.direction === -1 && <span style={{ color: '#57d500' }}>&#9660;</span>}
                                    </td>
                                    <td align="center">{item.highPrice.price.toFixed(2)}&nbsp;
                                        {item.highPrice.direction === 1 && <span style={{ color: '#ff2e00' }}>&#9650;</span>}
                                        {item.highPrice.direction === 0 && <span style={{ color: '#ffbf00' }}>&#9656;</span>}
                                        {item.highPrice.direction === -1 && <span style={{ color: '#57d500' }}>&#9660;</span>}

                                    </td>
                                </tr>
                            )}
                    </tbody>
                </table>
                {this.state.infoModalData &&
                    <ModalInfo
                        data={this.state.infoModalData}
                        handleInfoModalClose={this.handleInfoModalClose}
                    />
                }

            </div>
        )
    }
}


export default compose(
    graphql(ListDeals, {
        options: {
            fetchPolicy: 'cache-and-network'
        },
        props: props => ({
            deals: props.data.listDeals ? props.data.listDeals.items : [],
            subscribeToNewDeals: params => {
                props.data.subscribeToMore({
                    document: NewDealSubscription,
                    updateQuery: (prev, { subscriptionData: { data: { onCreateDeal } } }) => {
                        return {
                            ...prev,
                            listDeals: {
                                __typename: 'DealConnection',
                                items: [onCreateDeal, ...prev.listDeals.items.filter(deal => deal.dealID !== onCreateDeal.dealID)]
                            }
                        }
                    }
                })
            }
        })
    })
)(Deals)
