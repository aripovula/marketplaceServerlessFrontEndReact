import React from 'react'
import { v4 as uuid } from "uuid";
import Modal from 'react-modal';
import { graphql, compose } from 'react-apollo'

import CreateOrder from '../graphQL/mutationAddOrder'
import QueryGetCompany from "../graphQL/queryGetCompanyOrders";
import QueryAllOrders from "../graphQL/queryAllOrders";
import QueryAllProducts from "../graphQL/queryAllProducts";
import QueryAllReOrderRules from "../graphQL/queryAllReorderRules";
import ListOrders from "../graphQL/queryOrdersWithData";
import NewOrderSubscription from '../graphQL/subscriptionOrderNew';
import NewReOrderRuleSubscription from '../graphQL/subscriptionReOrderRuleNew';
import UpdateOrderSubscription from '../graphQL/subscriptionOrderUpdate';
import NewProductSubscription from '../graphQL/subscriptionProducts';
import MutationUpdateReOrderRule from "../graphQL/mutationUpdateReorderRule";
import ModalInfo from "./ModalInfo";

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

class AssemblingCo extends React.Component {

    orderUpdateSubscription;
    reOrderRuleCreateSubscription;
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
        const noRuleProducts = this.noRuleProducts(productsListFromProps);
        const productsAll = this.allProducts(productsListFromProps);
        this.state = {
            modalIsOpen: false,
            order: this.newOrder(),
            orders: (this.props.data && this.props.data.listOrders) ? this.props.data.listOrders.items : null,
            products: productsAll,
            productsNoRule: noRuleProducts,
            productsAll,
            isSubmitValid: false,
            isUpdate: false,
            isUpdateAtStart: false,
            selectedOption: -1,
            oneOffOrRule: 1,
            loading: false,
            infoModalData: '',
            nextToken: '',
            allTokens: [null],
            currentPosition: 0
        };

        this.openModal = this.openModal.bind(this);
        this.handleModalClose = this.handleModalClose.bind(this);
        this.handleInfoModalClose = this.handleInfoModalClose.bind(this);
        this.updateOrderType = this.updateOrderType.bind(this);
        this.updateSettlementType = this.updateSettlementType.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

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

    componentWillMount() {
        this.orderUpdateSubscription = this.props.subscribeToUpdateOrders();
        this.productSubscription = this.props.subscribeToNewProducts();
        this.reOrderRuleCreateSubscription = this.props.subscribeToNewReOrderRules();
        Modal.setAppElement('body');
    }

    componentWillUnmount() {
        // this.productSubscription();
    }

    openModal() {
        this.setState({ modalIsOpen: true });
    }

    handleModalClose() {
        this.setState(prevState => ({
            order: this.newOrder(),
            products: prevState.productsAll,
            isSubmitValid: false,
            isUpdateAtStart: false,
            isUpdate: false,
            selectedOption: -1,
            modalIsOpen: false,
            oneOffOrRule: 1,
            infoModalData: ''
        }));
    }

    handleInfoModalClose() {
        this.setState({ infoModalData: '' });
    }

    newOrder() {
        return {
            companyID: this.props.companyID,
            orderID: new Date('January 1, 2022 00:00:00') - new Date(), // uuid(),
            reorderRuleID: uuid(),
            productID: '',
            note: 'ph',
            dealPrice: 0,
            product: 'ph',
            status: 'ORDER_PLACED',
            maxPrice: 1000000,
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

    // prepares array of products (for which company did not set a re-order rule) recorded in store for options drop-down
    noRuleProducts(productsListFromProps) {

        if (productsListFromProps.length > 0 && this.props.company && this.props.company.reOrderRules && this.props.data.reOrderRules.items.length > 0) {
            let coOrders;
            this.props.data.reOrderRules.items.forEach((item) => { coOrders = coOrders + item.productID + ';;' });
            const l = productsListFromProps.length;
            let indexedproductsNoRule = [];
            let count = 0;
            for (let x = 0; x < l; x++) {
                if (!coOrders.includes(productsListFromProps[x].id)) {
                    indexedproductsNoRule.push({
                        seqNumb: count++,
                        details: productsListFromProps[x]
                    })
                }
            }
            return indexedproductsNoRule;
        } else {
            return this.allProducts(productsListFromProps);
        }
    }

    updateSettlementType(e) {
        const isCashPayment = e.target.value === 'true';
        console.log('isCashPayment', isCashPayment, e.target.value);
        this.setState(prevState => ({
            order: {
                ...prevState.order,
                isCashPayment
            }
        }));
    }

    updateOrderType(e) {
        const oneOffOrRule = parseInt(e.target.value);
        console.log('oneOffOrRule', oneOffOrRule, e.target.value);
        this.setState({
            oneOffOrRule
        }, () => this.updateModalState());

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
                products: this.state.productsNoRule,
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

    updateModalState() {
        console.log('products[selected]', this.state.products[this.state.selectedOption]);
        console.log('b4 PR SEL', this.state.order);
        let isFound = false; let xF = -1;
        // if re-order rule already exists for this product that re-order rule to update
        if (this.state.oneOffOrRule === 2 && this.props.company.reOrderRules) {
            for (let x = 0; x < this.props.data.reOrderRules.items.length; x++) {
                if (this.props.data.reOrderRules.items[x].productID === this.state.products[this.state.selectedOption].details.id) {
                    isFound = true; xF = x;
                }
            }
        }
        // console.log('prods, orders, isF, xF ', this.state.products, this.props.data.reOrderRules.items, isFound, xF);


        if (isFound) {
            const deepCopyRule = this.props.company.reOrderRules ? JSON.parse(JSON.stringify(this.props.data.reOrderRules.items[xF])) : null;
            console.log('deepCopyRule', deepCopyRule);

            this.setState({
                order: deepCopyRule,
                isSubmitValid: true,
                isUpdate: true
            }, () => console.log('after PR SEL', this.state.order))
        } else {
            console.log('in modal update');
            const orderNew = this.newOrder();
            this.setState({
                order: {
                    ...orderNew,
                    productID: this.state.products[this.state.selectedOption].details.id
                },
                isSubmitValid: true,
                isUpdate: false
            }, () => console.log('after PR SEL', this.state.order));
        }
    }

    // update modal UI when certain product is selected in drop-down
    handleSelectOptionChange(selected) {
        console.log('selected - ', selected);
        if (selected > -1) {
            this.updateModalState();
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
        this.setState(prevState => ({ order: { ...prevState.order, maxPrice: newPrice } }))
    }

    handleQuantityChange(delta) {
        let newQuantity = parseInt(this.state.order.quantity) + parseInt(delta);
        newQuantity = parseInt(newQuantity) < 0 ? 0 : newQuantity;
        this.setState(prevState => ({ order: { ...prevState.order, quantity: newQuantity } }))
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

    handleSuspendResume(order, e) {
        console.log('order - ', order);
        const suspendOrResume = this.state.order.isRuleEffective ? 'suspend' : 'resume';
        if (window.confirm(`Are you sure you want to ${suspendOrResume} this re-order rule ?`)) {
            e.stopPropagation();
            e.preventDefault();
            this.setState(prevState => ({
                order: { ...prevState.order, isRuleEffective: !prevState.order.isRuleEffective },
                loading: true,
                modalIsOpen: false
            }), async () => {
                const { order } = this.state;
                const { updateReOrderRule } = this.props;
                console.log('updateReOrderRule -', this.props.updateOrder);
                console.log('order b4 save -', this.state.order);
                await updateReOrderRule({ ...order });
                console.log('order after save -', this.state.order);
                this.handleSync();
            })
        }
    }

    handleDelete = async (order, e) => {
        e.preventDefault();
        console.log('order - ', order);
        if (this.state.oneOffOrRule === 1) {
            if (window.confirm(`Are you sure you want to delete this order ?`)) {
                this.setState({ loading: true, modalIsOpen: false });
                const { deleteOrder } = this.props;
                console.log('deleteOrder = ', this.props.deleteOrder);
                await deleteOrder(order);
                // this.setState({ loading: false });
                this.handleSync();
            }
        } else if (this.state.oneOffOrRule === 2) {
            if (window.confirm(`Are you sure you want to delete this re-order rule ?`)) {
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
        console.log('oneOffOrRule', this.state.oneOffOrRule);

        if (this.state.oneOffOrRule === 1) {
            const { createOrder } = this.props;
            const { order } = this.state;

            console.log('createOrder -', createOrder);
            console.log('order b4 save -', order);
            this.props.onAdd({ ...order });
            // await createOrder({ ...order });
            // this.setState({ loading: false });
        } else if (this.state.oneOffOrRule === 2) {
            const { createReOrderRule } = this.props;
            const { order } = this.state;

            console.log('createReOrderRule -', createReOrderRule);
            console.log('order b4 save -', order);
            // await createReOrderRule({ ...order });
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
        console.log('oneOffOrRule', this.state.oneOffOrRule);

        if (this.state.oneOffOrRule === 1) {

            const { updateOrder } = this.props;

            console.log('updateOrder -', this.props.updateOrder);
            console.log('order b4 save -', this.state.order);

            await updateOrder({ ...order });

        } else if (this.state.oneOffOrRule === 2) {
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

        // console.log('client.query = ', client.query);
        // const coId = this.props.company.id;

        // await client.query({
        //     query,
        //     variables: { id: coId },
        //     fetchPolicy: 'network-only',
        // });

        const productsListFromProps = this.props.products ? this.props.products : null;
        console.log('indexed prs from store', productsListFromProps);
        const noRuleProducts = this.noRuleProducts(productsListFromProps);
        const productsAll = this.allProducts(productsListFromProps);
        this.setState({
            order: this.newOrder(),
            orders: this.props.data.listOrders ? this.props.data.listOrders.items : null,
            products: productsAll,
            productsNoRule: noRuleProducts,
            productsAll,
            isSubmitValid: false,
            isUpdate: false,
            isUpdateAtStart: false,
            selectedOption: -1,
            loading: false,
            oneOffOrRule: 1,
            infoModalData: ''
        });
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
        this.props.getOrdersBatch(this.props.limit, val, companyID)
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

                <table id="tableFM">
                    <tbody>
                        <tr>
                            <td>product</td>
                            <td>reorder x @ y, rating, price</td>
                            <td>left</td>
                        </tr>

                        {this.props.listReOrderRules.items && [].concat(this.props.listReOrderRules.items).sort((a, b) =>
                            a.product.name.localeCompare(b.product.name)).map((orderRule) =>
                                <tr key={orderRule.reorderRuleID}>
                                    <td>
                                        <span className="addnlightbg notbold cursorpointer"
                                            onClick={() => {
                                                this.setState(() => ({
                                                    isUpdateAtStart: true,
                                                    order: JSON.parse(JSON.stringify(orderRule)),
                                                    oneOffOrRule: 2,
                                                    modalIsOpen: true
                                                }));
                                            }}>{orderRule.product.name} {orderRule.product.modelNo}
                                        </span>
                                    </td>
                                    <td>{this.getThresholdText(orderRule, true)}</td>
                                    <td>{orderRule.reorderQnty}</td>
                                </tr>
                            )}
                    </tbody>
                </table>

                <div>
                    <span className="verIndent"></span>
                    <span className="responsiveFSize">Orders</span>&nbsp; &nbsp;
                        <span
                        className="addnlightbg notbold cursorpointer"
                        onClick={() => {
                            const productsListFromProps = this.props.products ? this.props.products : null;
                            console.log('products in Store', productsListFromProps);
                            const noRuleProducts = this.noRuleProducts(productsListFromProps);
                            const productsAll = this.allProducts(productsListFromProps);
                            this.setState(() => ({
                                products: productsAll,
                                productsNoRule: noRuleProducts,
                                productsAll,
                                modalIsOpen: true,
                                isUpdateAtStart: false
                            }));
                        }}>new &nbsp; &nbsp;
                    </span>

                    <span
                        className={(this.props.data.listOrders && this.props.data.listOrders.nextToken) ? "addnlightbg notbold cursorpointer" : "addnlightbgoff notbold"}
                        onClick={(this.props.data.listOrders && this.props.data.listOrders.nextToken) ? () => this.showPrevious(this.props.data.listOrders.nextToken) : null}
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
                            {this.props.data.listOrders && this.props.data.listOrders.items && [].concat(this.props.data.listOrders.items).sort((a, b) => a.orderID.localeCompare(b.orderID)).map((order) =>
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

                    {/*<button className="button button1"
                        onClick={() => this.showPrevious(this.props.data.listOrders.nextToken)}
                        disabled={(this.props.data.listOrders && this.props.data.listOrders.nextToken) ? !this.props.data.listOrders.nextToken : false}
                    >Previous 2</button>

                    <button className="button button1"
                        onClick={() => this.showNext()}
                        disabled={this.state.currentPosition === 0}
                    >Next 2</button>

                    <button className="button button1"
                        onClick={() => this.showPrevious(null)}
                        >Show latest 2</button>*/}

                </div>

                {/* MODALS  */}
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
                                {!this.state.isUpdateAtStart &&
                                    <div className="floatRight" onChange={this.updateProductOptions.bind(this)}>
                                        <label htmlFor="noOrders">products with no re-order rule({this.state.productsNoRule.length})&nbsp;</label>
                                        <input id="noOrders" type="radio" value="noOrders" name="prodtype" />
                                        &nbsp;&nbsp;
                                            <label htmlFor="all">&nbsp;all products({this.state.productsAll.length}) &nbsp;</label>
                                        <input id="all" type="radio" value="all" name="prodtype" defaultChecked />
                                    </div>
                                }
                                {this.state.isUpdateAtStart && <div>Update re-order rule for '{this.state.order.product.name} - {this.state.order.product.modelNo}' - works only for new orders not yet placed</div>}
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
                                            {this.state.products.map((aProduct) =>
                                                <option key={aProduct.seqNumb} value={aProduct.seqNumb}>{aProduct.details.name + ' - ' + aProduct.details.modelNo}</option>
                                            )}
                                        </select>
                                    </div>
                                }

                                {console.log('isUpdateAtStart === ', this.state.isUpdateAtStart)}

                                <br />
                                {(this.state.selectedOption > -1 || this.state.isUpdateAtStart) &&
                                    <div>
                                        {!this.state.isUpdateAtStart &&
                                            <div className="">
                                                <label htmlFor="oneoff">&nbsp;one-off order &nbsp;</label>
                                                <input id="oneoff" type="radio" value="1" name="orderType"
                                                    checked={this.state.oneOffOrRule === 1} onChange={this.updateOrderType.bind(this)} />
                                                &nbsp;&nbsp;
                                            <label htmlFor="ruleonly">&nbsp;re-order rule &nbsp;</label>
                                                <input id="ruleonly" type="radio" value="2" name="orderType"
                                                    checked={this.state.oneOffOrRule === 2} onChange={this.updateOrderType.bind(this)} />
                                            </div>
                                        }
                                        <br />
                                        {this.state.oneOffOrRule === 0 && !this.state.isUpdateAtStart &&
                                            <div><div>( below settings apply to initial order and subsequent re-orders )</div><br /></div>}

                                        Order product with following terms:
                                        {(this.state.order.bestOfferType === 'OPTIMAL' || this.state.order.bestOfferType === 'CUSTOM') &&
                                            <div className="floatRight">
                                                <span>if no offer is found fallback to </span>
                                                <select
                                                    value={this.state.order.secondBestOfferType}
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

                                        <div className="">
                                            &nbsp;&nbsp;<input id="optimal" type="radio" value="OPTIMAL" name="bestorder"
                                                checked={this.state.order.bestOfferType === "OPTIMAL"}
                                                onChange={(e) => this.handleBestOfferTypeChange(e)} />
                                            <label htmlFor="optimal">&nbsp;cheapest price at min. rating</label>
                                            <br />
                                            &nbsp;&nbsp;<input id="cheapest" type="radio" value="CHEAPEST" name="bestorder"
                                                checked={this.state.order.bestOfferType === "CHEAPEST"}
                                                onChange={(e) => this.handleBestOfferTypeChange(e)} />
                                            <label htmlFor="cheapest">&nbsp;cheapest price</label>
                                            <br />
                                            &nbsp;&nbsp;<input id="highestrating" type="radio" value="HIGHESTRATING" name="bestorder"
                                                checked={this.state.order.bestOfferType === "HIGHESTRATING"}
                                                onChange={(e) => this.handleBestOfferTypeChange(e)} />
                                            <label htmlFor="highestrating">&nbsp;highest rating</label>
                                            <br />
                                            &nbsp;&nbsp;<input id="custom" type="radio" value="CUSTOM" name="bestorder"
                                                checked={this.state.order.bestOfferType === "CUSTOM"}
                                                onChange={(e) => this.handleBestOfferTypeChange(e)} />
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
                                        <br />
                                        {console.log('both conds', !this.state.isUpdateAtStart, !(this.state.oneOffOrRule === 2), this.state.oneOffOrRule)}
                                        {!(this.state.oneOffOrRule === 2) &&
                                            <div className="">
                                                <label htmlFor="quantity">
                                                    {this.state.oneOffOrRule === 0 && <span>initial </span>}
                                                    order quantity&nbsp;&nbsp;</label>
                                                <input type="text" id="quantity" value={this.state.order.quantity} onChange={this.handleChange.bind(this, 'quantity')} />
                                                <button className="buttonSm button2a" onClick={() => this.handleQuantityChange(-10)}>- 10</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handleQuantityChange(10)}>+ 10</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handleQuantityChange(-100)}>- 100</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handleQuantityChange(100)}>+ 100</button>&nbsp;
                                            </div>
                                        }
                                        {console.log('one cond', !this.state.oneOffOrRule == 1, this.state.oneOffOrRule, typeof this.state.oneOffOrRule)}
                                        {!(this.state.oneOffOrRule === 1) &&
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
                                        <br />
                                        <div className="" >
                                            settlement type: &nbsp;&nbsp;
                                            <label htmlFor="credit">&nbsp;credit&nbsp;</label>
                                            <input id="credit" type="radio" value="false" name="paymenttype"
                                                checked={!this.state.order.isCashPayment} onChange={this.updateSettlementType.bind(this)} />
                                            &nbsp;&nbsp;
                                            <label htmlFor="cash">&nbsp;cash&nbsp;</label>
                                            <input id="cash" type="radio" value="true" name="paymenttype"
                                                checked={this.state.order.isCashPayment} onChange={this.updateSettlementType.bind(this)} />
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
                                            {this.state.oneOffOrRule === 1 ? 'Place new order' :
                                                (this.state.oneOffOrRule === 2 ? 'Set re-order rule' : 'Place order and set rule')}
                                        </button>
                                    }

                                    {(this.state.isUpdateAtStart || this.state.isUpdate) &&
                                        <button className="button button1" onClick={this.handleSaveUpdate} disabled={!this.state.isSubmitValid &&
                                            !this.state.isUpdateAtStart}>
                                            Update rule
                                            </button>
                                    }

                                    {(this.state.isUpdateAtStart || this.state.isUpdate) &&
                                        <span>
                                            <button className="button button1" onClick={this.handleSuspendResume.bind(this, this.state.order)}>
                                                {this.state.order.isRuleEffective ? 'Suspend rule' : 'Resume rule'}  </button>
                                            <button className="button button1 floatRight" onClick={this.handleDelete.bind(this, this.state.order)}>
                                                Delete rule</button>
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
                                items: [onCreateOrder, ...prev.listOrders.items.filter(order => order.orderID !== onCreateOrder.orderID)],
                                nextToken: onCreateOrder.nextToken
                            }
                        }
                    }
                })
            }
        })
    }),
    graphql(QueryAllReOrderRules, {
        // options: {
        //     fetchPolicy: 'cache-and-network'
        // },
        options: ({ limit, nextToken, companyID }) => {
            return ({
                variables: { limit, nextToken, companyID },
                fetchPolicy: 'cache-and-network'
            });
        },
        props: props => ({
            listReOrderRules: {
                items: props.data.listReOrderRules ? props.data.listReOrderRules.items : [],
                nextToken: props.data.listReOrderRules ? props.data.listReOrderRules.nextToken : [],
            },
            subscribeToNewReOrderRules: params => {
                props.data.subscribeToMore({
                    document: NewReOrderRuleSubscription,
                    updateQuery: (prev, { subscriptionData: { data: { onCreateReOrderRule } } }) => {
                        console.log('onCreateReOrderRule - ', onCreateReOrderRule);
                        return {
                            ...prev,
                            listReOrderRules: {
                                __typename: 'ReOrderRuleConnection',
                                items: [onCreateReOrderRule, ...prev.listReOrderRules.items.filter(
                                    rule => rule.reorderRuleID !== onCreateReOrderRule.reorderRuleID
                                )]
                            }
                        }
                    }
                })
            }
        })
    }),
    graphql(ListOrders, {
        options: ({ limit, nextToken, companyID }) => {
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
            subscribeToUpdateOrders: params => {
                props.data.subscribeToMore({
                    document: UpdateOrderSubscription,
                    updateQuery: (prev, { subscriptionData: { data: { onUpdateOrder } } }) => {
                        console.log('onUpdateOrder - ', onUpdateOrder);
                        return {
                            ...prev,
                            listOrders: {
                                __typename: 'OrderConnection',
                                items: [onUpdateOrder, ...prev.listOrders.items.filter(order => order.orderID !== onUpdateOrder.orderID)]
                            }
                        }
                    }
                })
            }
        })
    }),

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
    // graphql(QueryAllReOrderRules, {
    //     options: ({ limit, nextToken, companyID }) => {
    //         return ({
    //             variables: { limit, nextToken, companyID },
    //             fetchPolicy: 'cache-and-network'
    //         });
    //     },
    //     props: props => ({
    //         getOrdersBatch: (limit, nextToken, companyID) => {
    //             console.log('nextToken, companyID', nextToken, companyID);

    //             // searchQuery = searchQuery.toLowerCase()
    //             return props.data.fetchMore({
    //                 query: QueryAllReOrderRules, // searchQuery === '' ? ListIceCreams : SearchIceCreams,
    //                 variables: {
    //                     limit, nextToken, companyID
    //                 },
    //                 updateQuery: (previousResult, { fetchMoreResult }) => ({
    //                     ...previousResult,
    //                     listReOrderRules: {
    //                         ...previousResult.listReOrderRules,
    //                         items: fetchMoreResult.listReOrderRules.items,
    //                         nextToken: fetchMoreResult.listReOrderRules.nextToken
    //                     }
    //                 })
    //             })
    //         },
    //         data: props.data
    //     })
    // }),
    graphql(CreateOrder, {
        props: props => ({
            onAdd: order => props.mutate({
                variables: order,
                optimisticResponse: {
                    __typename: 'Mutation',
                    createOrder: { ...order, id: Math.round(Math.random() * -1000000), __typename: 'Order' }
                },
                update: (proxy, { data: { createOrder } }) => {
                    // 1
                    const data2 = proxy.readQuery({
                        query: ListOrders,
                        variables: {
                            limit: props.ownProps.limit,
                            nextToken: null,
                            companyID: props.ownProps.companyID 
                        }
                    });
                    console.log('data2 b4', data2.listOrders.items.length, JSON.stringify(data2));
                    // data2.listOrders.items.push(createOrder);
                    data2.listOrders.items = [
                        ...data2.listOrders.items.filter(e => {
                            // console.log('e = ', e);
                            // console.log('e.orderID = ', e.orderID);
                            return e.orderID !== createOrder.orderID
                        })
                        , createOrder];

                    console.log('data2 after', data2.listOrders.items.length, JSON.stringify(data2));
                    proxy.writeQuery({ query: ListOrders, data: data2 });
                    
                    // 2
                    // const data = proxy.readQuery({ query: QueryAllOrders });
                    // data.listOrders.items.push(createOrder);
                    // proxy.writeQuery({ query: QueryAllOrders, data });
                }
            })
        }),
    })
)(AssemblingCo)
