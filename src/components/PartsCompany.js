import React, { Component } from "react";
import { graphql, compose } from 'react-apollo'
import { v4 as uuid } from "uuid";
import Modal from 'react-modal';

import QueryGetCompany from "../graphQL/queryGetCompany";
import QueryAllProducts from "../graphQL/queryAllProducts";
import QueryAllOffers from "../graphQL/queryAllOffers";
import QueryGetOffer from "../graphQL/queryGetOffer";
import MutationCreateOffer from "../graphQL/mutationAddOffer";
import MutationUpdateOffer from "../graphQL/mutationUpdateOffer";
import MutationDeleteOffer from "../graphQL/mutationDeleteOffer";
import NewProductSubscription from '../graphQL/subsriptionProducts'
import Spinner from '../assets/loading2.gif';
import ModalInfo from "./ModalInfo";

// style for loading spinner
var sectionStyle = {
    width: "100%",
    height: "100%",
    backgroundImage: `url(${Spinner})`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover"
};

// style for modal
const customStyles = {
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

class PartsCompany extends Component {

    productSubscription;

    static defaultProps = {
        company: null,
        createOffer: () => null,
        updateOffer: () => null,
        getCompany: () => null,
    }

    constructor(props) {
        super(props);
        const productsListFromProps = this.props.products ? this.props.products : null;
        console.log('indexed prs from store', productsListFromProps);
        const noOfferProducts = this.noOfferProducts(productsListFromProps);
        this.state = {
            modalIsOpen: false,
            offer: this.newOffer(),
            offers: this.props.company ? this.props.company.offers.items : null,
            products: noOfferProducts,
            productsNoOffer: noOfferProducts,
            productsAll: this.allProducts(productsListFromProps),
            isSubmitValid: false,
            isUpdate: false,
            isUpdateAtStart: false,
            selectedOption: -1,
            loading: false,
            infoModalData: null
        };

        this.openModal = this.openModal.bind(this);
        this.handleModalClose = this.handleModalClose.bind(this);
        this.handleInfoModalClose = this.handleInfoModalClose.bind(this);
    }

    componentWillMount() {
        this.productSubscription = this.props.subscribeToNewProducts();
        Modal.setAppElement('body');
    }

    componentWillUnmount() {
        this.productSubscription();
    }

    openModal() {
        this.setState({ modalIsOpen: true });
    }

    handleModalClose() {
        this.setState(prevState => ({
            offer: this.newOffer(),
            products: prevState.productsNoOffer,
            isSubmitValid: false,
            isUpdateAtStart: false,
            isUpdate: false,
            selectedOption: -1,
            modalIsOpen: false
        }));
    }

    handleInfoModalClose() {
        this.setState({ infoModalData: null });
    }

    newOffer() {
        return {
            companyID: this.props.company ? this.props.company.id : null,
            offerID: uuid(),
            productID: '',
            modelNo: '',
            product: null,
            price: 0,
            available: 0
        }
    }

    // prepares array of all products recorded in store for options drop-down
    allProducts(productsListFromProps) {
        console.log('indexed prs from store in MET - ', productsListFromProps.length, productsListFromProps);
        if (productsListFromProps.length > 0) {
            const l = productsListFromProps.length;
            let indexedProductsAll = [];
            for (let x = 0; x < l; x++) {
                indexedProductsAll.push({ seqNumb: x, details: productsListFromProps[x] })
            }
            return indexedProductsAll;
        } else {
            return [];
        }
    }

    // prepares array of products (for which company did not make an offer) recorded in store for options drop-down
    noOfferProducts(productsListFromProps) {
        if (productsListFromProps.length > 0 && this.props.company && this.props.company.offers.items.length > 0) {
            let coOffers;
            this.props.company.offers.items.forEach((item) => { coOffers = coOffers + item.productID + ';;' });
            const l = productsListFromProps.length;
            let indexedProductsNoOffer = [];
            let count = 0;
            for (let x = 0; x < l; x++) {
                if (!coOffers.includes(productsListFromProps[x].id)) {
                    indexedProductsNoOffer.push({
                        seqNumb: count++,
                        details: productsListFromProps[x]
                    })
                }
            }
            return indexedProductsNoOffer;
        } else {
            return this.allProducts(productsListFromProps);
        }
    }

    // update array of products when 'all' or 'no-oder' radio buttons are selected
    updateProductOptions(e) {
        if (e.target.value === 'all') {
            this.setState({
                products: this.state.productsAll,
                selectedOption: -1,
                isSubmitValid: false,
                isUpdateAtStart: false
            }, () => this.handleSelectOptionChange(-1));
        } else {
            this.setState({
                products: this.state.productsNoOffer,
                selectedOption: -1,
                isSubmitValid: false,
                isUpdateAtStart: false
            }, () => this.handleSelectOptionChange(-1));
        }
    }

    filterNewProducts(fromProps, fromState) {
        let newProducts = JSON.parse(JSON.stringify(fromProps));
        fromState.forEach((item) => {
            newProducts = newProducts.filter(prod => prod.id !== item.details.id);
        });
        console.log('newProducts', newProducts);
        return newProducts;
    }

    // update modal UI when certain product is selected in drop-down
    handleSelectOptionChange(selected) {
        console.log('selected - ', selected);
        if (selected > -1) {
            console.log('products[selected]', this.state.products[selected].details);
            let isFound = false; let xF = -1;
            for (let x = 0; x < this.props.company.offers.items.length; x++) {
                if (this.props.company.offers.items[x].productID === this.state.products[selected].details.id) {
                    isFound = true; xF = x;
                }
            }
            console.log('prods, offers, isF, xF ', this.state.products, this.props.company.offers.items, isFound, xF);

            if (isFound) {
                this.setState(prevState => ({
                    offer: this.props.company.offers.items[xF],
                    isSubmitValid: true,
                    isUpdate: true
                }))
            } else {
                const offerNew = this.newOffer();
                this.setState(prevState => ({
                    offer: {
                        ...offerNew,
                        productID: prevState.products[selected].details.id,
                        modelNo: prevState.products[selected].details.modelNo
                    },
                    isSubmitValid: true,
                    isUpdate: false
                }))
            }
        } else {
            this.setState({
                offer: this.newOffer(),
                isSubmitValid: false,
                isUpdate: false
            })
        }
    }

    // handle user input change
    handleChange(field, { target: { value } }) {
        const { offer } = this.state;
        offer[field] = value;
        this.setState({ offer });
        console.log('handleChange', this.state.offer);
    }

    handleDelete = async (offer, e) => {
        e.preventDefault();
        console.log('offer - ', offer);
        if (window.confirm(`Are you sure you want to delete offer ${offer.offerID}`)) {
            this.setState({ loading: true, modalIsOpen: false });
            const { deleteOffer } = this.props;
            console.log('deleteOffer = ', this.props.deleteOffer);
            await deleteOffer(offer);
            // this.setState({ loading: false });
            this.handleSync();
        }
    }

    handleSaveNew = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.setState({ loading: true, modalIsOpen: false });

        const { createOffer } = this.props;
        const { offer } = this.state;
        console.log('createOffer -', this.props.createOffer);
        console.log('offer b4 save -', this.state.offer);
        await createOffer({ ...offer });
        // this.setState({ loading: false });
        console.log('offer after save -', this.state.offer);
        this.handleSync();
    }

    handleSaveUpdate = async (e) => {
        this.setState({ loading: true, modalIsOpen: false });
        e.stopPropagation();
        e.preventDefault();

        const { updateOffer } = this.props;
                
        const { offer } = this.state;
        console.log('updateOffer -', this.props.updateOffer);
        console.log('offer b4 save -', this.state.offer);

        await updateOffer({ ...offer });
        // this.setState({ loading: false });
        console.log('offer after save -', this.state.offer);
        this.handleSync();
    }

    handleSync = async () => {
        const { client } = this.props;
        const query = QueryGetCompany;

        // this.setState({ loading: true });

        console.log('client.query = ', client.query);
        const coId = this.props.company.id;

        await client.query({
            query,
            variables: { id: coId },
            fetchPolicy: 'network-only',
        });

        const productsListFromProps = this.props.products ? this.props.products : null;
        console.log('indexed prs from store', productsListFromProps);
        const noOfferProducts = this.noOfferProducts(productsListFromProps);
        this.setState({
            offer: this.newOffer(),
            offers: this.props.company.offers.items,
            products: noOfferProducts,
            productsNoOffer: noOfferProducts,
            productsAll: this.allProducts(productsListFromProps),
            isSubmitValid: false,
            isUpdate: false,
            isUpdateAtStart: false,
            selectedOption: -1,
            loading: false
        });
    }

    render() {
        console.log('this.props COT - ', this.props);
        console.log('props.products', this.props.products);
        const { company, loading } = this.props;
        const loadingState = this.state.loading;
        if (this.props.company) {
            const { company: { offers: { items } } } = this.props;
            return (
                <div style={(loading || loadingState)  ? sectionStyle : null}>  
                    {/*<img alt="" src={require('../assets/loading.gif')} />   className={`${loading ? 'loading' : ''}`} */}
                    {
                        console.log('props p len', this.props.products.length)
                    }
                    {
                        console.log('state p len', this.state.productsAll.length)
                    }
                    {this.props.products.length !== this.state.productsAll.length &&
                        <div className="responsiveFSizeRed">
                        {this.props.products.length !== 0 && this.state.productsAll.length !== 0 &&
                            (this.props.products.length - this.state.productsAll.length) > 0 &&
                            this.props.products.length - this.state.productsAll.length}&nbsp;
                            new product(s) added&nbsp;&nbsp;
                            <span className="addnlightbg notbold cursorpointer"
                                onClick={() => {
                                    const fromProps = JSON.parse(JSON.stringify(this.props.products));
                                    const fromState = JSON.parse(JSON.stringify(this.state.productsAll));
                                    const productsListFromProps = this.props.products ? this.props.products : null;
                                    const noOfferProducts = this.noOfferProducts(productsListFromProps);
                                    this.setState(() => ({
                                        products: noOfferProducts,
                                        productsNoOffer: noOfferProducts,
                                        productsAll: this.allProducts(productsListFromProps),
                                        infoModalData: {
                                            type: 'newProds',
                                            mainText: 'New product(s) with followings details were added:',
                                            shortText: 'Summary',
                                            newProducts: this.filterNewProducts(fromProps, fromState)
                                        }
                                    }));
                            }}>&nbsp;details&nbsp;&nbsp;&nbsp;
                            </span>
                            <span
                                className="addnlightbg notbold cursorpointer"
                                onClick={() => {
                                    const productsListFromProps = this.props.products ? this.props.products : null;
                                    const noOfferProducts = this.noOfferProducts(productsListFromProps);
                                    this.setState(() => ({
                                        products: noOfferProducts,
                                        productsNoOffer: noOfferProducts,
                                        productsAll: this.allProducts(productsListFromProps),
                                    }));
                                }}>dismiss
                            </span>
                            <hr/>
                        </div>
                    }
                    {company && <div className="">
                        <div className="responsiveFSize">{company.name} - offered products:</div>
                        <span
                            className="addnlightbg notbold cursorpointer"
                            onClick={() => {
                                const productsListFromProps = this.props.products ? this.props.products : null;
                                console.log('products in Store', productsListFromProps);
                                const noOfferProducts = this.noOfferProducts(productsListFromProps);
                                this.setState(() => ({
                                    products: noOfferProducts,
                                    productsNoOffer: noOfferProducts,
                                    productsAll: this.allProducts(productsListFromProps),
                                    modalIsOpen: true,
                                    isUpdateAtStart: false
                                }));
                            }}>add offer</span>
                        &nbsp;&nbsp;
                        {/*<span
                            className="addnlightbg notbold cursorpointer"
                            onClick={() => {
                                this.handleSync();
                            }}>sync offers</span>
                        &nbsp;&nbsp;*/}

                        <span className="responsiveFSize2">hover for more info</span>

                        <table className="smalltable">
                            <tbody>
                                <tr>
                                    <td>&nbsp;</td>
                                    <td>model #</td>
                                    <td>price</td>
                                    <td>rating</td>
                                    <td>available</td>
                                </tr>

                                {[].concat(items).sort((a, b) => a.offerID.localeCompare(b.offerID)).map((offer) =>
                                    <tr key={offer.offerID}>
                                        <td>
                                            <span className="addnlightbg notbold cursorpointer"
                                                onClick={() => {
                                                    this.setState(() => ({
                                                        isUpdateAtStart: true,
                                                        offer: JSON.parse(JSON.stringify(offer)),
                                                        modalIsOpen: true
                                                    }));
                                                }}>&nbsp;{offer.product.name}</span>
                                            &nbsp;
                                        </td>
                                        <td>
                                            <span className="addnlightbg notbold cursorpointer"
                                                    onClick={() => {
                                                        this.setState(() => ({
                                                            infoModalData: {
                                                                type: 'prodSpec',
                                                                mainText: 'Product specification',
                                                                shortText: 'Product specification',
                                                                name: offer.product.name,
                                                                model: offer.product.modelNo,
                                                            }
                                                        }));
                                                    }}>&nbsp;{offer.product.modelNo}&nbsp;</span>
                                        </td>
                                        <td>&nbsp;{offer.price}&nbsp;</td>
                                        <td>4.4</td>
                                        <td>&nbsp;{offer.available}&nbsp;</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>}

                    <div>
                        <Modal
                            isOpen={this.state.modalIsOpen}
                            style={customStyles}
                            contentLabel="Example Modal"
                        >

                            <div className="card-4" >
                                <div className="bggreen">
                                    <p>{this.state.isUpdateAtStart ? 'Update an offer' : (this.state.isUpdate ? 'Update an offer' : 'Add new offer')}</p>
                                </div>
                                <div className="padding15">
                                    {console.log('isUpdateAtStart === ', this.state.isUpdateAtStart)}
                                    {!this.state.isUpdateAtStart &&
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
                                        <input type="text" id="price" value={this.state.offer.price} onChange={this.handleChange.bind(this, 'price')} />
                                    </div>
                                    <div className="">
                                        <label htmlFor="available">available</label>
                                        <input type="text" id="available" value={this.state.offer.available} onChange={this.handleChange.bind(this, 'available')} />
                                </div>
                                    <br />
                                    <div className="">
                                        {console.log(this.state.isSubmitValid, this.state.isUpdateAtStart)}
                                        
                                        {(!this.state.isUpdateAtStart && !this.state.isUpdate) &&
                                            <button className="button button1" onClick={this.handleSaveNew} disabled={!this.state.isSubmitValid}>
                                                Add new
                                            </button>
                                        }
                                        
                                        {(this.state.isUpdateAtStart || this.state.isUpdate) &&
                                            <button className="button button1" onClick={this.handleSaveUpdate} disabled={!this.state.isSubmitValid && !this.state.isUpdateAtStart}>
                                                Update
                                            </button>
                                        }
                                        
                                        <button className="button button1" onClick={this.handleModalClose}>Cancel</button>
                                        <span className="horIndent"></span>
                                        {(this.state.isUpdateAtStart || this.state.isUpdate) &&
                                            <button className="button button1 floatRight" onClick={this.handleDelete.bind(this, this.state.offer)}> Delete </button>
                                        }
                                    </div>
                                </div>
                            </div>
                        </Modal>
                        {this.state.infoModalData &&
                            <ModalInfo
                                data={this.state.infoModalData}
                                handleInfoModalClose={this.handleInfoModalClose}
                            />
                        }
                    </div>
                </div>
            );
        } else {
            return (
                <div>Loading ...</div>
            )
        }
    }
}

export default compose (
    graphql(
        QueryGetCompany,
        {
            options: function ({ id }) {
                console.log('in BBB1');
                return ({
                    variables: { id },
                    fetchPolicy: 'cache-and-network',
                })
            },
            props: ({ data: { getCompany: company, loading } }) => {
                console.log('in BBB2 data -', company, loading);
                return ({
                    company,
                    loading,
                })
            },
        },
    ),
    graphql(
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
                            console.log('this.props GQL part -', props);
                        },
                        variables: offer,
                        optimisticResponse: () => (
                            {
                                createOffer: {
                                    ...offer, __typename: 'Offer'
                                }
                            }),
                    })
                }
            })
        }
    ),
    graphql(
        MutationUpdateOffer,
        {
            props: (props) => ({
                updateOffer: (offer) => {
                    console.log('point L1 at updateOffer = ', offer);
                    return props.mutate({
                        update: (proxy, { data: { updateOffer } }) => {
                            console.log('point L2 proxy - ', proxy);
                            // Update QueryAllOffers
                            const query = QueryAllOffers;
                            const data = proxy.readQuery({ query });
                            console.log('query = ', query);
                            console.log('data after read = ', data);
                            console.log('data.listOffers.items LEN after read = ', data.listOffers.items.length);
                            console.log('data.listOffers.items after read = ', data.listOffers.items);
                            console.log('createOffer = ', updateOffer);

                            // // get latest offers from getCompany
                            // data.listOffers.items = [
                            // ...props.ownProps.offers.items, 
                            // createOffer];

                            // filter out old one if it is an update
                            data.listOffers.items = [
                                ...data.listOffers.items.filter(e => {
                                    console.log('e = ', e);
                                    console.log('e.offerID = ', e.offerID);
                                    return e.offerID !== updateOffer.offerID
                                })
                                , updateOffer];

                            console.log('data after filter = ', data);
                            console.log('data.listOffers.items after filter = ', data.listOffers.items);
                            proxy.writeQuery({ query, data });

                        },
                        variables: offer,
                        optimisticResponse: () => (
                            {
                                updateOffer: {
                                    ...offer, __typename: 'Offer'
                                }
                            }),
                    })
                }
            })
        }
    ),
    graphql(
        MutationDeleteOffer,
        {
            options: {
                update: (proxy, { data: { deleteOffer } }) => {
                    const query = QueryAllOffers;
                    const data = proxy.readQuery({ query });

                    data.listOffers.items = data.listOffers.items.filter(offer => offer.offerID !== deleteOffer.offerID);

                    proxy.writeQuery({ query, data });
                }
            },
            props: (props) => ({
                deleteOffer: (offer) => {
                    console.log('props.ownProps', props.ownProps)
                    return props.mutate({
                        variables: { companyID: props.ownProps.company.id, offerID: offer.offerID },
                        optimisticResponse: () => ({
                            deleteOffer: {
                                ...offer, __typename: 'Offer'
                            }
                        }),
                    });
                }
            })
        }
    ),
    graphql(QueryAllProducts, {
        options: {
            fetchPolicy: 'cache-and-network'
        },
        props: props => ({
            products: props.data.listProducts ? props.data.listProducts.items : [],
            subscribeToNewProducts: params => {
                props.data.subscribeToMore({
                    document: NewProductSubscription,
                    updateQuery: (prev, { subscriptionData: { data: { onCreateProduct } } }) => {
                        console.log('onCreateProduct - ', onCreateProduct);
                        return {
                            ...prev,
                            listProducts: {
                                __typename: 'ProductConnection',
                                items: [onCreateProduct, ...prev.listProducts.items.filter(product => product.id !== onCreateProduct.id)]
                            }
                        }
                    }
                })
            }
        })
    })

)(PartsCompany);
