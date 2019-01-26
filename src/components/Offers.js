import React from 'react'


import { graphql, compose } from 'react-apollo'
import ListOffers from '../graphQL/ListOffers'
import NewOfferSubscription from '../graphQL/NewOfferSubscription'

class Offers extends React.Component {
    
    subscription;
    
    componentWillMount() {
        this.subscription = this.props.subscribeToNewOffers();
    }

    componentWillUnmount() {
        this.subscription();
    }

    render() {
        return (
            <div className="">
                <h3>Offers</h3>
                {
                    this.props.offers.map((r, i) => (
                        <div key={i}>
                            <p>CoId: {r.companyID} Oid: {r.offerID} ${r.price} Av: {r.available} USD</p>
                        </div>
                    ))
                }
            </div>
        )
    }
}

const styles = {
    title: {
        fontSize: 16
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(0, 0, 0, .5)'
    },
    offer: {
        boxShadow: '2px 2px 5px rgba(0, 0, 0, .2)',
        marginBottom: 7,
        padding: 14,
        border: '1px solid #ededed'
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        paddingLeft: 100,
        paddingRight: 100,
        textAlign: 'left'
    }
}

export default compose(
    graphql(ListOffers, {
        options: {
            fetchPolicy: 'cache-and-network'
        },
        props: props => ({
            offers: props.data.listOffers ? props.data.listOffers.items : [],
            subscribeToNewOffers: params => {
                props.data.subscribeToMore({
                    document: NewOfferSubscription,
                    updateQuery: (prev, { subscriptionData: { data: { onCreateOffer } } }) => {
                        return {
                            ...prev,
                            listOffers: {
                                __typename: 'OfferConnection',
                                items: [onCreateOffer, ...prev.listOffers.items.filter(offer => offer.offerID !== onCreateOffer.id)]
                            }
                        }
                    }
                })
            }
        })
    })
)(Offers)
