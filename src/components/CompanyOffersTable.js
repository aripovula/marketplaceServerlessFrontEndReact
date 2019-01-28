import React, { Component } from "react";
import { graphql } from "react-apollo";
import { Link } from "react-router-dom";
import Modal from 'react-modal';

import QueryGetCompany from "../graphQL/queryGetCompany";
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
            shortText: undefined
        };
        this.handleModalCloseOptionSelected = this.handleModalCloseOptionSelected.bind(this);
    }

    componentWillMount() {
        Modal.setAppElement('body');
        // this.handleSync();
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
        console.log('QueryGetCompany = ', QueryGetCompany);

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
                            data-tip="permanently deletes entry. You will be prompted to confirm"
                            onClick={() => {
                                this.setState(() => ({
                                    shortText: 'New offer',
                                    mainText: "New offer details"
                                }));
                            }}>add offer</span>
                        &nbsp;&nbsp;
                        <span
                            className="addnlightbg notbold cursorpointer"
                            data-tip="permanently deletes entry. You will be prompted to confirm"
                            onClick={() => {
                                this.handleSync();
                            }}>sync offers</span>
                        &nbsp;&nbsp;

                        <span className="responsiveFSize2">to update click product name</span>

                        <ModalOffer
                            companyID={company.id}
                            offers={company.offers}
                            mainText={this.state.mainText}
                            shortText={this.state.shortText}
                            handleModalCloseOptionSelected={this.handleModalCloseOptionSelected}
                        />

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
                                        <td>&nbsp;{offer.product.name}&nbsp;</td>
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
        props: ({ data: { getCompany: company, loading } }) => {
            console.log('in BBB2 data -', company, loading);
            return ({
            company,
            loading,
        })},
    },
)(CompanyOffersTable);
