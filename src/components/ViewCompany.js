import React, { Component } from "react";
import { graphql } from "react-apollo";
import { Link } from "react-router-dom";

// import moment from 'moment';

import QueryGetCompany from "../graphQL/queryGetCompany";
import CompanyOffers from "./CompanyOffers";

class ViewCompany extends Component {

    render() {
        const { company, loading } = this.props;
        console.log('this.props.location.query - ', this.props);
        return (
            <div className={`ui container raised very padded segment ${loading ? 'loading' : ''}`}>
                <Link to="/" className="ui button">Back to companies</Link>
                <div className="ui items">
                    <div className="item">
                        {console.log('company =', company)}
                        {company && <div className="content">
                            <div className="header">{company.name}</div>
                            <div className="extra">
                                <CompanyOffers companyID={company.id} offers={company.offers} />
                            </div>
                        </div>}
                    </div>
                </div>
            </div>
        );
    }

}

const ViewCompanyWithData = graphql(
    QueryGetCompany,
    {
        options: ({ match: { params: { id } } }) => ({
            variables: { id },
            fetchPolicy: 'cache-and-network',
        }),
        props: ({ data: { getCompany: company, loading } }) => ({
            company,
            loading,
        }),
    },
)(ViewCompany);

export default ViewCompanyWithData;