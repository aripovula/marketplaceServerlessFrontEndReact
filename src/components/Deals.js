import React from 'react'


import { graphql, compose } from 'react-apollo'
// import ListDeals from '../graphQL/ListDeals'
import ListDeals from "../graphQL/queryAllDeals";
import QueryAllProducts from "../graphQL/queryAllProducts";
import NewDealSubscription from '../graphQL/subscriptionDeals';
import MarketDataTable from './MarketDataTable';

class Deals extends React.Component {
    
    dealSubscription;
    
    componentWillMount() {
        this.dealSubscription = this.props.subscribeToNewDeals();
    }

    componentWillUnmount() {
        // this.dealSubscription();
    }

    render() {
        console.log('props.deals', this.props.deals);

        const productsFromStore = this.props.client.readQuery({
            query: QueryAllProducts
        });

        
        return (
            <div className="">
                <MarketDataTable
                    numberColumnWidth='90'
                    fontSize='12'
                    deals={this.props.deals}
                    products={productsFromStore.listProducts.items}
                />
                {
                    this.props.deals.map((r, i) => (
                        <div key={i}>
                            <p>${r.dealPrice}-{r.dealQuantity}; CoId: {r.buyerID} Oid: {r.dealID} </p>
                        </div>
                    ))
                }
            </div>
        )
    }
}

// const styles = {
//     title: {
//         fontSize: 16
//     },
//     subtitle: {
//         fontSize: 14,
//         color: 'rgba(0, 0, 0, .5)'
//     },
//     deal: {
//         boxShadow: '2px 2px 5px rgba(0, 0, 0, .2)',
//         marginBottom: 7,
//         padding: 14,
//         border: '1px solid #ededed'
//     },
//     container: {
//         display: 'flex',
//         flexDirection: 'column',
//         paddingLeft: 100,
//         paddingRight: 100,
//         textAlign: 'left'
//     }
// }

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
                        console.log('onCreateDeal - ', onCreateDeal);
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
