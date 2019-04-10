import React, { Component } from 'react';
import gql from 'graphql-tag'
import { graphql, compose } from 'react-apollo'

import debounce from 'lodash/debounce';
import UsersCompanyContext from '../context/UsersCompanyContext'

const SearchOrders = gql`
  query($searchQuery: String, $companyID: ID) {
    listOrders(filter: {
      bestOfferType: {
        contains: $searchQuery,
      },
      companyID: {
        eq: $companyID
      }
    }) {
      items {
        companyID
        orderID
        dealPrice
        quantity
        bestOfferType
      }
    }
  }
`

const ListOrders = gql`
  query($companyID: ID) {
    listOrders (filter: {
      companyID: {
        eq: $companyID
      }
    }){
      items {
        companyID
        orderID
        dealPrice
        quantity
        bestOfferType
      }
    }
  }
`

class Search extends Component {
    static contextType = UsersCompanyContext;

    state = {
        searchQuery: ''
    };
    
    onChange = (e) => {
        const value = e.target.value
        this.handleFilter(value)
    };
    
    handleFilter = debounce((val) => {
        this.setState({ searchQuery: val });
        const val2 = this.context; // this.props.companyBID;  // "react-scripts test",
        this.props.onSearch(val, val2)
    }, 250);

    render() {
        console.log('Search props - ', this.props);
        const { loading } = this.props.data
        if (this.props.data.listOrders && this.props.data.listOrders.items) {
            const { items } = this.props.data.listOrders;

            return (
                <div className="margintop center">
                    <br/>
                    <br />
                    <p>Can search by bestOfferType. Please type one of these in capital letters:</p>
                    <p>OPTIMAL, CHEAPEST, HIGHESTRATING, CUSTOM</p>

                    <input
                        onChange={this.onChange.bind(this)}
                        placeholder='Search for order by type'
                    />
                    {
                        !!loading && (
                            <p>Searching...</p>
                        )
                    }
                    {
                        !loading && !items.length && this.state.searchQuery == '' && <p>Please type searched text</p>
                    }
                    {
                        !loading && !items.length && !this.state.searchQuery == '' && <p>Sorry, no results.</p>
                    }
                    {
                        !loading && items.map((item, index) => (
                            <div key={index}>
                                <p>
                                    price: {item.dealPrice}, &nbsp;
                                    quantity: {item.quantity}, &nbsp;
                                    bestOfferType: {item.bestOfferType}
                                </p>
                                <hr/>
                            </div>
                        ))
                    }
                </div>
            )
        } else {
            return (
                <div>No orders are found</div>
            )
        }
    }
}

export default compose(
    graphql(ListOrders, {
        options: data => ({
            fetchPolicy: 'cache-and-network'
        }),
        props: props => ({
            onSearch: (searchQuery, companyID) => {

                return props.data.fetchMore({
                    query: searchQuery === '' ? ListOrders : SearchOrders,
                    variables: {
                        searchQuery,
                        companyID
                    },
                    updateQuery: (previousResult, { fetchMoreResult }) => ({
                        ...previousResult,
                        listOrders: {
                            ...previousResult.listOrders,
                            items: fetchMoreResult.listOrders.items
                        }
                    })
                })
            },
            data: props.data
        })
    })
)(Search);
