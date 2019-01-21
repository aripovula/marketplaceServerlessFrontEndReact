import React, { Component } from "react";
import { graphql } from "react-apollo";

import moment from 'moment';

import QueryGetCompany from "../graphQL/queryGetCompany";
import QueryCompanyOffers from "../graphQL/queryCompanyOffers";
import SubsriptionCompanyOffers from "../graphQL/subsriptionCompanyOffers";

import NewOffer from "./NewOffer";

class CompanyOffers extends Component {

    subscription;

    componentDidMount() {
        this.subscription = this.props.subscribeToOffers();
    }

    componentWillUnmount() {
        this.subscription();
    }

    renderOffer = (offer) => {
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

        return (
            <div className="margintop">
                <div className="item">
                    <div className="">
                        <h4 className="">Offers</h4>
                        {console.log('companyID=', companyID)}
                        {console.log('items=', items)}
                        {[].concat(items).sort((a, b) => a.offerID.localeCompare(b.offerID)).map(this.renderOffer)}
                        <NewOffer companyID={companyID} />
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
                updateQuery: (prev, { subscriptionData: { data: { subscribeToCompanyOffers } } }) => {
                    const res = {
                        ...prev,
                        getCompany: {
                            ...prev.getCompany,
                            offers: {
                                __typename: 'OfferConnections',
                                ...prev.getCompany.offers,
                                items: [
                                    ...prev.getCompany.offers.items.filter(c => c.offerID !== subscribeToCompanyOffers.offerID),
                                    subscribeToCompanyOffers,
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