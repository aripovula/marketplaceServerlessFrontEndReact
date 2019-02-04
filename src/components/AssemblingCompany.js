import React, { Component } from "react";
import { graphql, compose } from 'react-apollo'
import { v4 as uuid } from "uuid";
import Modal from 'react-modal';
import numeral from 'numeral';

import QueryGetCompany from "../graphQL/queryGetCompanyOrders";
import QueryAllProducts from "../graphQL/queryAllProducts";
import QueryAllOrders from "../graphQL/queryAllOrders";
import QueryGetOrder from "../graphQL/queryGetOrder";
import MutationCreateOrder from "../graphQL/mutationAddOrder";
import MutationUpdateOrder from "../graphQL/mutationUpdateOrder";
import MutationDeleteOrder from "../graphQL/mutationDeleteOrder";
import NewProductSubscription from '../graphQL/subsriptionProducts';
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
        createOrder: () => null,
        updateOrder: () => null,
        getCompany: () => null,
    }

    constructor(props) {
        super(props);
        const productsListFromStore = this.getLatestProductsList();
        console.log('indexed prs from store', productsListFromStore);
        const noOrderProducts = this.noOrderProducts(productsListFromStore);
        this.state = {
            modalIsOpen: false,
            order: this.newOrder(),
            orders: this.props.company ? this.props.company.orders.items : null,
            products: noOrderProducts,
            productsNoOrder: noOrderProducts,
            productsAll: this.allProducts(productsListFromStore),
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
            order: this.newOrder(),
            products: prevState.productsNoOrder,
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

    newOrder() {
        return {
            companyID: this.props.company ? this.props.company.id : null,
            orderID: uuid(),
            producerID: '',
            productID: '',
            orderTime: Date.now(),
            status: 'INFO_REQUESTED',
            price: 1,
            quantity: 100,
            orderedProductRating: null,
            bestOfferType: 'optimal',
            minProductRating: 4.5
        }
    }

    getLatestProductsList() {
        const { client } = this.props;
        return client.readQuery({
            query: QueryAllProducts
        });
    }

    // prepares array of all products recorded in store for options drop-down
    allProducts(productsListFromStore) {
        console.log('indexed prs from store in MET - ', productsListFromStore.listProducts.items.length, productsListFromStore);
        if (productsListFromStore.listProducts.items.length > 0) {
            const l = productsListFromStore.listProducts.items.length;
            let indexedProductsAll = [];
            for (let x = 0; x < l; x++) {
                indexedProductsAll.push({ seqNumb: x, details: productsListFromStore.listProducts.items[x] })
            }
            return indexedProductsAll;
        } else {
            return [];
        }
    }

    // prepares array of products (for which company did not make an order) recorded in store for options drop-down
    noOrderProducts(productsListFromStore) {

        if (productsListFromStore.listProducts.items.length > 0 && this.props.company && this.props.company.orders.items.length > 0) {
            let coOrders;
            this.props.company.orders.items.forEach((item) => { coOrders = coOrders + item.productID + ';;' });
            const l = productsListFromStore.listProducts.items.length;
            let indexedProductsNoOrder = [];
            let count = 0;
            for (let x = 0; x < l; x++) {
                if (!coOrders.includes(productsListFromStore.listProducts.items[x].id)) {
                    indexedProductsNoOrder.push({
                        seqNumb: count++,
                        details: productsListFromStore.listProducts.items[x]
                    })
                }
            }
            return indexedProductsNoOrder;
        } else {
            return this.allProducts(productsListFromStore);
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
                products: this.state.productsNoOrder,
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
            for (let x = 0; x < this.props.company.orders.items.length; x++) {
                if (this.props.company.orders.items[x].productID === this.state.products[selected].details.id) {
                    isFound = true; xF = x;
                }
            }
            console.log('prods, orders, isF, xF ', this.state.products, this.props.company.orders.items, isFound, xF);

            if (isFound) {
                this.setState(prevState => ({
                    order: this.props.company.orders.items[xF],
                    isSubmitValid: true,
                    isUpdate: true
                }))
            } else {
                const orderNew = this.newOrder();
                this.setState(prevState => ({
                    order: {
                        ...orderNew,
                        productID: prevState.products[selected].details.id,
                        modelNo: prevState.products[selected].details.modelNo
                    },
                    isSubmitValid: true,
                    isUpdate: false
                }))
            }
        } else {
            this.setState({
                order: this.newOrder(),
                isSubmitValid: false,
                isUpdate: false
            })
        }
    }

    // handle user input change
    handleChange(field, { target: { value } }) {
        const { order } = this.state;
        order[field] = value;
        this.setState({ order });
        console.log('handleChange', this.state.order);
    }

    handleBestOfferTypeChange(e) {
        const type = e.target.value;
        this.setState((prevState) => ({ order: { ...prevState.order, bestOfferType: type } })) 
    }

    handlePriceChange(factor) {
        this.setState(prevState => ({ order: { ...prevState.order, price: (prevState.order.price * factor).toFixed(2) } }))
    }

    handleQuantityChange(delta) {
        this.setState(prevState => ({ order: { ...prevState.order, quantity: prevState.order.quantity + delta } }))
    }

    handleRatingChange(value, type) {
        this.setState(prevState => ({ order: { ...prevState.order, minProductRating: type === 1 ? (prevState.order.minProductRating + value).toFixed(1) : value } }))
    }

    handleDelete = async (order, e) => {
        e.preventDefault();
        console.log('order - ', order);
        if (window.confirm(`Are you sure you want to delete order ${order.orderID}`)) {
            this.setState({ loading: true, modalIsOpen: false });
            const { deleteOrder } = this.props;
            console.log('deleteOrder = ', this.props.deleteOrder);
            await deleteOrder(order);
            // this.setState({ loading: false });
            this.handleSync();
        }
    }

    handleSaveNew = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.setState({ loading: true, modalIsOpen: false });

        const { createOrder } = this.props;
        const { order } = this.state;
        console.log('createOrder -', this.props.createOrder);
        console.log('order b4 save -', this.state.order);
        await createOrder({ ...order });
        // this.setState({ loading: false });
        console.log('order after save -', this.state.order);
        this.handleSync();
    }

    handleSaveUpdate = async (e) => {
        this.setState({ loading: true, modalIsOpen: false });
        e.stopPropagation();
        e.preventDefault();

        const { updateOrder } = this.props;
                
        const { order } = this.state;
        console.log('updateOrder -', this.props.updateOrder);
        console.log('order b4 save -', this.state.order);

        await updateOrder({ ...order });
        // this.setState({ loading: false });
        console.log('order after save -', this.state.order);
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

        const productsListFromStore = this.getLatestProductsList();
        console.log('indexed prs from store', productsListFromStore);
        const noOrderProducts = this.noOrderProducts(productsListFromStore);
        this.setState({
            order: this.newOrder(),
            orders: this.props.company.orders.items,
            products: noOrderProducts,
            productsNoOrder: noOrderProducts,
            productsAll: this.allProducts(productsListFromStore),
            isSubmitValid: false,
            isUpdate: false,
            isUpdateAtStart: false,
            selectedOption: -1,
            loading: false
        });
    }

    render() {
        console.log('this.props COT - ', this.props);
        console.log('this.state COT - ', this.state);
        console.log('props.products', this.props.products);
        const { company, loading } = this.props;
        const loadingState = this.state.loading;
        if (this.props.company) {
            const { company: { orders: { items } } } = this.props;
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
                                    const productsListFromStore = this.getLatestProductsList();
                                    const noOrderProducts = this.noOrderProducts(productsListFromStore);
                                    this.setState(() => ({
                                        products: noOrderProducts,
                                        productsNoOrder: noOrderProducts,
                                        productsAll: this.allProducts(productsListFromStore),
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
                                    const productsListFromStore = this.getLatestProductsList();
                                    const noOrderProducts = this.noOrderProducts(productsListFromStore);
                                    this.setState(() => ({
                                        products: noOrderProducts,
                                        productsNoOrder: noOrderProducts,
                                        productsAll: this.allProducts(productsListFromStore),
                                    }));
                                }}>dismiss
                            </span>
                            <hr/>
                        </div>
                    }
                    {company && <div className="">
                        <div className="responsiveFSize">{company.name} - last 4 orders:</div>
                        <span
                            className="addnlightbg notbold cursorpointer"
                            onClick={() => {
                                const productsListFromStore = this.getLatestProductsList();
                                console.log('products in Store', productsListFromStore);
                                const noOrderProducts = this.noOrderProducts(productsListFromStore);
                                this.setState(() => ({
                                    products: noOrderProducts,
                                    productsNoOrder: noOrderProducts,
                                    productsAll: this.allProducts(productsListFromStore),
                                    modalIsOpen: true,
                                    isUpdateAtStart: false
                                }));
                            }}>add order</span>
                        &nbsp;&nbsp;
                        {/*<span
                            className="addnlightbg notbold cursorpointer"
                            onClick={() => {
                                this.handleSync();
                            }}>sync orders</span>
                        &nbsp;&nbsp;*/}

                        <span className="responsiveFSize2">hover this text</span>

                        <table className="smalltable">
                            <tbody>
                                <tr>
                                    <td>&nbsp;</td>
                                    <td>Model #</td>
                                    <td>Price</td>
                                    <td>Rating</td>
                                    <td>quantity</td>
                                    <td>Status</td>
                                </tr>

                                {[].concat(items).sort((a, b) => a.orderID.localeCompare(b.orderID)).map((order) =>
                                    <tr key={order.orderID}>
                                        <td>
                                            <span className="addnlightbg notbold cursorpointer"
                                                onClick={() => {
                                                    this.setState(() => ({
                                                        isUpdateAtStart: true,
                                                        order: JSON.parse(JSON.stringify(order)),
                                                        modalIsOpen: true
                                                    }));
                                                }}>&nbsp;{order.product.name}</span>
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
                                                                name: order.product.name,
                                                                model: order.product.modelNo,
                                                            }
                                                        }));
                                                    }}>&nbsp;{order.product.modelNo}&nbsp;</span>
                                        </td>
                                        <td>&nbsp;{order.price}&nbsp;</td>
                                        <td>4.4</td>
                                        <td>&nbsp;{order.available}&nbsp;</td>
                                        <td>&nbsp;in progress&nbsp;</td>
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
                                    <p>{this.state.isUpdateAtStart ? 'Update an order' : (this.state.isUpdate ? 'Update an order' : 'Add new order')}</p>
                                </div>
                                <div className="padding15 responsiveFSize">
                                    {console.log('isUpdateAtStart === ', this.state.isUpdateAtStart)}
                                    {!this.state.isUpdateAtStart &&
                                        <div>
                                            {/*<div className="floatRight" onChange={this.updateProductOptions.bind(this)}>
                                                <label htmlFor="noOrders">products with no order({this.state.productsNoOrder.length})&nbsp;</label>
                                                <input id="noOrders" type="radio" value="noOrders" name="prodtype" defaultChecked />
                                                &nbsp;&nbsp;
                                                <label htmlFor="all">&nbsp;all products({this.state.productsAll.length}) &nbsp;</label>
                                                <input id="all" type="radio" value="all" name="prodtype" />
                                            </div>*/}

                                            <div>
                                                <span>order </span>
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
                                    <br/>
                                    with:
                                    <div className="" onChange={(e) => this.handleBestOfferTypeChange(e)}>
                                        &nbsp;&nbsp;<input id="optimal" type="radio" value="optimal" name="bestorder" defaultChecked />
                                        <label htmlFor="optimal">&nbsp;cheapest price at min. rating</label>
                                        <br />
                                        &nbsp;&nbsp;<input id="highestrating" type="radio" value="highestrating" name="bestorder" />
                                        <label htmlFor="highestrating">&nbsp;highest rating</label>
                                        <br/>
                                        &nbsp;&nbsp;<input id="cheapest" type="radio" value="cheapest" name="bestorder" />
                                        <label htmlFor="cheapest">&nbsp;cheapest price</label>
                                        <br />
                                        &nbsp;&nbsp;<input id="custom" type="radio" value="custom" name="bestorder" />
                                        <label htmlFor="custom">&nbsp;custom settings</label>                                        

                                    </div>

                                    {(this.state.bestOfferType === 'custom' || this.state.bestOfferType === 'highestrating') &&
                                        <div className="">
                                            <label htmlFor="price">max. price</label>
                                            <input type="text" id="price" value={this.state.order.price} onChange={this.handleChange.bind(this, 'price')} />
                                            <button className="buttonSm button2a" onClick={() => this.handlePriceChange(0.99)}>- 1%</button>&nbsp;
                                            <button className="buttonSm button2a" onClick={() => this.handlePriceChange(1.01)}>+ 1%</button>&nbsp;
                                            <button className="buttonSm button2a" onClick={() => this.handlePriceChange(0.96)}>- 4%</button>&nbsp;
                                            <button className="buttonSm button2a" onClick={() => this.handlePriceChange(1.04)}>+ 4%</button>&nbsp;
                                        </div>
                                    }
                                    <div className="">
                                        <label htmlFor="available">quantity&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
                                        <input type="text" id="available" value={this.state.order.quantity} onChange={this.handleChange.bind(this, 'available')} />
                                        <button className="buttonSm button2a" onClick={() => this.handleQuantityChange(-10)}>- 10</button>&nbsp;
                                        <button className="buttonSm button2a" onClick={() => this.handleQuantityChange(10)}>+ 10</button>&nbsp;
                                        <button className="buttonSm button2a" onClick={() => this.handleQuantityChange(-100)}>- 100</button>&nbsp;
                                        <button className="buttonSm button2a" onClick={() => this.handleQuantityChange(100)}>+ 100</button>&nbsp;
                                        <button className="buttonSm button2a" onClick={() => this.handleQuantityChange(-1000)}>- 1000</button>&nbsp;
                                        <button className="buttonSm button2a" onClick={() => this.handleQuantityChange(1000)}>+ 1000</button>&nbsp;

                                    </div>
                                    {(this.state.bestOfferType === 'custom' || this.state.bestOfferType === 'optimal') &&
                                        <div className="">
                                            <label htmlFor="available">min. rating</label>
                                            <input type="text" id="available" value={this.state.order.minProductRating} onChange={this.handleChange.bind(this, 'available')} />
                                        <button className="buttonSm button2a" onClick={() => this.handleRatingChange(-0.1, 1)}>- 0.1</button>&nbsp;
                                            <button className="buttonSm button2a" onClick={() => this.handleRatingChange(0.1, 1)}>+ 0.1</button>&nbsp;
                                            <button className="buttonSm button2a" onClick={() => this.handleRatingChange(4, 0)}>4.0</button>&nbsp;
                                            <button className="buttonSm button2a" onClick={() => this.handleRatingChange(4.2, 0)}>4.2</button>&nbsp;
                                            <button className="buttonSm button2a" onClick={() => this.handleRatingChange(4.4, 0)}>4.4</button>&nbsp;
                                            <button className="buttonSm button2a" onClick={() => this.handleRatingChange(4.6, 0)}>4.6</button>&nbsp;
                                        </div>
                                    }
                                    <br />
                                    <div className="" onChange={() => this.setState()}>
                                        settlement type: &nbsp;&nbsp;
                                        <label htmlFor="credit">&nbsp;credit&nbsp;</label>
                                        <input id="credit" type="radio" value="credit" name="paymenttype" defaultChecked />
                                        &nbsp;&nbsp;
                                        <label htmlFor="cash">&nbsp;cash&nbsp;</label>
                                        <input id="cash" type="radio" value="cash" name="paymenttype" />
                                            </div>
                                    <br />
                                    <span className="responsiveFSize2a">Warning:&nbsp;</span>
                                    <span className="responsiveFSize2a">first match to your order is a legally binding deal for you and ordering co.</span>
                                    <br /><br />
                                    <div className="">
                                        {console.log(this.state.isSubmitValid, this.state.isUpdateAtStart)}
                                        
                                        {(!this.state.isUpdateAtStart && !this.state.isUpdate) &&
                                            <button className="button button1" onClick={this.handleSaveNew} disabled={!this.state.isSubmitValid}>
                                                Place order
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
                                            <button className="button button1 floatRight" onClick={this.handleDelete.bind(this, this.state.order)}> Delete </button>
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
                console.log('in BBB1 id ', id);
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
        MutationCreateOrder,
        {
            props: (props) => ({
                createOrder: (order) => {
                    console.log('point L1 at createOrder = ', order);
                    return props.mutate({
                        update: (proxy, { data: { createOrder } }) => {
                            console.log('point L2 proxy - ', proxy);
                            // Update QueryAllOrders
                            const query = QueryAllOrders;
                            const data = proxy.readQuery({ query });
                            console.log('query = ', query);
                            console.log('data after read = ', data);
                            console.log('data.listOrders.items LEN after read = ', data.listOrders.items.length);
                            console.log('data.listOrders.items after read = ', data.listOrders.items);
                            console.log('createOrder = ', createOrder);

                            // // get latest orders from getCompany
                            // data.listOrders.items = [
                            // ...props.ownProps.orders.items, 
                            // createOrder];

                            // filter out old one if it is an update
                            data.listOrders.items = [
                                ...data.listOrders.items.filter(e => {
                                    console.log('e = ', e);
                                    console.log('e.orderID = ', e.orderID);
                                    return e.orderID !== createOrder.orderID
                                })
                                , createOrder];

                            console.log('data after filter = ', data);
                            console.log('data.listOrders.items after filter = ', data.listOrders.items);
                            proxy.writeQuery({ query, data });

                            // Create cache entry for QueryGetOrder
                            const query2 = QueryGetOrder;
                            const variables = { id: createOrder.id };
                            const data2 = { getOrder: { ...createOrder } };
                            console.log('point L3 data2 = ', data2);
                            proxy.writeQuery({ query: query2, variables, data: data2 });
                            console.log('point L4 query2 = ', query2);
                            console.log('this.props GQL part -', props);
                        },
                        variables: order,
                        optimisticResponse: () => (
                            {
                                createOrder: {
                                    ...order, __typename: 'Order'
                                }
                            }),
                    })
                }
            })
        }
    ),
    graphql(
        MutationUpdateOrder,
        {
            props: (props) => ({
                updateOrder: (order) => {
                    console.log('point L1 at updateOrder = ', order);
                    return props.mutate({
                        update: (proxy, { data: { updateOrder } }) => {
                            console.log('point L2 proxy - ', proxy);
                            // Update QueryAllOrders
                            const query = QueryAllOrders;
                            const data = proxy.readQuery({ query });
                            console.log('query = ', query);
                            console.log('data after read = ', data);
                            console.log('data.listOrders.items LEN after read = ', data.listOrders.items.length);
                            console.log('data.listOrders.items after read = ', data.listOrders.items);
                            console.log('createOrder = ', updateOrder);

                            // // get latest orders from getCompany
                            // data.listOrders.items = [
                            // ...props.ownProps.orders.items, 
                            // createOrder];

                            // filter out old one if it is an update
                            data.listOrders.items = [
                                ...data.listOrders.items.filter(e => {
                                    console.log('e = ', e);
                                    console.log('e.orderID = ', e.orderID);
                                    return e.orderID !== updateOrder.orderID
                                })
                                , updateOrder];

                            console.log('data after filter = ', data);
                            console.log('data.listOrders.items after filter = ', data.listOrders.items);
                            proxy.writeQuery({ query, data });

                        },
                        variables: order,
                        optimisticResponse: () => (
                            {
                                updateOrder: {
                                    ...order, __typename: 'Order'
                                }
                            }),
                    })
                }
            })
        }
    ),
    graphql(
        MutationDeleteOrder,
        {
            options: {
                update: (proxy, { data: { deleteOrder } }) => {
                    const query = QueryAllOrders;
                    const data = proxy.readQuery({ query });

                    data.listOrders.items = data.listOrders.items.filter(order => order.orderID !== deleteOrder.orderID);

                    proxy.writeQuery({ query, data });
                }
            },
            props: (props) => ({
                deleteOrder: (order) => {
                    console.log('props.ownProps', props.ownProps)
                    return props.mutate({
                        variables: { companyID: props.ownProps.company.id, orderID: order.orderID },
                        optimisticResponse: () => ({
                            deleteOrder: {
                                ...order, __typename: 'Order'
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
