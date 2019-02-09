import React, { Component } from "react";
import { graphql, compose } from 'react-apollo'
import { v4 as uuid } from "uuid";
import Modal from 'react-modal';
import numeral from 'numeral';

import QueryGetCompany from "../graphQL/queryGetCompanyOrders";
import QueryAllProducts from "../graphQL/queryAllProducts";
import QueryAllOrders from "../graphQL/queryAllOrders";
import QueryAllReOrderRules from "../graphQL/queryAllReorderRules";
import QueryGetOrder from "../graphQL/queryGetOrder";
import QueryGetReOrderRule from "../graphQL/queryGetReorderRule";
import MutationCreateOrder from "../graphQL/mutationAddOrder";
import MutationCreateReOrderRule from "../graphQL/mutationAddReorderRule";
import MutationUpdateOrder from "../graphQL/mutationUpdateOrder";
import MutationUpdateReOrderRule from "../graphQL/mutationUpdateReorderRule";
import MutationDeleteOrder from "../graphQL/mutationDeleteOrder";
import MutationDeleteReOrderRule from "../graphQL/mutationDeleteReorderRule";
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
        top: '40%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '60%',
        padding: '1%',
        margin: '4%'
    }
};

class AssemblingCompany extends Component {

    productSubscription;

    static defaultProps = {
        company: null,
        createOrder: () => null,
        createReOrderRule: () => null,
        updateOrder: () => null,
        updateReOrderRule: () => null,
        getCompany: () => null,
    }

    constructor(props) {
        super(props);
        const productsListFromProps = this.props.products ? this.props.products : null;
        console.log('indexed prs from store', productsListFromProps);
        console.log('props in CONSt', this.props);
        const noOrderProducts = this.noOrderProducts(productsListFromProps);
        this.state = {
            modalIsOpen: false,
            order: this.newOrder(),
            orders: (this.props.company && this.props.company.orders) ? this.props.company.orders.items : null,
            products: noOrderProducts,
            productsNoOrder: noOrderProducts,
            productsAll: this.allProducts(productsListFromProps),
            isSubmitValid: false,
            isUpdate: false,
            isUpdateAtStart: false,
            selectedOption: -1,
            isBothOrOrderOnly: 0,
            loading: false,
            infoModalData: null
        };

        this.openModal = this.openModal.bind(this);
        this.handleModalClose = this.handleModalClose.bind(this);
        this.handleInfoModalClose = this.handleInfoModalClose.bind(this);
        this.updateOrderType = this.updateOrderType.bind(this);
        this.updateSettlementType = this.updateSettlementType.bind(this);
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
            reorderRuleID: uuid(),
            productID: '',
            product: null,
            status: 'ORDER_PLACED',
            // price: 20,
            maxPrice: 20,
            quantity: 100,
            bestOfferType: 'OPTIMAL',
            secondBestOfferType: 'CHEAPEST',
            minProductRating: 4.5,
            isCashPayment: false,
            isRuleEffective: true,
            reorderLevel: 50,
            reorderQnty: 250
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

    // prepares array of products (for which company did not make an order) recorded in store for options drop-down
    noOrderProducts(productsListFromProps) {

        if (productsListFromProps.length > 0 && this.props.company && this.props.company.orders && this.props.company.orders.items.length > 0) {
            let coOrders;
            this.props.company.orders.items.forEach((item) => { coOrders = coOrders + item.productID + ';;' });
            const l = productsListFromProps.length;
            let indexedProductsNoOrder = [];
            let count = 0;
            for (let x = 0; x < l; x++) {
                if (!coOrders.includes(productsListFromProps[x].id)) {
                    indexedProductsNoOrder.push({
                        seqNumb: count++,
                        details: productsListFromProps[x]
                    })
                }
            }
            return indexedProductsNoOrder;
        } else {
            return this.allProducts(productsListFromProps);
        }
    }

    updateSettlementType(e) {
        const isCashPayment = e.target.value === 'true';
        console.log('isCashPayment', isCashPayment, e.target.value );
        this.setState(prevState => ({
            order: {
                ...prevState.order,
                isCashPayment
            }
        }));
    }

    updateOrderType(e) {
        const isBothOrOrderOnly = parseInt(e.target.value);
        console.log('isBothOrOrderOnly', isBothOrOrderOnly, e.target.value);
        this.setState({
            isBothOrOrderOnly
        });
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

    getThresholdText(orderRule) {
        let text = '';
        switch (orderRule.bestOfferType) {
            case 'OPTIMAL':
                text = `$: min, R: ${orderRule.minProductRating}-min`;
                break;
            case 'HIGHESTRATING':
                text = `$: ${orderRule.maxPrice}-max, R: max`;
                break;
            case 'CHEAPEST':
                text = `$: min, R: any`;
                break;
            case 'CUSTOM':
                text = `$: ${orderRule.maxPrice}-max, R: ${orderRule.minProductRating}-min`;
                break;
        
            default:
                break;
        }
        text = `${text}, RO: ${orderRule.reorderQnty} @ ${orderRule.reorderLevel}`
        console.log('threshold', text);
        return text;
    }

    // update modal UI when certain product is selected in drop-down
    handleSelectOptionChange(selected) {
        console.log('selected - ', selected);
        if (selected > -1 ) {
            console.log('products[selected]', this.state.productsAll[selected]);
            let isFound = false; let xF = -1;
            if (this.props.company.orders) {
                for (let x = 0; x < this.props.company.orders.items.length; x++) {
                    if (this.props.company.orders.items[x].productID === this.state.productsAll[selected].details.id) {
                        isFound = true; xF = x;
                    }
                }
            }
            // console.log('prods, orders, isF, xF ', this.state.products, this.props.company.orders.items, isFound, xF);

            if (isFound) {
                this.setState(prevState => ({
                    order: this.props.company.orders ? this.props.company.orders.items[xF] : null,
                    isSubmitValid: true,
                    isUpdate: true
                }))
            } else {
                const orderNew = this.newOrder();
                this.setState(prevState => ({
                    order: {
                        ...orderNew,
                        productID: prevState.productsAll[selected].details.id,
                        modelNo: prevState.productsAll[selected].details.modelNo
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
        this.setState((prevState) => ({ order: { ...prevState.order, bestOfferType: type } }));
    }

    handlePriceChange(factor) {
        let newPrice = (parseFloat(this.state.order.maxPrice) * parseFloat(factor)).toFixed(2);
        newPrice = parseFloat(newPrice) < 0 ? 0.00 : newPrice;
        this.setState(prevState => ({ order: { ...prevState.order, maxPrice: newPrice} }))
    }

    handleQuantityChange(delta) {
        let newQuantity = parseInt(this.state.order.quantity) + parseInt(delta);
        newQuantity = parseInt(newQuantity) < 0 ? 0 : newQuantity;
        this.setState(prevState => ({ order: { ...prevState.order, quantity: newQuantity} }))
    }

    handleRatingChange(val, type) {
        let newRating = type === 1 ? (parseFloat(this.state.order.minProductRating) + parseFloat(val)).toFixed(1) : parseFloat(val);
        newRating = newRating > 5 ? 5.0 : newRating;
        newRating = newRating < 0 ? 0.0 : newRating;
        this.setState(prevState => ({ order: { ...prevState.order, minProductRating: newRating } }))
    }

    handleReorderQntyChange(delta) {
        let newQuantity = parseInt(this.state.order.reorderQnty) + parseInt(delta);
        newQuantity = parseInt(newQuantity) < 0 ? 0 : newQuantity;
        this.setState(prevState => ({ order: { ...prevState.order, reorderQnty: newQuantity } }))
    }

    handleReorderLevelChange(delta) {
        let newQuantity = parseInt(this.state.order.reorderLevel) + parseInt(delta);
        newQuantity = parseInt(newQuantity) < 0 ? 0 : newQuantity;
        this.setState(prevState => ({ order: { ...prevState.order, reorderLevel: newQuantity } }))
    }

    handleSuspend = async (order, e) => {
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

    handleDelete = async (order, e) => {
        e.preventDefault();
        console.log('order - ', order);
        if (this.state.isBothOrOrderOnly === 1) {
            if (window.confirm(`Are you sure you want to delete order ${order.orderID}`)) {
                this.setState({ loading: true, modalIsOpen: false });
                const { deleteOrder } = this.props;
                console.log('deleteOrder = ', this.props.deleteOrder);
                await deleteOrder(order);
                // this.setState({ loading: false });
                this.handleSync();
            }
        } else if (this.state.isBothOrOrderOnly === 2) {
            if (window.confirm(`Are you sure you want to delete re-order rule ${order.reorderRuleID}`)) {
                this.setState({ loading: true, modalIsOpen: false });
                const { deleteReOrderRule } = this.props;
                console.log('deleteOrder = ', deleteReOrderRule);
                await deleteReOrderRule(order);
                // this.setState({ loading: false });
                this.handleSync();
            }        
        }
    }

    handleSaveNew = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.setState({ loading: true, modalIsOpen: false });
        console.log('handle save state', this.state);
        console.log('isBothOrOrderOnly', this.state.isBothOrOrderOnly);
        
        if (this.state.isBothOrOrderOnly === 1) {
            const { createOrder } = this.props;
            const { order } = this.state;

            console.log('createOrder -', createOrder);
            console.log('order b4 save -', order);
            await createOrder({ ...order });
            // this.setState({ loading: false });
        } else if (this.state.isBothOrOrderOnly === 2) {
            const { createReOrderRule } = this.props;
            const { order } = this.state;

            console.log('createReOrderRule -', createReOrderRule);
            console.log('order b4 save -', order);
            await createReOrderRule({ ...order });            
            // this.setState({ loading: false });
        }
        console.log('order after save -', this.state.order);
        this.handleSync();
    }

    handleSaveUpdate = async (e) => {
        this.setState({ loading: true, modalIsOpen: false });
        e.stopPropagation();
        e.preventDefault();

        const { order } = this.state;
        console.log('handle save state', this.state);
        console.log('handle save order', order);
        console.log('isBothOrOrderOnly', this.state.isBothOrOrderOnly);

        if (this.state.isBothOrOrderOnly === 1) {

            const { updateOrder } = this.props;
                    
            console.log('updateOrder -', this.props.updateOrder);
            console.log('order b4 save -', this.state.order);

            await updateOrder({ ...order });

        } else if (this.state.isBothOrOrderOnly === 2) {
            const { updateReOrderRule } = this.props;
            console.log('updateReOrderRule -', this.props.updateOrder);
            console.log('order b4 save -', this.state.order);
            await updateReOrderRule({ ...order });
        }
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

        const productsListFromProps = this.props.products ? this.props.products : null;
        console.log('indexed prs from store', productsListFromProps);
        const noOrderProducts = this.noOrderProducts(productsListFromProps);
        this.setState({
            order: this.newOrder(),
            orders: this.props.company.orders ? this.props.company.orders.items : null,
            products: noOrderProducts,
            productsNoOrder: noOrderProducts,
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
        console.log('this.state COT - ', this.state);
        console.log('props.products', this.props.products);
        const { company, loading } = this.props;
        const loadingState = this.state.loading;
        if (this.props.company) {
            // const { company: { orders: { items } } } = this.props;
            const items = this.props.company.orders ? this.props.company.orders.items : null;
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
                                    const noOrderProducts = this.noOrderProducts(productsListFromProps);
                                    this.setState(() => ({
                                        products: noOrderProducts,
                                        productsNoOrder: noOrderProducts,
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
                                    const noOrderProducts = this.noOrderProducts(productsListFromProps);
                                    this.setState(() => ({
                                        products: noOrderProducts,
                                        productsNoOrder: noOrderProducts,
                                        productsAll: this.allProducts(productsListFromProps),
                                    }));
                                }}>dismiss
                            </span>
                            <hr/>
                        </div>
                    }
                    {company && <div className="">
                        <span className="responsiveFSize">{company.name}</span>
                        <span
                            className="addnlightbg notbold cursorpointer"
                            onClick={() => {
                                const productsListFromProps = this.props.products ? this.props.products : null;
                                console.log('products in Store', productsListFromProps);
                                const noOrderProducts = this.noOrderProducts(productsListFromProps);
                                this.setState(() => ({
                                    products: noOrderProducts,
                                    productsNoOrder: noOrderProducts,
                                    productsAll: this.allProducts(productsListFromProps),
                                    modalIsOpen: true,
                                    isUpdateAtStart: false
                                }));
                            }}>&nbsp;&nbsp;add order / order rule</span>
                        &nbsp;&nbsp;
                        {/*<span
                            className="addnlightbg notbold cursorpointer"
                            onClick={() => {
                                this.handleSync();
                            }}>sync orders</span>
                        &nbsp;&nbsp;*/}
                        
                        <table className="smalltable">
                            <tbody>
                                <tr>
                                    <td>product</td>
                                    <td>reorder rule</td>
                                    <td>left</td>
                                </tr>

                                {this.props.company.reOrderRules.items && [].concat(this.props.company.reOrderRules.items).sort((a, b) => 
                                    a.product.name.localeCompare(b.product.name)).map((orderRule) =>
                                        <tr key={orderRule.reorderRuleID}>
                                        <td>
                                            <span className="addnlightbg notbold cursorpointer"
                                                onClick={() => {
                                                    this.setState(() => ({
                                                        isUpdateAtStart: true,
                                                        order: JSON.parse(JSON.stringify(orderRule)),
                                                        isBothOrOrderOnly: 2,
                                                        modalIsOpen: true
                                                    }));
                                                }}>&nbsp;{orderRule.product.name} {orderRule.product.modelNo}
                                            </span>
                                        </td>
                                        <td>&nbsp;{this.getThresholdText(orderRule)}&nbsp;</td>
                                        <td>{orderRule.reorderQnty}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <span className="verIndent"></span>
                        <table className="smalltable">
                            <tbody>
                                <tr>
                                    <td>product</td>
                                    <td>reorder rule</td>
                                    <td>left</td>
                                </tr>

                                {items && [].concat(items).sort((a, b) => a.orderID.localeCompare(b.orderID)).map((order) =>
                                    <tr key={order.orderID}>
                                        <td>
                                            <span className="addnlightbg notbold cursorpointer"
                                                onClick={() => {
                                                    this.setState(() => ({
                                                        isUpdateAtStart: true,
                                                        order: JSON.parse(JSON.stringify(order)),
                                                        isBothOrOrderOnly: 1,
                                                        modalIsOpen: true
                                                    }));
                                                }}>&nbsp;{order.product.name}</span>
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
                                                    }}>&nbsp;{order.product.modelNo}</span>
                                        </td>
                                        
                                        <td>&nbsp;'a'&nbsp;</td>
                                        <td>{order.quantity}</td>
                                        {/*<td>&nbsp;{order.quantity}&nbsp;</td>
                                        <td>{order.status.toLowerCase()}</td>*/}

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
                                    <p>{this.state.isUpdateAtStart ? 'Update re-order rule' : (this.state.isUpdate ? 'Update re-order rule' : 'Add new order / re-order rule')}</p>
                                </div>
                                <div className="padding15 responsiveFSize">
                                    {!this.state.isUpdateAtStart && <span></span>}
                                    <div>
                                        {/*<div className="floatRight" onChange={this.updateProductOptions.bind(this)}>
                                                <label htmlFor="noOrders">products with no order({this.state.productsNoOrder.length})&nbsp;</label>
                                                <input id="noOrders" type="radio" value="noOrders" name="prodtype" defaultChecked />
                                                &nbsp;&nbsp;
                                                <label htmlFor="all">&nbsp;all products({this.state.productsAll.length}) &nbsp;</label>
                                                <input id="all" type="radio" value="all" name="prodtype" />
                                            </div>*/}

                                        {this.state.isUpdateAtStart && <div>(Re)order `'{this.state.order.product.name} - {this.state.order.product.modelNo}'`</div>}
                                        {!this.state.isUpdateAtStart &&
                                            <div>
                                                <span>Product to order </span>
                                                <select
                                                    value={this.state.selectedOption}
                                                    onChange={(e) => {
                                                        console.log('e.target.value - ', e.target.value);

                                                        this.setState({ selectedOption: e.target.value },
                                                            () => this.handleSelectOptionChange(this.state.selectedOption));

                                                    }}
                                                >
                                                    <option key="-1" value='null'>( please select a product )</option>
                                                    {this.state.productsAll.map((aProduct) =>
                                                        <option key={aProduct.seqNumb} value={aProduct.seqNumb}>{aProduct.details.name + ' - ' + aProduct.details.modelNo}</option>
                                                    )}
                                                </select>
                                            </div>
                                        }

                                    {console.log('isUpdateAtStart === ', this.state.isUpdateAtStart)}

                                        </div>

                                    <br/>
                                    {(this.state.selectedOption > -1 || this.state.isUpdateAtStart) &&
                                      <div>
                                        {!this.state.isUpdateAtStart &&
                                            <div className="" onChange={this.updateOrderType.bind(this)}>
                                            <label htmlFor="both">one-off order + re-order rule&nbsp;</label>
                                            <input id="both" type="radio" value="0" name="orderType" defaultChecked />
                                            &nbsp;&nbsp;
                                            <label htmlFor="oneoff">&nbsp;one-off order only&nbsp;</label>
                                            <input id="oneoff" type="radio" value="1" name="orderType" />
                                            &nbsp;&nbsp;
                                            <label htmlFor="ruleonly">&nbsp;re-order rule only&nbsp;</label>
                                            <input id="ruleonly" type="radio" value="2" name="orderType" />
                                            </div>
                                        }
                                        <br />
                                        {this.state.isBothOrOrderOnly === 0 && !this.state.isUpdateAtStart &&
                                            <div><div>( below settings apply to initial order and subsequent re-orders )</div><br /></div>}

                                        Order product with following terms:
                                        {(this.state.order.bestOfferType === 'OPTIMAL' || this.state.order.bestOfferType === 'CUSTOM') &&
                                            <div className="floatRight">
                                                <span>if no offer is found fallback to </span>
                                                <select
                                                    value={this.state.secondBestOfferType}
                                                    onChange={(e) => {
                                                        const secondBestOfferType = e.target.value;
                                                        this.setState(prevState => ({
                                                            order: {
                                                                ...prevState.order,
                                                                secondBestOfferType
                                                            }
                                                        }));
                                                    }}
                                                >
                                                <option key="0" value='CHEAPEST'>cheapest (default)</option>
                                                <option key="1" value='HIGHESTRATING'>highest rated</option>
                                                </select>
                                            </div>
                                        }

                                        <div className="" onChange={(e) => this.handleBestOfferTypeChange(e)}>
                                            &nbsp;&nbsp;<input id="optimal" type="radio" value="OPTIMAL" name="bestorder" defaultChecked />
                                            <label htmlFor="optimal">&nbsp;cheapest price at min. rating</label>
                                            <br />
                                            &nbsp;&nbsp;<input id="cheapest" type="radio" value="CHEAPEST" name="bestorder" />
                                            <label htmlFor="cheapest">&nbsp;cheapest price</label>
                                            <br />
                                            &nbsp;&nbsp;<input id="highestrating" type="radio" value="HIGHESTRATING" name="bestorder" />
                                            <label htmlFor="highestrating">&nbsp;highest rating</label>
                                            <br/>
                                            &nbsp;&nbsp;<input id="custom" type="radio" value="CUSTOM" name="bestorder" />
                                            <label htmlFor="custom">&nbsp;custom settings</label>                                        
    
                                        </div>
    
                                        {(this.state.order.bestOfferType === 'CUSTOM' || this.state.order.bestOfferType === 'HIGHESTRATING') &&
                                            <div className="">
                                                <label htmlFor="price">max. price</label>
                                            <input type="text" id="price" value={this.state.order.maxPrice} onChange={this.handleChange.bind(this, 'maxPrice')} />
                                                <button className="buttonSm button2a" onClick={() => this.handlePriceChange(0.99)}>- 1%</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handlePriceChange(1.01)}>+ 1%</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handlePriceChange(0.96)}>- 4%</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handlePriceChange(1.04)}>+ 4%</button>&nbsp;
                                            </div>
                                        }
                                        {(this.state.order.bestOfferType === 'CUSTOM' || this.state.order.bestOfferType === 'OPTIMAL') &&
                                            <div className="">
                                            <label htmlFor="minProductRating">min. rating</label>
                                                <input type="text" id="minProductRating" value={this.state.order.minProductRating} onChange={this.handleChange.bind(this, 'minProductRating')} />
                                                <button className="buttonSm button2a" onClick={() => this.handleRatingChange(-0.1, 1)}>- 0.1</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handleRatingChange(0.1, 1)}>+ 0.1</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handleRatingChange(4, 0)}>4.0</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handleRatingChange(4.2, 0)}>4.2</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handleRatingChange(4.4, 0)}>4.4</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handleRatingChange(4.6, 0)}>4.6</button>&nbsp;
                                            </div>
                                        }
                                        <br/>
                                        {console.log('both conds', !this.state.isUpdateAtStart, !(this.state.isBothOrOrderOnly === 2), this.state.isBothOrOrderOnly)}
                                        {!this.state.isUpdateAtStart && !(this.state.isBothOrOrderOnly === 2) &&
                                            <div className="">
                                                <label htmlFor="quantity">
                                                {this.state.isBothOrOrderOnly === 0 && <span>initial </span>}
                                                order quantity&nbsp;&nbsp;</label>
                                                <input type="text" id="quantity" value={this.state.order.quantity} onChange={this.handleChange.bind(this, 'quantity')} />
                                                <button className="buttonSm button2a" onClick={() => this.handleQuantityChange(-10)}>- 10</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handleQuantityChange(10)}>+ 10</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handleQuantityChange(-100)}>- 100</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handleQuantityChange(100)}>+ 100</button>&nbsp;
                                            </div>
                                        }
                                        {console.log('one cond', !this.state.isBothOrOrderOnly == 1, this.state.isBothOrOrderOnly, typeof this.state.isBothOrOrderOnly)}
                                        {!(this.state.isBothOrOrderOnly === 1) &&
                                          <div>
                                            <div>reorder &nbsp;
                                                <input type="text" id="reorderQnty" value={this.state.order.reorderQnty} onChange={this.handleChange.bind(this, 'reorderQnty')} />
                                                &nbsp; items&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handleReorderQntyChange(-10)}>- 10</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handleReorderQntyChange(10)}>+ 10</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handleReorderQntyChange(-100)}>- 100</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handleReorderQntyChange(100)}>+ 100</button>&nbsp;
                                            </div>
                                            <div>when stock is below&nbsp;
                                                <input type="text" id="reorderLevel" value={this.state.order.reorderLevel} onChange={this.handleChange.bind(this, 'reorderLevel')} />
                                                <button className="buttonSm button2a" onClick={() => this.handleReorderLevelChange(-10)}>- 10</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handleReorderLevelChange(10)}>+ 10</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handleReorderLevelChange(-100)}>- 100</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handleReorderLevelChange(100)}>+ 100</button>&nbsp;
                                            </div>
                                          </div>
                                        }
                                        <br/>
                                        <div className="" onChange={this.updateSettlementType.bind(this)}>
                                            settlement type: &nbsp;&nbsp;
                                            <label htmlFor="credit">&nbsp;credit&nbsp;</label>
                                            <input id="credit" type="radio" value="false" name="paymenttype" defaultChecked />
                                            &nbsp;&nbsp;
                                            <label htmlFor="cash">&nbsp;cash&nbsp;</label>
                                            <input id="cash" type="radio" value="true" name="paymenttype" />
                                        </div>

                                      </div>
                                    }
                                    <br />
                                    <span className="responsiveFSize2a">Warning: best match to your order is a legally binding deal for you and offering co.</span>
                                    <br /><br />
                                    <div className="">
                                        {console.log(this.state.isSubmitValid, this.state.isUpdateAtStart)}
                                        
                                        {(!this.state.isUpdateAtStart && !this.state.isUpdate) &&
                                            <button className="button button1" onClick={this.handleSaveNew} disabled={!this.state.isSubmitValid}>
                                            {this.state.isBothOrOrderOnly === 1 ? 'Place order' : (this.state.isBothOrOrderOnly === 2 ? 'Set re-order rule' : 'Place order and set rule')}
                                            </button>
                                        }
                                        
                                        {(this.state.isUpdateAtStart || this.state.isUpdate) &&
                                            <button className="button button1" onClick={this.handleSaveUpdate} disabled={!this.state.isSubmitValid && !this.state.isUpdateAtStart}>
                                                Update rule
                                            </button>
                                        }
                                        
                                        {(this.state.isUpdateAtStart || this.state.isUpdate) && 
                                            <span>
                                            <button className="button button1" onClick={this.handleSuspend.bind(this, this.state.order)}> Suspend rule </button>
                                            <button className="button button1 floatRight" onClick={this.handleDelete.bind(this, this.state.order)}> Delete rule</button>
                                            </span>
                                        }
                                        <button className="button button1" onClick={this.handleModalClose}>Cancel</button>
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
                    <div id="container2a">test</div>
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
                            console.log('QueryAllOrders = ', QueryAllOrders);
                            const query = QueryAllOrders;
                            const data = proxy.readQuery({ query });
                            console.log('data after read = ', data);
                            console.log('data.listOrders.items LEN after read = ', data.listOrders.items.length);
                            console.log('data.listOrders.items after read = ', data.listOrders.items);
                            console.log('createOrder = ', createOrder);

                            // get latest orders from getCompany
                            data.listOrders.items = [
                            ...props.ownProps.orders.items, 
                            createOrder];

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
    graphql(
        MutationCreateReOrderRule,
        {
            props: (props) => ({
                createReOrderRule: (order) => {
                    console.log('point L1 at createReOrderRule = ', order);
                    return props.mutate({
                        update: (proxy, { data: { createReOrderRule } }) => {
                            console.log('point L2 proxy - ', proxy);
                            // Update QueryAllOrders
                            console.log('QueryAllOrders = ', QueryAllOrders);
                            const query = QueryAllReOrderRules;
                            const data = proxy.readQuery({ query });
                            console.log('data after read = ', data);
                            console.log('data.listOrders.items LEN after read = ', data.listReOrderRules.items.length);
                            console.log('data.listOrders.items after read = ', data.listReOrderRules.items);
                            console.log('createOrder = ', createReOrderRule);

                            // get latest orders from getCompany
                            data.listReOrderRules.items = [
                                ...props.ownProps.orders.items,
                                createReOrderRule];

                            // filter out old one if it is an update
                            data.listOrders.items = [
                                ...data.listOrders.items.filter(e => {
                                    console.log('e = ', e);
                                    console.log('e.orderID = ', e.orderID);
                                    return e.orderID !== createReOrderRule.orderID
                                })
                                , createReOrderRule];

                            console.log('data after filter = ', data);
                            console.log('data.listOrders.items after filter = ', data.listReOrderRules.items);
                            proxy.writeQuery({ query, data });

                            // Create cache entry for QueryGetOrder
                            const query2 = QueryGetReOrderRule;
                            const variables = { id: createReOrderRule.id };
                            const data2 = { getOrder: { ...createReOrderRule } };
                            console.log('point L3 data2 = ', data2);
                            proxy.writeQuery({ query: query2, variables, data: data2 });
                            console.log('point L4 query2 = ', query2);
                            console.log('this.props GQL part -', props);
                        },
                        variables: order,
                        optimisticResponse: () => (
                            {
                                createOrder: {
                                    ...order, __typename: 'ReOrderRule'
                                }
                            }),
                    })
                }
            })
        }
    ),
    graphql(
        MutationCreateReOrderRule,
        {
            props: (props) => ({
                createReOrderRule: (order) => {
                    console.log('point L1 at createReOrderRule = ', order);
                    return props.mutate({
                        update: (proxy, { data: { createReOrderRule } }) => {
                            console.log('point L2 proxy - ', proxy);
                            // Update QueryAllOrders
                            console.log('QueryAllReOrderRules = ', QueryAllReOrderRules);
                            const query = QueryAllReOrderRules;
                            const data = proxy.readQuery({ query });
                            console.log('data after read = ', data);
                            console.log('data.listReOrderRules.items LEN after read = ', data.listReOrderRules.items.length);
                            console.log('data.listReOrderRules.items after read = ', data.listReOrderRules.items);
                            console.log('createOrder = ', createReOrderRule);

                            // get latest orders from getCompany
                            data.listReOrderRules.items = [
                                ...props.ownProps.orders.items,
                                createReOrderRule];

                            // filter out old one if it is an update
                            data.listReOrderRules.items = [
                                ...data.listReOrderRules.items.filter(e => {
                                    console.log('e = ', e);
                                    console.log('e.orderID = ', e.reorderRuleID);
                                    return e.reorderRuleID !== createReOrderRule.reorderRuleID
                                })
                                , createReOrderRule];

                            console.log('data after filter = ', data);
                            console.log('data.reorderRuleID.items after filter = ', data.listReOrderRules.items);
                            proxy.writeQuery({ query, data });

                            // Create cache entry for QueryGetOrder
                            const query2 = QueryGetReOrderRule;
                            const variables = { id: createReOrderRule.id };
                            const data2 = { getOrder: { ...createReOrderRule } };
                            console.log('point L3 data2 = ', data2);
                            proxy.writeQuery({ query: query2, variables, data: data2 });
                            console.log('point L4 query2 = ', query2);
                            console.log('this.props GQL part -', props);
                        },
                        variables: order,
                        optimisticResponse: () => (
                            {
                                createOrder: {
                                    ...order, __typename: 'ReOrderRule'
                                }
                            }),
                    })
                }
            })
        }
    ),
    graphql(
        MutationUpdateReOrderRule,
        {
            props: (props) => ({
                updateReOrderRule: (order) => {
                    console.log('point L1 at updateReOrderRule = ', order);
                    return props.mutate({
                        update: (proxy, { data: { updateReOrderRule } }) => {
                            console.log('point L2 proxy - ', proxy);
                            // Update QueryAllOrders
                            console.log('QueryAllReOrderRules = ', QueryAllReOrderRules);
                            const query = QueryAllReOrderRules;
                            const data = proxy.readQuery({ query });
                            console.log('data after read = ', data);
                            console.log('data.listReOrderRules.items LEN after read = ', data.listReOrderRules.items.length);
                            console.log('data.listReOrderRules.items after read = ', data.listReOrderRules.items);
                            console.log('updateReOrderRule = ', updateReOrderRule);

                            // get latest orders from getCompany
                            data.listReOrderRules.items = [
                                ...props.ownProps.orders.items,
                                updateReOrderRule];

                            // filter out old one if it is an update
                            data.listReOrderRules.items = [
                                ...data.listReOrderRules.items.filter(e => {
                                    console.log('e = ', e);
                                    console.log('e.reorderRuleID = ', e.reorderRuleID);
                                    return e.reorderRuleID !== updateReOrderRule.reorderRuleID
                                })
                                , updateReOrderRule];

                            console.log('data after filter = ', data);
                            console.log('data.listReOrderRules.items after filter = ', data.listReOrderRules.items);
                            proxy.writeQuery({ query, data });

                            // Create cache entry for QueryGetOrder
                            const query2 = QueryGetReOrderRule;
                            const variables = { id: updateReOrderRule.id };
                            const data2 = { getOrder: { ...updateReOrderRule } };
                            console.log('point L3 data2 = ', data2);
                            proxy.writeQuery({ query: query2, variables, data: data2 });
                            console.log('point L4 query2 = ', query2);
                            console.log('this.props GQL part -', props);
                        },
                        variables: order,
                        optimisticResponse: () => (
                            {
                                updateOrder: {
                                    ...order, __typename: 'ReOrderRule'
                                }
                            }),
                    })
                }
            })
        }
    ),    
    graphql(
        MutationDeleteReOrderRule,
        {
            options: {
                update: (proxy, { data: { deleteReOrderRule } }) => {
                    const query = QueryAllReOrderRules;
                    const data = proxy.readQuery({ query });

                    data.listReOrderRules.items = data.listReOrderRules.items.filter(orderRule => orderRule.reorderRuleID !== deleteReOrderRule.reorderRuleID);

                    proxy.writeQuery({ query, data });
                }
            },
            props: (props) => ({
                deleteReOrderRule: (order) => {
                    console.log('props.ownProps', props.ownProps)
                    return props.mutate({
                        variables: { companyID: props.ownProps.company.id, reorderRuleID: order.reorderRuleID },
                        optimisticResponse: () => ({
                            deleteReOrderRule: {
                                ...order, __typename: 'ReOrderRule'
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

)(AssemblingCompany);
