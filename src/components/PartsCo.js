import React from 'react'
import uuidV4 from 'uuid/v4'

// import CreateRecipe from './mutations/CreateRecipe'
import { graphql, compose } from 'react-apollo'
// import ListRecipes from './queries/ListRecipes'
// import NewRecipeSubscription from './subscriptions/NewRecipeSubscription';
import QueryAllOffers from "../graphQL/queryAllOffers";
import QueryGetOffer from "../graphQL/queryGetOffer";
import MutationCreateOffer from "../graphQL/mutationAddOffer";
import MutationUpdateOffer from "../graphQL/mutationUpdateOffer";
import MutationDeleteOffer from "../graphQL/mutationDeleteOffer";
import NewOfferSubscription from '../graphQL/subscriptionOfferNew'
// import UpdateOfferSubscription from '../graphQL/subscriptionOfferUpdate'

class PartsCo extends React.Component {
    state = {
        companyID: '',
        offerID: '',
        available: '',
        price: '',
        productID: ''
    }
    componentWillMount() {
        this.props.subscribeToNewOffers();
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
    addOffer = () => {
        // const { name, ingredients, instructions } = this.state
        this.props.onAdd({
            companyID: this.props.companyID,
            offerID: uuidV4(),
            available: Math.round(Math.random() * 10),
            price: Math.round(Math.random() * 10),
            productID: uuidV4()
        })
        this.setState({
            companyID: '',
            offerID: '',
            available: '',
            price: '',
            productID: ''
        })
    }
    render() {
        console.log('PROPS-', this.props);
        
        return (
            <div>
                <div>
                    {/*<input
                        value={this.state.name}
                        onChange={evt => this.onChange('name', evt.target.value)}
                        placeholder='Offer name'
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
                    />*/}

                    <div onClick={this.addOffer}>
                        <p>Add Offer</p>
                    </div>
                </div>
                <div>
                    <h1>Offers</h1>
                    {
                        this.props.data.listOffers.items.sort((a, b) => a.productID.localeCompare(b.productID)).map((r, i) => (
                            <div key={i}>
                                {parseInt(r.offerID) < 0 && <span style={{ color: 'red' }}>Offer name: {r.price}</span>}
                                {!(parseInt(r.offerID) < 0) && <span style={{ color: 'black' }}>Offer name: {r.price}</span>}
                                - <span style={{ color: 'black' }}>Offer qnty: {r.available}</span>
                            </div>
                        ))
                    }
                </div>
            </div>
        )
    }
}

export default compose(
    graphql(QueryAllOffers, {
        options: {
            fetchPolicy: 'cache-and-network'
        },
        props: props => ({
            data: {
                listOffers: {
                    items: props.data.listOffers ? props.data.listOffers.items : [],
                }
            },
            subscribeToNewOffers: params => {
                props.data.subscribeToMore({
                    document: NewOfferSubscription,
                    updateQuery: (prev, { subscriptionData: { data: { onCreateOffer } } }) => {
                        return {
                            ...prev,
                            listOffers: {
                                __typename: 'OfferConnection',
                                items: [onCreateOffer, ...prev.listOffers.items.filter(offer => offer.offerID !== onCreateOffer.offerID)]
                            }
                        }
                    }
                })
            }
        })
    }),
    graphql(MutationCreateOffer, {
        props: props => ({
            onAdd: offer => props.mutate({
                variables: offer,
                optimisticResponse: {
                    __typename: 'Mutation',
                    createOffer: { ...offer, offerID: Math.round(Math.random() * -1000000), __typename: 'Offer' }
                },
                update: (proxy, { data: { createOffer } }) => {
                    const data = proxy.readQuery({ query: QueryAllOffers });
                    console.log('data2 b4', data.listOffers.items.length, JSON.stringify(data));

                    // data.listOffers.items.push(createOffer);

                    data.listOffers.items = [
                        ...data.listOffers.items.filter(e => {
                            // console.log('e = ', e);
                            // console.log('e.orderID = ', e.orderID);
                            return e.offerID !== createOffer.offerID
                        })
                        , createOffer];

                    console.log('data2 b4', data.listOffers.items.length, JSON.stringify(data));
                    proxy.writeQuery({ query: QueryAllOffers, data });
                }
            })
        }),
    })
)(PartsCo)
