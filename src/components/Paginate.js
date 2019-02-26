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

// const SearchIceCreams = gql`
//   query($searchQuery: String) {
//     listOrders(filter: {
//       bestOfferType: {
//         contains: $searchQuery
//       }
//     }) {
//       items {
//         orderID
//         dealPrice
//         quantity
//         bestOfferType
//       }
//     }
//   }
// `

// const ListIceCreams = gql`
//   query listOrders {
//     listOrders {
//       items {
//         orderID
//         dealPrice
//         quantity
//         bestOfferType
//       }
//     }
//   }
// `

const PaginateOrders = gql`
  query($nextToken: String, $companyID: ID) {
    listOrders(limit: 2,
    nextToken: $nextToken, 
    filter: {
      companyID: {
        eq: $companyID
      }
    }
    ) {
      items {
        companyID
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
        nextToken: '',
        allTokens: [null],
        currentPosition: 0
    };
    
    componentDidMount() {
        this.handleFilter(null, "d20cde2e-b0a4-441b-a8be-5a31e0eb09e8");
    }

    showPrevious(token) {
        if (token) {
          const tokensTemp = JSON.parse(JSON.stringify(this.state.allTokens));
          tokensTemp.push(token);
          this.setState({allTokens: tokensTemp, currentPosition: (tokensTemp.length - 1)});
        } else {
            this.setState(prevState => ({allTokens: [null], currentPosition: 0}));
        }

        this.handleFilter(token, "d20cde2e-b0a4-441b-a8be-5a31e0eb09e8")
    }
    
    showNext() {
        if (this.state.allTokens[this.state.currentPosition - 1]) {
            this.setState(prevState => ({currentPosition: prevState.currentPosition - 1}),
               () => {
                   const token = this.state.allTokens[this.state.currentPosition];
                   this.handleFilter(token, "d20cde2e-b0a4-441b-a8be-5a31e0eb09e8");
            });
        } else {
            this.setState({allTokens: [null], currentPosition: 0},
                () => {
                    const token = this.state.allTokens[this.state.currentPosition];
                    this.handleFilter(token, "d20cde2e-b0a4-441b-a8be-5a31e0eb09e8");
            });
        }
    }

    onChange = (e) => {
        const value = e.target.value
        this.handleFilter(value, "d20cde2e-b0a4-441b-a8be-5a31e0eb09e8")
    };

    handleFilter = debounce((val, companyID) => {
        
        console.log('tokenz-1', this.state.currentPosition, this.state.allTokens);
        console.log('token', val);
        this.props.onSearch(val, companyID)
    }, 250);

    render() {
        console.log('props - ', this.props);
        const { loading } = this.props.data
        if (this.props.data.listOrders && this.props.data.listOrders.items) {
            const { items }  = this.props.data.listOrders;
            const {nextToken} = this.props.data.listOrders;

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
                <button className="button button1" 
                onClick={() => this.showPrevious(this.props.data.listOrders.nextToken)}
                disabled={!this.props.data.listOrders.nextToken}
                >Previous 2</button>

                <button className="button button1" 
                onClick={() => this.showNext()}
                disabled={this.state.currentPosition === 0}
                >Next 2</button>

                <button className="button button1" 
                onClick={() => this.showPrevious(null)}
                >Show latest 2</button>
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
            onSearch: (nextToken, companyID) => {
                // searchQuery = searchQuery.toLowerCase()
                return props.data.fetchMore({
                    query: PaginateOrders, // searchQuery === '' ? ListIceCreams : SearchIceCreams,
                    variables: {
                        nextToken, companyID
                    },
                    updateQuery: (previousResult, { fetchMoreResult }) => ({
                        ...previousResult,
                        listOrders: {
                            ...previousResult.listOrders,
                            items: fetchMoreResult.listOrders.items,
                            nextToken: fetchMoreResult.listOrders.nextToken
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
