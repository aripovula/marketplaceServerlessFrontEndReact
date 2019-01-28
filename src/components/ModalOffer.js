import React, { Component } from "react";
import Modal from 'react-modal';
import { v4 as uuid } from "uuid";
import { graphql } from "react-apollo";
import QueryAllOffers from "../graphQL/queryAllOffers";
import QueryGetOffer from "../graphQL/queryGetOffer";
import QueryGetCompany from "../graphQL/queryGetCompany";
import MutationCreateOffer from "../graphQL/mutationAddOffer";

class ModalOffer extends Component {

    customStyles = {
        content: {
            top: '30%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '40%',
            padding: '1%',
            margin: '4%'
        }
    };

    products = [
        { id: 0, productID: '823b25f8-c7f1-4277-befa-f8b123a98921', name: 'Caster', modelNo: 'C120' },
        { id: 1, productID: '1fce5fad-9fa7-4e14-aa6e-a98608fab80c', name: 'Caster', modelNo: 'C140' },
        { id: 2, productID: '1fce5fad-9fa7-4e14-aa6e-a98608fab80c', name: 'Gauge', modelNo: '12CF' },
        { id: 3, productID: '1fce5fad-9fa7-4e14-aa6e-a98608fab80c', name: 'Valve', modelNo: 'VF12' },
        { id: 4, productID: '1fce5fad-9fa7-4e14-aa6e-a98608fab80c', name: 'Lever', modelNo: 'L15G' }
    ];
    constructor(props) {
        super(props);

        this.state = {
            mainText: this.props.mainText,
            shortText: this.props.shortText,
            offer: this.newOffer(),
            isSubmitValid: false
        };
    }

    componentWillMount() {
        Modal.setAppElement('body');
    }

    static defaultProps = {
        createOffer: () => null,
    }

    newOffer() {
        return {
            companyID: this.props.companyID, // to add - get Co ID when Co is defined
            offerID: uuid(),
            productID: '', // to add - get product ID when product is defined
            modelNo: '',
            product: null,
            price: 0,
            available: 0
        }
    }

    // state = {
    //     offer: {
    //         companyID: '', // to add - get Co ID when Co is defined
    //         offerID: '',
    //         productID: '', // to add - get product ID when product is defined
    //         modelNo: '',
    //         price: 0,
    //         available: 0
    //     }
    // };
    
    handleChange(field, { target: { value } }) {
        const { offer } = this.state;
        offer[field] = value;
        this.setState({ offer });
    }

    handleSave = async (e) => {
        e.stopPropagation();
        e.preventDefault();

        const { createOffer } = this.props;
        const { offer } = this.state;
        console.log('createOffer -', this.props.createOffer);
        console.log('offer b4 save -', this.state.offer);

        await createOffer({ ...offer });
        console.log('offer after save -', this.state.offer);
        this.setState( { offer: this.newOffer(), isSubmitValid: false })
        this.props.handleModalCloseOptionSelected();
        // history.push('/newoffer');
    }

        
    render() {

        console.log('props modaL', this.props);
        const { offer } = this.state;
        console.log('point U1');
        return (
            <div className="">
                <Modal
                    isOpen={!!this.props.mainText}
                    onRequestClose={this.props.handleClearSelectedOption}

                    style={this.customStyles}
                >
                    <div className="card-4" >
                        <div className="bggreen">
                            <p>{this.props.shortText}</p>
                        </div>
                        <span>product </span>
                        <select
                            // value={this.props.filters.filterBy}
                            onChange={(e) => {
                                const selected = e.target.value;
                                this.setState(prevState => ({
                                    offer: {
                                        ...prevState.offer,
                                        productID: this.products[selected].productID,
                                        modelNo: this.products[selected].modelNo
                                    },
                                    isSubmitValid: true
                                }))
                                console.log('selected - ', e.target.value);
                            }}
                        >
                        <option value='null'>( please select a product )</option>
                        {this.products.map((aProduct) =>
                                <option key={aProduct.id} value={aProduct.id}>{aProduct.name + ' - ' + aProduct.modelNo}</option>
                        )}
                        </select>

                        <div className="">
                            <label htmlFor="price">price</label>
                            <input type="text" id="price" value={offer.price} onChange={this.handleChange.bind(this, 'price')} />
                        </div>
                        <div className="">
                            <label htmlFor="available">available</label>
                            <input type="text" id="available" value={offer.available} onChange={this.handleChange.bind(this, 'available')} />
                        </div>

                        <div className="">
                            <button className="button button1" onClick={this.handleSave} disabled={!this.state.isSubmitValid}>Save</button>
                            <button className="button button1" onClick={this.props.handleModalCloseOptionSelected}>Cancel</button>
                        </div>
                    </div>
                </Modal >

            </div>
        );
    }
}

export default graphql(
    MutationCreateOffer,
    {
        props: (props) => ({
            createOffer: (offer) => {
                console.log('point L1 at createOffer = ', offer);
                return props.mutate({
                    update: (proxy, { data: { createOffer } }) => {
                        console.log('point L2 proxy - ', proxy);
                        // Update QueryAllOffers
                        const query = QueryAllOffers;
                        const data = proxy.readQuery({ query });
                        console.log('query = ', query);
                        console.log('data after read = ', data);
                        console.log('data.listOffers.items after read = ', data.listOffers.items);
                        console.log('createOffer = ', createOffer);

                        // get latest offers from getCompany
                        data.listOffers.items = [
                        ...props.ownProps.offers.items, 
                        createOffer];

                        // filter out old one if it is an update
                        data.listOffers.items = [
                                ...data.listOffers.items.filter(e => {
                                console.log('e = ', e);
                                console.log('e.offerID = ', e.offerID);
                                return e.offerID !== createOffer.offerID
                            })
                            , createOffer];

                        console.log('data after filter = ', data);
                        console.log('data.listOffers.items after filter = ', data.listOffers.items);
                        proxy.writeQuery({ query, data });

                        // Create cache entry for QueryGetOffer
                        const query2 = QueryGetOffer;
                        const variables = { id: createOffer.id };
                        const data2 = { getOffer: { ...createOffer } };
                        console.log('point L3 data2 = ', data2);
                        proxy.writeQuery({ query: query2, variables, data: data2 });
                        console.log('point L4 query2 = ', query2);
                        console.log('this.props MODAL -', props.ownProps.offers.items);
                    },
                    variables: offer,
                    // optimisticResponse: () => (
                    //     {
                    //         createOffer: {
                    //             ...offer, __typename: 'Offer'
                    //         }
                    //     }),
                })
            }
        })
    }
)(ModalOffer);

