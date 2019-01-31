import React, { Component } from "react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import { v4 as uuid } from "uuid";
import Modal from 'react-modal';

import QueryGetCompany from "../graphQL/queryGetCompanyAndProducts";
import QueryAllProducts from "../graphQL/queryAllProducts";
// import QueryAllOffers from "../graphQL/queryAllOffers";

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

    static defaultProps = {
        company: null,
        createOffer: () => null,
        getCompany: () => null,
    }

    constructor(props) {
        super(props);
        const productsListFromStore = this.getLatestProductsList();
        console.log('indexed prs from store', productsListFromStore);
        const noOfferProducts = this.noOfferProducts(productsListFromStore);
        this.state = {
            shortText: 'offer details',
            modalIsOpen: false,
            offer: this.newOffer(),
            offers: this.props.company.offers.items,
            products: noOfferProducts,
            productsNoOffer: noOfferProducts,
            productsAll: this.allProducts(productsListFromStore),
            isSubmitValid: false,
            isUpdate: false,
            isUpdateAtStart: false,
            selectedOption: -1,

        };

        this.openModal = this.openModal.bind(this);
        this.handleModalClose = this.handleModalClose.bind(this);
    }

    componentWillMount() {
        Modal.setAppElement('body');
        // this.handleSync();
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

    newOffer() {
        return {
            companyID: this.props.company.id,
            offerID: uuid(),
            productID: '',
            modelNo: '',
            product: null,
            price: 0,
            available: 0
        }
    }

    getLatestProductsList() {
        const { client } = this.props;
        return client.readQuery({
            query: QueryAllProducts
        });
    }

    allProducts(productsListFromStore) {
        console.log('indexed prs from store in MET - ', productsListFromStore.listProducts.items.length, productsListFromStore);
        if (productsListFromStore.listProducts.items.length > 0) {
            const l = productsListFromStore.listProducts.items.length;
            let indexedProductsAll = [];
            for (let x = 0; x < l; x++) {
                indexedProductsAll.push({ seqNumb: x, details: productsListFromStore.listProducts.items[x] })
                console.log('indexedProducts - ', x, indexedProductsAll);
                // console.log('indexedProducts[x] - ', productsListFromStore[x]);
            }
            console.log('indexedProducts - ', indexedProductsAll);

            return indexedProductsAll;
        } else {
            return [];
        }
    }

    noOfferProducts(productsListFromStore) {
        if (productsListFromStore.listProducts.items.length > 0) {
            let coOffers;
            this.props.company.offers.items.forEach((item) => { coOffers = coOffers + item.productID + ';;' });
            // console.log('tsNoOf coOffers - ', coOffers);
            const l = productsListFromStore.listProducts.items.length;
            let indexedProductsNoOffer = [];
            let count = 0;
            for (let x = 0; x < l; x++) {
                if (!coOffers.includes(productsListFromStore.listProducts.items[x].id)) {
                    indexedProductsNoOffer.push({
                        seqNumb: count++,
                        details: productsListFromStore.listProducts.items[x]
                    })
                    // console.log('indexedProductsNoOf - ', x, indexedProductsNoOffer);
                    // console.log('indexedProductsNoOf[x] - ', productsListFromStore[x]);
                }
            }
            console.log('indexedProductsNoOf - ', indexedProductsNoOffer);
            return indexedProductsNoOffer;
        } else {
            return [];
        }
    }

    updateProductOptions(e) {
        // console.log('e-', e.target.value);

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
                        productID: this.state.products[selected].details.id,
                        modelNo: this.state.products[selected].details.modelNo
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
        this.setState({ offer: this.newOffer(), isSubmitValid: false });
        this.props.handleModalClose();
        // history.push('/newoffer');
    }

    handleSync = async () => {
        const { client } = this.props;
        const query = QueryGetCompany;

        this.setState({ busy: true });

        console.log('client.query = ', client.query);
        const coId = this.props.company.id;

        await client.query({
            query,
            variables: { id: coId },
            fetchPolicy: 'network-only',
        });

        // await result = client.query({ query: YOUR_QUERY, variables: {});

        this.setState({ busy: false });
    }

    render() {
        console.log('this.props COT - ', this.props);
        // console.log('modelNo', this.props.products[0].modelNo);
        // console.log('QueryGetCompany = ', QueryGetCompany);
        // const { client } = this.props;
        // const data22 = client.readQuery({
        //     query: QueryAllOffers
        // });
        // console.log('all offers ? - ', data22);
        // const data23 = client.readFragment({
        //     id: '653fbaef-9655-4ec6-a1e4-f0073cd78c8b',
        //     fragment: gql`
        //         fragment aCo on QueryGetCompany {
        //             id
        //             name
        //         }
        //     `,
        // });        
        // console.log('a company ? - ', data23);

        const { company, loading } = this.props;
        if (this.props.company) {
            const { company: { offers: { items } } } = this.props;
            return (
                <div className={`${loading ? 'loading' : ''}`}>
                    {company && <div className="">
                        <div className="responsiveFSize">{company.name} - offered products:</div>
                        <span
                            className="addnlightbg notbold cursorpointer"
                            onClick={() => {
                                this.setState(() => ({ modalIsOpen: true, isUpdateAtStart: false }));
                            }}>add offer</span>
                        &nbsp;&nbsp;
                        <span
                            className="addnlightbg notbold cursorpointer"
                            onClick={() => {
                                this.handleSync();
                            }}>sync offers</span>
                        &nbsp;&nbsp;

                        <span className="responsiveFSize2">to update click product name</span>

                        <table className="smalltable">
                            <tbody>
                                <tr>
                                    <td>&nbsp;</td>
                                    <td>Model #</td>
                                    <td>Price</td>
                                    <td>Rating</td>
                                    <td>Available</td>
                                </tr>

                                {[].concat(items).sort((a, b) => a.offerID.localeCompare(b.offerID)).map((offer) =>
                                    <tr key={offer.offerID}>
                                        <td>
                                            <span className="addnlightbg notbold cursorpointer"
                                                onClick={() => {
                                                    this.setState(() => ({ isUpdateAtStart: true, offer, modalIsOpen: true }));
                                                }}>&nbsp;{offer.product.name}</span>
                                            &nbsp;
                                        </td>
                                        <td>&nbsp;{offer.product.modelNo}&nbsp;</td>
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
                                        <button className="button button1" onClick={this.handleSave} disabled={!this.state.isSubmitValid && !this.state.isUpdateAtStart}>
                                            {this.state.isUpdateAtStart ? 'Update' : (this.state.isUpdate ? 'Update' : 'Add new')}
                                        </button>
                                        <button className="button button1" onClick={this.handleModalClose}>Cancel</button>
                                        <span className="horIndent"></span>
                                        {(this.state.isUpdateAtStart || this.state.isUpdate) &&
                                            <button className="button button1 floatRight" onClick={this.handleDelete}> Delete </button>
                                        }
                                    </div>
                                </div>
                            </div>
                        </Modal>
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

export default graphql(
    QueryGetCompany,
    {
        options: function ({ id }) {
            console.log('in BBB1');
            return ({
                variables: { id },
                fetchPolicy: 'cache-and-network',
            })
        },
        props: ({ data: { getCompany: company, listProducts = { items: [] }, loading } }) => {
            console.log('in BBB2 data -', company, listProducts, loading);
            return ({
                company,
                products: listProducts.items,
                loading,
            })
        },
    },
)(PartsCompany);
