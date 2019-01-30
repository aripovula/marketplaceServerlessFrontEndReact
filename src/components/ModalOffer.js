import React, { Component } from "react";
import Modal from 'react-modal';
import { v4 as uuid } from "uuid";
import { graphql } from "react-apollo";
import QueryAllOffers from "../graphQL/queryAllOffers";
import QueryGetOffer from "../graphQL/queryGetOffer";
// import QueryGetCompany from "../graphQL/queryGetCompany";
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
            width: '650px',
            padding: '1%',
            margin: '4%'
        }
    };

    constructor(props) {
        super(props);

        const noOfferProducts = this.noOfferProducts();
        this.state = {
            mainText: this.props.mainText,
            shortText: this.props.shortText,
            offer: this.newOffer(),
            products: noOfferProducts,
            productsAll: this.allProducts(),
            productsNoOffer: noOfferProducts,
            isSubmitValid: false,
            isUpdate: false,
            selectedOption: -1
        };
        this.handleModalCloseOptionSelected = this.handleModalCloseOptionSelected.bind(this);
    }

    componentWillMount() {
        Modal.setAppElement('body');
    }

    static defaultProps = {
        createOffer: () => null,
    }

    newOffer() {
        if (this.props.offer2update === null) {
            return {
                companyID: this.props.companyID, 
                offerID: uuid(),
                productID: '',
                modelNo: '',
                product: null,
                price: 0,
                available: 0
            }
        } else {
            return this.props.offer2update;
        }
    }

    allProducts() {
        console.log('this.props.products - ', this.props.products);
        
        if (this.props.products) {
            const l = this.props.products.length;
            let indexedProductsAll = [];
            for (let x = 0; x < l; x++) {
                indexedProductsAll.push({ seqNumb: x, details: this.props.products[x]})
                console.log('indexedProducts - ', x, indexedProductsAll);
                console.log('indexedProducts[x] - ', this.props.products[x]);
                
            }
            console.log('indexedProducts - ', indexedProductsAll);
            
            return indexedProductsAll;
        } else {
            return [];
        }
    }

    noOfferProducts(){
        
        if (this.props.products) {
            let coOffers;
            this.props.offers.items.forEach((item) => { coOffers = coOffers + item.productID + ';;'});
            console.log('tsNoOf coOffers - ', coOffers);
            const l = this.props.products.length;
            let indexedProductsNoOffer = [];
            let count = 0;
            for (let x = 0; x < l; x++) {
                if (!coOffers.includes(this.props.products[x].id)) {
                    indexedProductsNoOffer.push({
                        seqNumb: count++,
                        details: this.props.products[x]
                    })
                    console.log('indexedProductsNoOf - ', x, indexedProductsNoOffer);
                    console.log('indexedProductsNoOf[x] - ', this.props.products[x]);
                }
            }
            console.log('indexedProductsNoOf - ', indexedProductsNoOffer);
            return indexedProductsNoOffer;
        } else {
            return [];
        }        
    }

    handleModalCloseOptionSelected() {
        this.setState(prevState => ({
            products: prevState.productsNoOffer,
            isSubmitValid: false,
            offer: this.newOffer(),
            offer2update: null
        }), () => this.props.handleModalCloseOptionSelected());
    }

    updateProductOptions(e) {
        console.log('e-', e.target.value);
        
        if (e.target.value === 'all') {
            this.setState({
                products: this.state.productsAll,
                selectedOption: -1
            }, () => this.handleSelectOptionChange(0));
        } else {
            this.setState({
                products: this.state.productsNoOffer,
                selectedOption: -1
            }, () => this.handleSelectOptionChange(0)); 
        }
    }

    handleSelectOptionChange(selected) {
        console.log('selected - ', selected);
        
        if (selected > -1) {
            console.log('products[selected]', this.state.products[selected].details);
            let isFound = false; let xF = -1;
            for (let x = 0; x < this.props.offers.items.length; x++) {
                if (this.props.offers.items[x].productID === this.state.products[selected].details.id) {
                    isFound = true; xF = x;
                }
            }
            console.log('prods, offers, isF, xF ', this.state.products, this.props.offers.items, isFound, xF);
            
            if (isFound) {
                this.setState(prevState => ({
                    offer: this.props.offers.items[xF],
                    isSubmitValid: true,
                    isUpdate: true
                }))
            } else {
                const offerNew = this.newOffer();
                this.setState(prevState => ({
                    offer: {
                        ...offerNew,
                        productID: this.state.products[selected].details.id,
                        modelNo: this.state.products[selected].details.modelNo
                    },
                    isSubmitValid: true,
                    isUpdate: false
                }))
                console.log('selected - ', selected);
            }
        } else {
            this.setState({isSubmitValid: false})
        }
    }

    handleChange(field, { target: { value } }) {
        const { offer } = this.state;
        offer[field] = value;
        this.setState({ offer });
    }

    handleDelete = async (e) => {

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
        this.setState( { offer: this.newOffer(), isSubmitValid: false });
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
                            <p>{this.props.offer2update !== null ? 'Update an offer' : (this.state.isUpdate ? 'Update an offer' : 'Add new offer')}</p>
                        </div>
                        <div className="padding15">
                            {console.log('offer2update === ', this.props.offer2update)}
                            {this.props.offer2update === null  && 
                                <div>
                                    <div className="floatRight" onChange={this.updateProductOptions.bind(this)}>
                                        <label htmlFor="noOffers">products with no offer({this.state.productsNoOffer.length})&nbsp;</label>
                                        <input id="noOffers" type="radio" value="noOffers" name="prodtype" defaultChecked />
                                        &nbsp;&nbsp;
                                        <label htmlFor="all">&nbsp;all products({this.state.productsAll.length}) &nbsp;</label>
                                        <input id="all" type="radio" value="all" name="prodtype" />
                                    </div>

                                    <div>
                                        <span>products </span>
                                        <select
                                            value={this.state.selectedOption}
                                            onChange={(e) => {
                                                console.log('e.target.value - ', e.target.value);
                                                
                                                this.setState({ selectedOption: e.target.value },
                                                    () => this.handleSelectOptionChange(this.state.selectedOption));
                                                
                                            }}
                                        >
                                        <option key="-1" value='null'>( please select a product )</option>
                                            {this.state.products.map((aProduct) =>
                                                <option key={aProduct.seqNumb} value={aProduct.seqNumb}>{aProduct.details.name + ' - ' + aProduct.details.modelNo}</option>
                                            )}
                                        </select>
                                    </div>
                                </div>
                            }                          
                            
                            <div className="">
                                <label htmlFor="price">price</label>
                                <input type="text" id="price" value={offer.price} onChange={this.handleChange.bind(this, 'price')} />
                            </div>
                            <div className="">
                                <label htmlFor="available">available</label>
                                <input type="text" id="available" value={offer.available} onChange={this.handleChange.bind(this, 'available')} />
                            </div>
                            <br/>
                            <div className="">
                                <button className="button button1" onClick={this.handleSave} disabled={!this.state.isSubmitValid && !this.props.offer2update}>
                                    {this.props.offer2update !== null ? 'Update' : (this.state.isUpdate ? 'Update' : 'Add new')}
                                </button>
                                <button className="button button1" onClick={this.handleModalCloseOptionSelected}>Cancel</button>
                                <span className="horIndent"></span>
                                {this.props.offer2update !== null &&
                                    <button className="button button1 floatRight" onClick={this.handleDelete}> Delete </button>
                                }
                            </div>
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
                        console.log('data.listOffers.items LEN after read = ', data.listOffers.items.length);
                        console.log('data.listOffers.items after read = ', data.listOffers.items);
                        console.log('createOffer = ', createOffer);

                        // // get latest offers from getCompany
                        // data.listOffers.items = [
                        // ...props.ownProps.offers.items, 
                        // createOffer];

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

