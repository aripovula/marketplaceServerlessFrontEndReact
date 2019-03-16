import React, { Component } from 'react';
import gql from 'graphql-tag'
import { graphql, compose } from 'react-apollo'

import debounce from 'lodash/debounce';

// const SearchIceCreams = gql`
//   query($searchQuery: String) {
//     listIceCreams(filter: {
//       searchField: {
//         contains: $searchQuery
//       }
//     }) {
//       items {
//         name
//         description
//       }
//     }
//   }
// `

const SearchIceCreams = gql`
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

const ListIceCreams = gql`
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


    state = {
        searchQuery: ''
    }
    onChange = (e) => {
        const value = e.target.value
        this.handleFilter(value)
    }
    handleFilter = debounce((val) => {
        const val2 = this.props.companyBID;
        this.props.onSearch(val, val2)
    }, 250)
    render() {
        console.log('props - ', this.props);
        const { loading } = this.props.data
        if (this.props.data.listOrders && this.props.data.listOrders.items) {
            const { items }  = this.props.data.listOrders;

        return (
            <div className="margintop">
                <input
                    // style={styles.input}
                    onChange={this.onChange.bind(this)}
                    placeholder='Search for ice cream'
                />
                {
                    !!loading && (
                        <p>Searching...</p>
                    )
                }
                {
                    !loading && !items.length && (
                        <p>Sorry, no results.</p>
                    )
                }
                {
                    !loading && items.map((item, index) => (
                        <div key={index} style={styles.container}>
                            <p style={styles.title}>{item.dealPrice}</p>
                            <p style={styles.title}>{item.quantity}</p>
                            <p style={styles.description}>{item.bestOfferType}</p>
                        </div>
                    ))
                }
            </div>
        ) } else {
            return (
                <div>No orders are found</div>
            )
        }
    }
}

export default compose(
    graphql(ListIceCreams, {
        options: data => ({
            fetchPolicy: 'cache-and-network'
        }),
        props: props => ({
            onSearch: (searchQuery, companyID) => {
                // searchQuery = searchQuery.toLowerCase()
                console.log('inputs', searchQuery, companyID);
                
                return props.data.fetchMore({
                    query: searchQuery === '' ? ListIceCreams : SearchIceCreams,
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

const styles = {
    container: {
        padding: 10,
        borderBottom: '1px solid #ddd'
    },
    title: {
        fontSize: 18
    },
    description: {
        fontSize: 15,
        color: 'rgba(0, 0, 0, .5)'
    },
    input: {
        height: 40,
        width: 300,
        padding: 7,
        fontSize: 15,
        outline: 'none'
    }
}
