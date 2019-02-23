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
        dealPrice
        bestOfferType
      }
    }
  }
`

const ListIceCreams = gql`
  query listOrders {
    listOrders {
      items {
        dealPrice
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
        this.props.onSearch(val)
    }, 250)
    render() {
        console.log('props - ', this.props);
        const { loading } = this.props.data
        const { items } = this.props.data.listOrders

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
                            <p style={styles.description}>{item.bestOfferType}</p>
                        </div>
                    ))
                }
            </div>
        );
    }
}

export default compose(
    graphql(ListIceCreams, {
        options: data => ({
            fetchPolicy: 'cache-and-network'
        }),
        props: props => ({
            onSearch: searchQuery => {
                // searchQuery = searchQuery.toLowerCase()
                return props.data.fetchMore({
                    query: searchQuery === '' ? ListIceCreams : SearchIceCreams,
                    variables: {
                        searchQuery
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
