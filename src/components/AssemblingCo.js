import React from 'react'

import CreateOrder from '../graphQL/mutationAddOrder'
import { graphql, compose } from 'react-apollo'
import ListOrders from "../graphQL/queryOrders";
import NewOrderSubscription from '../graphQL/subscriptionOrderNew';
import UpdateOrderSubscription from '../graphQL/subscriptionOrderUpdate';

class AssemblingCo extends React.Component {

    state = {
        nextToken: '',
        allTokens: [null],
        currentPosition: 0
    };

    // state = {
    //     name: '',
    //     ingredient: '',
    //     ingredients: [],
    //     instruction: '',
    //     instructions: [],
    // }
    // componentWillMount() {
    //     this.props.subscribeToNewOrders();
    // }
    // onChange = (key, value) => {
    //     this.setState({ [key]: value })
    // }
    // addInstruction = () => {
    //     if (this.state.instruction === '') return
    //     const instructions = this.state.instructions
    //     instructions.push(this.state.instruction)
    //     this.setState({
    //         instructions,
    //         instruction: ''
    //     })
    // }
    // addIngredient = () => {
    //     if (this.state.ingredient === '') return
    //     const ingredients = this.state.ingredients
    //     ingredients.push(this.state.ingredient)
    //     this.setState({
    //         ingredients,
    //         ingredient: ''
    //     })
    // }
    // addOrder = () => {
    //     const { name, ingredients, instructions } = this.state
    //     this.props.onAdd({
    //         id: new Date('January 1, 2022 00:00:00') - new Date(),
    //         ingredients,
    //         instructions,
    //         name
    //     })
    //     this.setState({
    //         name: '',
    //         ingredient: '',
    //         ingredients: [],
    //         instruction: '',
    //         instructions: [],
    //     })
    // }

    getThresholdText(orderRule, isOrderRule) {
        let text = '';
        if (isOrderRule) {
            text = `${text} ${orderRule.reorderQnty} @ ${orderRule.reorderLevel}`;
            text = !orderRule.isRuleEffective ? `( SUSPENDED ) - ${text}` : text;
        }

        switch (orderRule.bestOfferType) {
            case 'OPTIMAL':
                text = `${text}, ${orderRule.minProductRating}-min, min`;
                break;
            case 'HIGHESTRATING':
                text = `${text}, max, ${orderRule.maxPrice}-max`;
                break;
            case 'CHEAPEST':
                text = `${text}, any, min`;
                break;
            case 'CUSTOM':
                text = `${text}, ${orderRule.minProductRating}-min, ${orderRule.maxPrice}-max`;
                break;
            default:
                break;
        }
        console.log('threshold', text);
        return text;
    }

    // paginate functions

    showPrevious(token) {
        if (token) {
            const tokensTemp = JSON.parse(JSON.stringify(this.state.allTokens));
            tokensTemp.push(token);
            this.setState({ allTokens: tokensTemp, currentPosition: (tokensTemp.length - 1) });
        } else {
            this.setState(prevState => ({ allTokens: [null], currentPosition: 0 }));
        }

        this.handleFilter(token, this.props.companyID)
    }

    showNext() {
        if (this.state.allTokens[this.state.currentPosition - 1]) {
            this.setState(prevState => ({ currentPosition: prevState.currentPosition - 1 }),
                () => {
                    const token = this.state.allTokens[this.state.currentPosition];
                    this.handleFilter(token, this.props.companyID);
                });
        } else {
            this.setState({ allTokens: [null], currentPosition: 0 },
                () => {
                    const token = this.state.allTokens[this.state.currentPosition];
                    this.handleFilter(token, this.props.companyID);
                });
        }
    }

    handleFilter = (val, companyID) => {
        console.log('tokenz-1', this.state.currentPosition, this.state.allTokens);
        console.log('token', val);
        this.props.getOrdersBatch(4, val, companyID)
    };

    render() {
        console.log('newAssemblyPROPS-', this.props);
        
        return (
            <div>
                {/*<div>
                    <input
                        value={this.state.name}
                        onChange={evt => this.onChange('name', evt.target.value)}
                        placeholder='Order name'
                    />
                    <div>
                        {
                            this.state.ingredients.map((ingredient, i) => <p key={i}>{ingredient}</p>)
                        }
                    </div>
                    <input
                        value={this.state.ingredient}
                        onChange={evt => this.onChange('ingredient', evt.target.value)}
                        placeholder='Ingredient'
                    />
                    <button onClick={this.addIngredient}>Add Ingredient</button>

                    <div onClick={this.addOrder}>
                        <p>Add Order</p>
                    </div>
                    </div>*/}
                <div>
                    <span className="verIndent"></span>
                    <span className="responsiveFSize">Orders</span>&nbsp; &nbsp;
                        <span
                        className="addnlightbg notbold cursorpointer"
                        onClick={() => {
                            // this.handleSync();
                        }}>new &nbsp; &nbsp;
                    </span>

                    <span
                        className={this.props.data.listOrders.nextToken ? "addnlightbg notbold cursorpointer" : "addnlightbgoff notbold"}
                        onClick={this.props.data.listOrders.nextToken ? () => this.showPrevious(this.props.data.listOrders.nextToken) : null}
                    >prev 2 &nbsp; &nbsp;
                    </span>
                    <span
                        className={this.state.currentPosition !== 0 ? "addnlightbg notbold cursorpointer" : "addnlightbgoff notbold"}
                        onClick={this.state.currentPosition !== 0 ? () => this.showNext(this.props.data.listOrders.nextToken) : null}
                    >next 2 &nbsp; &nbsp;
                    </span>

                    <span
                        className="addnlightbg notbold cursorpointer"
                        onClick={() => this.showPrevious(null)}
                    >latest 2
                    </span>

                    <table id="tableFM">
                        <tbody>
                            <tr>
                                <td>qnty, rating, price (target / actual)</td>
                                <td>status</td>
                            </tr>
                            {this.props.data.listOrders.items && [].concat(this.props.data.listOrders.items).sort((a, b) => a.orderID.localeCompare(b.orderID)).map((order) =>
                                <tr key={order.orderID}>
                                    <td>
                                        {order.product.name}-{order.product.modelNo} - {order.quantity}
                                        {order.status !== "REJECTED" && this.getThresholdText(order, false)}
                                        /
                                            {(order.status !== "ORDER_PLACED" && order.status !== "REJECTED" && order.dealPrice) && ' $' + order.dealPrice}
                                        {order.status === "ORDER_PLACED" && '  --'}
                                        {order.status === "REJECTED" && order.note}
                                    </td>
                                    <td>
                                        {parseInt(order.orderID) < 0 && <span style={{ color: 'red' }}>
                                    {order.status.toLowerCase()}&nbsp;</span>}
                                        {parseInt(order.orderID) > 0 && <span style={{ color: 'black' }}>
                                            {order.status.toLowerCase()}&nbsp;</span>}

                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

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
            </div>
        )
    }
}

export default compose(
    graphql(ListOrders, {
        options: ({limit, nextToken, companyID}) => {
            return ({
            variables: { limit, nextToken, companyID },
              fetchPolicy: 'cache-and-network'
            });
        },
        props: props => ({
            data: { 
                listOrders: {
                    items: props.data.listOrders ? props.data.listOrders.items : [],
                    nextToken: props.data.listOrders ? props.data.listOrders.nextToken : null,
                }
            },
            subscribeToNewOrders: params => {
                props.data.subscribeToMore({
                    document: NewOrderSubscription,
                    // variables: "6e11abc1-5d3f-41f8-8167-32b1efb7edcf",
                    updateQuery: (prev, { subscriptionData: { data: { onCreateOrder } } }) => {
                        return {
                            ...prev,
                            listOrders: {
                                __typename: 'OrderConnection',
                                items: [onCreateOrder, ...prev.listOrders.items.filter(order => order.id !== onCreateOrder.id)],
                                nextToken: onCreateOrder.nextToken
                            }
                        }
                    }
                })
            }
        })
    }),
    graphql(ListOrders, {
        options: data => ({
            fetchPolicy: 'cache-and-network'
        }),
        props: props => ({
            getOrdersBatch: (limit, nextToken, companyID) => {
                console.log('nextToken, companyID', nextToken, companyID);

                // searchQuery = searchQuery.toLowerCase()
                return props.data.fetchMore({
                    query: ListOrders, // searchQuery === '' ? ListIceCreams : SearchIceCreams,
                    variables: {
                        limit, nextToken, companyID
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
    }),
    graphql(CreateOrder, {
        props: props => ({
            onAdd: order => props.mutate({
                variables: order,
                optimisticResponse: {
                    __typename: 'Mutation',
                    createOrder: { ...order, id: Math.round(Math.random() * -1000000), __typename: 'Order' }
                },
                update: (proxy, { data: { createOrder } }) => {
                    const data = proxy.readQuery({ query: ListOrders });
                    data.listOrders.items.push(createOrder);
                    proxy.writeQuery({ query: ListOrders, data });
                }
            })
        }),
    })
)(AssemblingCo)
