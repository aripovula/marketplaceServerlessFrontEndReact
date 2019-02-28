import React from 'react'
import uuidV4 from 'uuid/v4'

// import CreateRecipe from './mutations/CreateRecipe'
import { graphql, compose } from 'react-apollo'
// import ListRecipes from './queries/ListRecipes'
// import NewRecipeSubscription from './subscriptions/NewRecipeSubscription';
import QueryAllOffers from "../graphQL/queryAllOffers";//ForCo";
import QueryAllOffersForCo from "../graphQL/queryAllOffersForCo";
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
        // this.props.subscribeToNewOffers2();
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
            offerID: new Date('January 1, 2022 00:00:00') - new Date(),
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
        let listOffers2;
        try {
            listOffers2 = this.props.client.readQuery({
                query: QueryAllOffers
            });
            console.log('listOffers2-', JSON.stringify(listOffers2.listOffers.items));
        } catch (e) {
            console.log('readQuery error-', e);
            listOffers2 = null;
        }

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
                        listOffers2 && listOffers2.listOffers && listOffers2.listOffers.items.sort((a, b) => a.offerID.localeCompare(b.offerID)).map((r, i) => (
                            <div key={i}>
                                {parseInt(r.offerID) < 0 && console.log('r.offerID', r.offerID)}
                                {parseInt(r.offerID) < 0 && <span style={{ color: 'red' }}>Offer name: {r.price}</span>}
                                {!(parseInt(r.offerID) < 0) && <span style={{ color: 'black' }}>Offer name: {r.price}</span>}
                                - <span style={{ color: 'black' }}>Offer qnty: {r.available}</span>
                            </div>
                        ))
                    }
                    --not_2--
                    {
                        this.props.data.listOffers && this.props.data.listOffers.items.sort((a, b) => a.offerID.localeCompare(b.offerID)).map((r, i) => (
                            <div key={i}>
                                {parseInt(r.offerID) < 0 && console.log('r.offerID', r.offerID)}
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
    graphql(QueryAllOffersForCo, {
        options: ({ limit, nextToken, companyID }) => {
            return ({
                variables: { limit, nextToken, companyID },
                fetchPolicy: 'cache-and-network'
            });
        },
        // options: {
        //     fetchPolicy: 'cache-and-network'
        // },
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
    // graphql(QueryAllOffers, {
    //     // options: ({ limit, nextToken, companyID }) => {
    //     //     return ({
    //     //         variables: { limit, nextToken, companyID },
    //     //         fetchPolicy: 'cache-and-network'
    //     //     });
    //     // },
    //     options: {
    //         fetchPolicy: 'cache-and-network'
    //     },
    //     props: props => ({
    //         data: {
    //             listOffers2: {
    //                 items: props.data.listOffers ? props.data.listOffers.items : [],
    //             }
    //         },
    //         subscribeToNewOffers2: params => {
    //             props.data.subscribeToMore({
    //                 document: NewOfferSubscription,
    //                 updateQuery: (prev, { subscriptionData: { data: { onCreateOffer } } }) => {
    //                     return {
    //                         ...prev,
    //                         listOffers2: {
    //                             __typename: 'OfferConnection',
    //                             items: [onCreateOffer, ...prev.listOffers.items.filter(offer => offer.offerID !== onCreateOffer.offerID)]
    //                         }
    //                     }
    //                 }
    //             })
    //         }
    //     })
    // }),

    graphql(MutationCreateOffer, {
        props: props => ({
            onAdd: offer => props.mutate({
                variables: offer,
                optimisticResponse: {
                    __typename: 'Mutation',
                    createOffer: { ...offer, offerID: ''+Math.round(Math.random() * -1000000), __typename: 'Offer' }
                },
                update: (proxy, { data: { createOffer } }) => {
                    console.log('proxy b4', proxy);
                    
                    const data = proxy.readQuery({ 
                        query: QueryAllOffersForCo,
                        variables: {
                            limit: props.ownProps.limit,
                            nextToken: null,
                            companyID: props.ownProps.companyID
                        }
                    });
                    console.log('data 1 after read', data.listOffers.items.length, JSON.stringify(data));

                    // data.listOffers.items.push(createOffer);

                    data.listOffers.items = [
                        ...data.listOffers.items.filter(e => {
                            // console.log('e = ', e);
                            // console.log('e.orderID = ', e.orderID);
                            return e.offerID !== createOffer.offerID
                        })
                        , createOffer];

                    console.log('data 2 b4 write', data.listOffers.items.length, JSON.stringify(data));
                    proxy.writeQuery({ query: QueryAllOffers, data });

                    //////

                    const data2 = proxy.readQuery({
                        query: QueryAllOffers,
                    });
                    console.log('data2 1 after read', data2.listOffers.items.length, JSON.stringify(data2));

                    // data.listOffers.items.push(createOffer);

                    data2.listOffers.items = [
                        ...data2.listOffers.items.filter(e => {
                            // console.log('e = ', e);
                            // console.log('e.orderID = ', e.orderID);
                            return e.offerID !== createOffer.offerID
                        })
                        , createOffer];

                    console.log('data2 2 b4 write', data2.listOffers.items.length, JSON.stringify(data2));
                    proxy.writeQuery({ query: QueryAllOffers, data: data2 });
                }
            })
        }),
    })
)(PartsCo)
