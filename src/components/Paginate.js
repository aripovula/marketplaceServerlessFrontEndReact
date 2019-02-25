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
  query($searchQuery: String) {
    listOrders(filter: {
      bestOfferType: {
        contains: $searchQuery
      }
    }) {
      items {
        orderID
        dealPrice
        quantity
        bestOfferType
      }
    }
  }
`

const ListIceCreams = gql`
  query listOrders {
    listOrders {
      items {
        orderID
        dealPrice
        quantity
        bestOfferType
      }
    }
  }
`

const PaginateOrders = gql`
  query($nextToken: String) {
    listOrders(limit: 2, nextToken: $nextToken) {
      items {
        orderID
        dealPrice
        quantity
        bestOfferType
      }
      nextToken
    }
  }
`

class Paginate extends Component {
    state = {
        nextToken: ''
    };

    onChange = (e) => {
        const value = e.target.value
        this.handleFilter(value)
    };

    handleFilter = debounce((val) => {
        this.props.onSearch(val)
    }, 250);

    render() {
        console.log('props - ', this.props);
        const { loading } = this.props.data
        if (this.props.data.listOrders && this.props.data.listOrders.items) {
            const { items }  = this.props.data.listOrders;

        return (
            <div className="App">
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
                {!loading && this.props.data.listOrders.nextToken}
            </div>
        ) } else {
            return (
                <div>No orders are found</div>
            )
        }
    }
}

export default compose(
    graphql(PaginateOrders, {
        options: data => ({
            fetchPolicy: 'cache-and-network'
        }),
        props: props => ({
            onSearch: nextToken => {
                // searchQuery = searchQuery.toLowerCase()
                return props.data.fetchMore({
                    query: PaginateOrders, // searchQuery === '' ? ListIceCreams : SearchIceCreams,
                    variables: {
                        nextToken
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
)(Paginate);

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
