import React, { Component } from "react";
import { graphql } from "react-apollo";
import { Link } from "react-router-dom";

// import moment from 'moment';

import QueryGetCompany from "../graphQL/queryGetCompany";
import CompanyOffers from "./CompanyOffers";

class CompanyOffersTable extends Component {

    render() {
        console.log('this.props COT - ', this.props);
        console.log('QueryGetCompany = ', QueryGetCompany);
        
        const { company, loading } = this.props;
        if (this.props.company) {
        const { company: { offers: { items } } } = this.props;
        return (
            <div className={`ui container raised very padded segment ${loading ? 'loading' : ''}`}>
                <Link to="/" className="ui button">Back to companies</Link>
                <div className="ui items">
                    <div className="item">
                        {console.log('company =', company)}
                        {company && <div className="content">
                            <div className="header">{company.name}</div>
                            <div className="extra">
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
                         
                            </div>
                        </div>}
                    </div>
                </div>
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
        }),
        props: ({ data: { getCompany: company, loading } }) => ({
            company,
            loading,
        }),
    },
)(CompanyOffersTable);
