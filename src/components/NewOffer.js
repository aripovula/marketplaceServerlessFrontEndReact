import React, { Component } from "react";
import { Link } from "react-router-dom";

import { v4 as uuid } from "uuid";
import { graphql } from "react-apollo";
import QueryAllOffers from "../graphQL/queryAllOffers";
import QueryGetOffer from "../graphQL/queryGetOffer";
import MutationCreateOffer from "../graphQL/mutationAddOffer";

class NewOffer extends Component {

    static defaultProps = {
        createOffer: () => null,
    }

    state = {
        offer: {
            companyID: '', // to add - get Co ID when Co is defined
            offerID: '',
            productID: '', // to add - get product ID when product is defined
            modelNo: '',
            price: 0,
            available: 0
        }
    };

    handleChange(field, { target: { value } }) {
        const { offer } = this.state;
        offer[field] = value;
        this.setState({ offer });
    }

    handleSave = async (e) => {
        e.stopPropagation();
        e.preventDefault();

        const { createOffer, history } = this.props;
        const { offer } = this.state;
        console.log('createOffer -', this.props.createOffer);
        console.log('offer b4 save -', this.state.offer);
        
        await createOffer({ ...offer });

        history.push('/');
    }

    render() {
        const { offer } = this.state;
        console.log('point U1');
        return (
            <div className="margintop">
                {console.log('point U2')}
                <h3 className="">Create an offer</h3>
                <div className="">
                    <div className="">
                        <label htmlFor="companyID">companyID</label>
                        <input type="text" id="companyID" value={offer.companyID} onChange={this.handleChange.bind(this, 'companyID')} />
                    </div>
                    <div className="">
                        <label htmlFor="offerID">offerID</label>
                        <input type="text" id="offerID" value={offer.offerID} onChange={this.handleChange.bind(this, 'offerID')} />
                    </div>
                    <div className="">
                        <label htmlFor="productID">productID</label>
                        <input type="text" id="productID" value={offer.productID} onChange={this.handleChange.bind(this, 'productID')} />
                    </div>
                    <div className="">
                        <label htmlFor="modelNo">model #</label>
                        <input type="text" id="modelNo" value={offer.modelNo} onChange={this.handleChange.bind(this, 'modelNo')} />
                    </div>
                    <div className="">
                        <label htmlFor="price">price</label>
                        <input type="text" id="price" value={offer.price} onChange={this.handleChange.bind(this, 'price')} />
                    </div>
                    <div className="">
                        <label htmlFor="available">available</label>
                        <input type="text" id="available" value={offer.available} onChange={this.handleChange.bind(this, 'available')} />
                    </div>

                    <div className="">
                        <button className="button1" onClick={this.handleSave}>Save</button>
                        <Link to="/" className="">Cancel</Link>
                    </div>
                </div>
            </div>
        );
    }
}

export default graphql(
    MutationCreateOffer,
    {
        props: (props) => ({
            createOffer: (offer) => {
                console.log('point L1 at createOffer = ', offer);
                return props.mutate({
                    update: (proxy, { data: { createOffer } }) => {
                        console.log('point L2 proxy - ', proxy);
                        console.log('point L2 data 1 - ', data);
                        // Update QueryAllOffers
                        const query = QueryAllOffers;
                        const data = proxy.readQuery({ query });
                        console.log('query = ', query);
                        console.log('data after read = ', data);
                        console.log('data.listOffers.items after read = ', data.listOffers.items);
                        console.log('createOffer = ', createOffer);
                        
                        data.listOffers.items = [...data.listOffers.items.filter(e => {
                            console.log('e = ', e);
                            console.log('e.offerID = ', e.offerID);
                            return e.offerID !== createOffer.offerID
                        }), createOffer];
                        console.log('data after filter = ', data);
                        console.log('data.listOffers.items after filter = ', data.listOffers.items);
                        proxy.writeQuery({ query, data });

                        // Create cache entry for QueryGetOffer
                        const query2 = QueryGetOffer;
                        const variables = { id: createOffer.id };
                        const data2 = { getOffer: { ...createOffer } };
                        console.log('point L3 data2 = ', data2);
                        proxy.writeQuery({ query: query2, variables, data: data2 });
                        console.log('point L4 query2 = ', query2);
                    },
                    variables: offer,
                    optimisticResponse: () => (
                        {
                        createOffer: {
                            ...offer, __typename: 'Offer'
                        }
                    }),
                })
            }
        })
    }
)(NewOffer);
