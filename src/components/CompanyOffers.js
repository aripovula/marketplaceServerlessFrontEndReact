import React, { Component } from "react";
import { graphql } from "react-apollo";

// import moment from 'moment';

import QueryGetCompany from "../graphQL/queryGetCompany";
import SubsriptionCompanyOffers from "../graphQL/subsriptionCompanyOffers";

import NewOffer from "./NewOffer";

class CompanyOffers extends Component {

    subscription;

    componentDidMount() {
        // this.subscription = this.props.subscribeToOffers();
        // console.log('this.subscription = ', this.subscription);
    }

    componentWillUnmount() {
        // this.subscription();
    }

    renderOffer = (offer) => {
        console.log('offer in renderOffer-', offer);
        
        return (
            <div className="offer" key={offer.offerID}>
                <div className="content">
                    <div className="text">
                        {offer.offerID}
                    </div>
                    <div className="metadata">{offer.price}</div>
                </div>
            </div>
        );
    }

    render() {
        const { offers: { items }, companyID } = this.props;
        console.log('render COffers props', this.props);
        if (this.props.data) console.log('ba=', this.props.data.getCompany ? this.props.data.getCompany.offers : { items: [] });
        
        return (
            <div className="margintop">
                <div className="item">
                    <div className="">
                        <h4 className="">Offers</h4>
                        {console.log('companyID=', companyID)}
                        {console.log('items=', items)}
                        {[].concat(items).sort((a, b) => a.offerID.localeCompare(b.offerID)).map(this.renderOffer)}
                        <NewOffer companyID={companyID} />
                        {/* */}
                    </div>
                </div>
            </div>
        );
    }
}

const CompanyOffersWithData = graphql(
    QueryGetCompany,
    {
        options: ({ companyID: id }) => ({
            fetchPolicy: 'cache-first',
            variables: { id }
        }),
        props: props => ({
            offers: props.data.getCompany ? props.data.getCompany.offers : { items: [] },
            subscribeToOffers: () => props.data.subscribeToMore({
                document: SubsriptionCompanyOffers,
                variables: {
                    companyID: props.ownProps.companyID,
                },
                updateQuery: (prev, { subscriptionData: { data: { onCreateOffer } } }) => {
                    const res = {
                        ...prev,
                        getCompany: {
                            ...prev.getCompany,
                            offers: {
                                __typename: 'OfferConnection',
                                ...prev.getCompany.offers,
                                items: [
                                    ...prev.getCompany.offers.items.filter(c => c.offerID !== onCreateOffer.offerID),
                                    onCreateOffer,
                                ]
                            }
                        }
                    };

                    return res;
                }
            })
        }),
    },
)(CompanyOffers);

export default CompanyOffersWithData;