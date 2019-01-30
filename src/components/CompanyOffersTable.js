import React, { Component } from "react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import { Link } from "react-router-dom";
import Modal from 'react-modal';

import QueryGetCompany from "../graphQL/queryGetCompanyAndProducts";
import QueryAllOffers from "../graphQL/queryAllOffers";
import QueryAllProducts from "../graphQL/queryAllProducts";
import ModalOffer from "./ModalOffer";

class CompanyOffersTable extends Component {

    static defaultProps = {
        company: null,
        getCompany: () => null,
    }

    constructor(props) {
        super(props);

        this.state = {
            mainText: undefined,
            shortText: 'offer details',
            offer2update: null,
            products: this.getLatestProductsList()
        };
        this.handleModalCloseOptionSelected = this.handleModalCloseOptionSelected.bind(this);
    }

    componentWillMount() {
        Modal.setAppElement('body');
        // this.handleSync();
    }

    getLatestProductsList(){
        const { client } = this.props;
        return client.readQuery({
            query: QueryAllProducts
        });
    }

    handleModalCloseOptionSelected = () => {
        this.setState(() => ({ mainText: undefined }));
        this.handleSync();
    }

    handleSync = async () => {
        const { client } = this.props;
        console.log('props COT HS = ', this.props);
        console.log('client in OFFER TABLE = ', client);

        const query = QueryGetCompany;

        this.setState({ busy: true });

        console.log('client.query = ', client.query);
        const coId = this.props.company.id;
        console.log('coId - ', coId);
        
        await client.query({
            query,
            variables: { id: coId },
            fetchPolicy: 'network-only',
        });

        // await result = client.query({ query: YOUR_QUERY, variables: {});

        this.setState({ busy: false });
    }

    render() {
        console.log('this.props COT - ', this.props);
        // console.log('modelNo', this.props.products[0].modelNo);
        console.log('QueryGetCompany = ', QueryGetCompany);
        // const { client } = this.props;
        // const data22 = client.readQuery({
        //     query: QueryAllOffers
        // });
        // console.log('all offers ? - ', data22);
        // const data23 = client.readFragment({
        //     id: '653fbaef-9655-4ec6-a1e4-f0073cd78c8b',
        //     fragment: gql`
        //         fragment aCo on QueryGetCompany {
        //             id
        //             name
        //         }
        //     `,
        // });        
        // console.log('a company ? - ', data23);

        const { company, loading } = this.props;
        if (this.props.company) {
            const { company: { offers: { items } } } = this.props;
            return (
                <div className={`${loading ? 'loading' : ''}`}>
                    {console.log('company =', company)}
                    {company && <div className="">
                        <div className="responsiveFSize">{company.name} - offered products:</div>
                        <span
                            className="addnlightbg notbold cursorpointer"
                            onClick={() => {
                                this.setState(() => ({ mainText: "New offer details", offer2update: null }));
                            }}>add offer</span>
                        &nbsp;&nbsp;
                        <span
                            className="addnlightbg notbold cursorpointer"
                            onClick={() => {
                                this.handleSync();
                            }}>sync offers</span>
                        &nbsp;&nbsp;

                        <span className="responsiveFSize2">to update click product name</span>

                        {this.state.mainText !== null && <ModalOffer
                            companyID={company.id}
                            products={this.props.products}
                            offers={company.offers}
                            offer2update={this.state.offer2update}
                            mainText={this.state.mainText}
                            shortText={this.state.shortText}
                            handleModalCloseOptionSelected={this.handleModalCloseOptionSelected}
                        />}

                        <table className="smalltable">
                            <tbody>
                                <tr>
                                    <td>&nbsp;</td>
                                    <td>Model #</td>
                                    <td>Price</td>
                                    <td>Rating</td>
                                    <td>Available</td>
                                </tr>

                                {[].concat(items).sort((a, b) => a.offerID.localeCompare(b.offerID)).map((offer) =>
                                    <tr key={offer.offerID}>
                                        <td> {console.log('offer.id - ', offer.offerID)}
                                            <span className="addnlightbg notbold cursorpointer"
                                                onClick={() => {
                                                    this.setState(() => ({ offer2update: offer, mainText: "Update offer" }));
                                                }}>&nbsp;{offer.product.name}</span>
                                            &nbsp;
                                        </td>
                                        <td>&nbsp;{offer.product.modelNo}&nbsp;</td>
                                        <td>&nbsp;{offer.price}&nbsp;</td>
                                        <td>4.4</td>
                                        <td>&nbsp;{offer.available}&nbsp;</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>}
                </div>
            );
        } else {
            return (
                <div>Loading ...</div>
            )
        }
    }

}

export default graphql(
    QueryGetCompany,
    {
        options: function({ id }) {
            console.log('in BBB1');
            return ({
            variables: { id },
            fetchPolicy: 'cache-and-network',
        })},
        props: ({ data: { getCompany: company, listProducts = { items: []}, loading } }) => {
            console.log('in BBB2 data -', company, listProducts, loading);
            return ({
            company,
            products: listProducts.items,
            loading,
        })},
    },
)(CompanyOffersTable);
