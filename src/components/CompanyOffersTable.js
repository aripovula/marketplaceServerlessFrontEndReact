import React, { Component } from "react";
import { graphql } from "react-apollo";
import { Link } from "react-router-dom";
import Modal from 'react-modal';

import OfferModal from './OfferModal';
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
        this.handleSync();
    }

    handleModalCloseOptionSelected = () => {
        this.setState(() => ({ mainText: undefined }));
    }

    handleSync = async () => {
        const { client } = this.props;
        console.log('props = ', this.props);
        console.log('client in OFFER TABLE = ', client);

        const query = QueryGetCompany;

        this.setState({ busy: true });

        console.log('client.query = ', client.query);
        await client.query({
            query,
            fetchPolicy: 'network-only',
        });

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
                        <span className="responsiveFSize2">to update click product name</span>

                        <ModalOffer
                            companyID={company.id}
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
        options: ({ id }) => ({
            variables: { id },
            fetchPolicy: 'cache-and-network',
            // update: (proxy, { data: { createTodo } }) => {
            //     const data = proxy.readQuery({ query });
            //     data.todos.push(createTodo);
            //     proxy.writeQuery({ query, data });
            // },
            update: (proxy, { data: { getCompany } }) => {
                const query = QueryGetCompany;
                const data = proxy.readQuery({ query });
                console.log('data in Table b4', data);
                data.getCompany = data.getCompany.filter(co => co.id !== getCompany.id);
                console.log('data in Table after', data);
                
                proxy.writeQuery({ query, data });
            }

        }),
        props: ({ data: { getCompany: company, loading } }) => ({
            company,
            loading,
        }),
    },
)(CompanyOffersTable);