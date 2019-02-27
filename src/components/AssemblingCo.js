import React from 'react'

import CreateOrder from '../graphQL/mutationAddOrder'
import { graphql, compose } from 'react-apollo'
import ListOrders from "../graphQL/queryOrders";
import NewOrderSubscription from '../graphQL/subscriptionOrderNew';
import UpdateOrderSubscription from '../graphQL/subscriptionOrderUpdate';

class AssemblingCo extends React.Component {
    state = {
        name: '',
        ingredient: '',
        ingredients: [],
        instruction: '',
        instructions: [],
    }
    componentWillMount() {
        this.props.subscribeToNewOrders();
    }
    onChange = (key, value) => {
        this.setState({ [key]: value })
    }
    addInstruction = () => {
        if (this.state.instruction === '') return
        const instructions = this.state.instructions
        instructions.push(this.state.instruction)
        this.setState({
            instructions,
            instruction: ''
        })
    }
    addIngredient = () => {
        if (this.state.ingredient === '') return
        const ingredients = this.state.ingredients
        ingredients.push(this.state.ingredient)
        this.setState({
            ingredients,
            ingredient: ''
        })
    }
    addOrder = () => {
        const { name, ingredients, instructions } = this.state
        this.props.onAdd({
            id: new Date('January 1, 2022 00:00:00') - new Date(),
            ingredients,
            instructions,
            name
        })
        this.setState({
            name: '',
            ingredient: '',
            ingredients: [],
            instruction: '',
            instructions: [],
        })
    }
    render() {
        console.log('newAssemblyPROPS-', this.props);
        
        return (
            <div>
                <div>
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
                </div>
                <div>
                    <h1>Orders</h1>
                    {
                        this.props.orders.sort((a, b) => a.orderID.localeCompare(b.orderID)).map((r, i) => (
                            <div key={i}>
                                {parseInt(r.orderID) < 0 && <span style={{ color: 'red' }}>Deal price: {r.dealPrice}</span>}
                                {parseInt(r.orderID) > 0 && <span style={{ color: 'black' }}>Deal price: {r.dealPrice}</span>}
                                &nbsp; - &nbsp;<span> quantity: {r.quantity}</span>
                                &nbsp; - &nbsp;<span> id: {r.companyID}</span>
                            </div>
                        ))
                    }
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
            orders: props.data.listOrders ? props.data.listOrders.items : [],
            subscribeToNewOrders: params => {
                props.data.subscribeToMore({
                    document: NewOrderSubscription,
                    variables: "6e11abc1-5d3f-41f8-8167-32b1efb7edcf",
                    updateQuery: (prev, { subscriptionData: { data: { onCreateOrder } } }) => {
                        return {
                            ...prev,
                            listOrders: {
                                __typename: 'OrderConnection',
                                items: [onCreateOrder, ...prev.listOrders.items.filter(order => order.id !== onCreateOrder.id)]
                            }
                        }
                    }
                })
            }
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
