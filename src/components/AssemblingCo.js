import React from 'react'
// import { v4 as uuid } from "uuid";
import Modal from 'react-modal';
import { graphql, compose } from 'react-apollo'

import CreateOrder from '../graphQL/mutationAddOrder';
import CreateReOrderRule from '../graphQL/mutationAddReorderRule';
import UpdateReOrderRule from "../graphQL/mutationUpdateReorderRule";
import QueryGetCompany from "../graphQL/queryGetCompany";
// import QueryAllOrders from "../graphQL/queryAllOrders";
import ListOrders from "../graphQL/queryOrdersWithData";
import QueryAllProducts from "../graphQL/queryAllProducts";
import ListReOrderRules from "../graphQL/queryAllReorderRules";
import MutationDeleteReOrderRule from "../graphQL/mutationDeleteReorderRule";
import NewOrderSubscription from '../graphQL/subscriptionOrderNew';
import NewReOrderRuleSubscription from '../graphQL/subscriptionReOrderRuleNew';
import UpdateOrderSubscription from '../graphQL/subscriptionOrderUpdate';
import NewProductSubscription from '../graphQL/subscriptionProducts';
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
    is2simulateUpdate = false;
    is2simulateUpdateRule = false;
    listOrdersPrev;
    listReOrderRulesPrev;
    keepTillItTimesOut = [];
    productLeft = [];

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
            listOrders: null,
            listReOrderRules: null,
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
            currentPosition: 0,
            nextTokenROR: '',
            allTokensROR: [null],
            currentPositionROR: 0,
            is2reRender: false
        };

        this.openModal = this.openModal.bind(this);
        this.handleModalClose = this.handleModalClose.bind(this);
        this.handleInfoModalClose = this.handleInfoModalClose.bind(this);
        this.updateOrderType = this.updateOrderType.bind(this);
        this.updateSettlementType = this.updateSettlementType.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentWillMount() {
        this.orderUpdateSubscription = this.props.subscribeToUpdateOrders();
        this.productSubscription = this.props.subscribeToNewProducts();
        this.reOrderRuleCreateSubscription = this.props.subscribeToNewReOrderRules();
        Modal.setAppElement('body');
    }

    componentWillUnmount() {
        // this.productSubscription();
    }

    // componentDidMount = async () => {
    //     if (this.props.isNewUser && this.state.productsAll.length > 1) {
    //         const starterRuleOne = this.newOrder();
    //         starterRuleOne.productID = this.state.productsAll[0].details.id;
    //         await this.props.onAddRule({ ...starterRuleOne })
    //         const starterRuleTwo = this.newOrder();
    //         starterRuleTwo.productID = this.state.productsAll[1].details.id;
    //         this.props.onAddRule({ ...starterRuleTwo })
    //     }
    // }

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
            reorderRuleID: new Date('January 1, 2022 00:00:00') - new Date(),
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
            isRuleEffective: false,
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

        if (productsListFromProps.length > 0 && this.props.company && this.props.listReOrderRules && this.props.dataRules.listReOrderRules.items.length > 0) {
            let coOrders;
            this.props.dataRules.listReOrderRules.items.forEach((item) => { coOrders = coOrders + item.productID + ';;' });
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
                text = `${text}, max, `;
                text = orderRule.maxPrice < 1000000 ? `${text}${orderRule.maxPrice}-max` : `${text}any`;
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
        if (this.state.oneOffOrRule === 2 && this.props.listReOrderRules) {
            for (let x = 0; x < this.props.dataRules.listReOrderRules.items.length; x++) {
                if (this.props.dataRules.listReOrderRules.items[x].productID === this.state.products[this.state.selectedOption].details.id) {
                    isFound = true; xF = x;
                }
            }
        }
        // console.log('prods, orders, isF, xF ', this.state.products, this.props.dataRules.listReOrderRules.items, isFound, xF);


        if (isFound) {
            const deepCopyRule = this.props.listReOrderRules ? JSON.parse(JSON.stringify(this.props.dataRules.listReOrderRules.items[xF])) : null;
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
                // const { updateReOrderRule } = this.props;
                console.log('updateReOrderRule -', this.props.updateOrder);
                console.log('order b4 save -', this.state.order);
                // await updateReOrderRule({ ...order });
                this.props.onUpdateRule({ ...order });
                console.log('order after save -', this.state.order);
                this.handleSync();
            })
        }
    }

    handleSuspendResumeWithButton = async (order) => {
        const suspendOrResume = order.isRuleEffective ? 'suspend' : 'resume';
        if (window.confirm(`Are you sure you want to ${suspendOrResume} this re-order rule ?`)) {
            let indexOfTurnedOn = null;
            for (let z = 0; z < this.props.dataRules.listReOrderRules.items.length; z++) {
                if (this.props.dataRules.listReOrderRules.items[z].isRuleEffective) { indexOfTurnedOn = z; break; }
            }
            if (indexOfTurnedOn) {
                const ruleToTurnOff = JSON.parse(JSON.stringify(this.props.dataRules.listReOrderRules.items[indexOfTurnedOn]))
                ruleToTurnOff.isRuleEffective = !ruleToTurnOff.isRuleEffective;
                console.log('ruleToTurnOff - ', ruleToTurnOff, indexOfTurnedOn);
                await this.props.onUpdateRule({ ...ruleToTurnOff });
                console.log('ruleToTurnOff order2 - ', order);
                order.isRuleEffective = !order.isRuleEffective;
                this.props.onUpdateRule({ ...order });
                this.handleSync();
            } else {
                order.isRuleEffective = !order.isRuleEffective;
                console.log('order2 - ', order);
                this.props.onUpdateRule({ ...order });
                this.handleSync();
            }
        }
    }

    handleDelete = async (order, e) => {
        e.preventDefault();
        console.log('order - ', order);
        if (this.state.oneOffOrRule === 1) {
            // orders can not be deleted
            // if (window.confirm(`Are you sure you want to delete this order ?`)) {
            //     this.setState({ loading: true, modalIsOpen: false });
            //     const { deleteOrder } = this.props;
            //     console.log('deleteOrder = ', this.props.deleteOrder);
            //     await deleteOrder(order);
            //     // this.setState({ loading: false });
            //     this.handleSync();
            // }
        } else if (this.state.oneOffOrRule === 2) {
            if (window.confirm(`Are you sure you want to delete this re-order rule ?`)) {
                let listReOrderRules = JSON.parse(JSON.stringify(this.props.dataRules.listReOrderRules.items));
                
                listReOrderRules = listReOrderRules.filter((item) => item.reorderRuleID !== order.reorderRuleID);
                // const prevThree = []; let count = 0;
                // [].concat(this.props.dataRules.listReOrderRules.items).sort((a, b) => a.reorderRuleID.localeCompare(b.reorderRuleID)).map((order) => {
                //     count++; if (count < 4) prevThree.push(order);
                // });

                // const listReOrderRules = [orderTemp, ...prevThree];
                console.log('listReOrderRules', listReOrderRules);
                this.is2simulateUpdateRule = true;
                this.setState({
                    loading: true,
                    modalIsOpen: false,
                    listReOrderRules
                });

                // const { deleteReOrderRule } = this.props;
                // console.log('deleteOrder = ', deleteReOrderRule);
                this.props.deleteReOrderRule(order);
                // this.setState({ loading: false });
                this.handleSync();
            }
        }
    }

    handleSaveNew = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('handle save state', this.state);
        console.log('oneOffOrRule', this.state.oneOffOrRule);
        
        if (this.state.oneOffOrRule === 1) {
            const { order } = this.state;
            this.addNewOrder(order);
        } else if (this.state.oneOffOrRule === 2) {
            // const { createReOrderRule } = this.props;
            const { order } = this.state;
            let orderTemp = JSON.parse(JSON.stringify(order));
            orderTemp.reorderRuleID = '-10';
            this.state.productsAll.map((item) => {
                // console.log(item.details.id === orderTemp.productID, item, orderTemp.productID);
                if (item.details.id === orderTemp.productID) orderTemp.product = item.details;
            });
            const prevThree = []; let count = 0;
            [].concat(this.props.dataRules.listReOrderRules.items).sort((a, b) => a.reorderRuleID.localeCompare(b.reorderRuleID)).map((order) => {
                count++; if (count < 4) prevThree.push(order);
            });

            const listReOrderRules = [orderTemp, ...prevThree];
            console.log('listReOrderRules', listReOrderRules);
            this.is2simulateUpdateRule = true;
            this.setState({
                loading: true,
                modalIsOpen: false,
                listReOrderRules
            });

            // console.log('createReOrderRule -', createReOrderRule);
            console.log('order b4 save -', order);
            this.props.onAddRule({ ...order });

            // await createReOrderRule({ ...order });
            // this.setState({ loading: false });
        }
        console.log('order after save -', this.state.order);
        this.handleSync();
    }

    addNewOrder(order) {
        let orderTemp = JSON.parse(JSON.stringify(order));
        orderTemp.orderID = '-10';
        this.state.productsAll.map((item) => {
            console.log(item.details.id === orderTemp.productID, item, orderTemp.productID);
            if (item.details.id === orderTemp.productID) orderTemp.product = item.details;
        });
        const prevThree = []; let count = 0;
        if (this.props.data.listOrders) {
            [].concat(this.props.data.listOrders.items).sort((a, b) => a.orderID.localeCompare(b.orderID)).map((order) => {
                count++; if (count < 4) prevThree.push(order);
            });
        }
        const listOrders = [orderTemp, ...prevThree];
        console.log('listOrders', listOrders);
        this.is2simulateUpdate = true;
        this.setState({
            loading: true,
            modalIsOpen: false,
            listOrders
        });

        // const { createOrder } = this.props;

        // console.log('createOrder -', createOrder);
        console.log('order b4 save -', order);
        this.props.onAdd({ ...order });
            // await createOrder({ ...order });
            // this.setState({ loading: false });
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
            // orders are not editable

            // const { updateOrder } = this.props;

            console.log('updateOrder -', this.props.updateOrder);
            console.log('order b4 save -', this.state.order);

            // await updateOrder({ ...order });

        } else if (this.state.oneOffOrRule === 2) {
            const { order } = this.state;
            let orderTemp = JSON.parse(JSON.stringify(order));
            orderTemp.reorderRuleID = '-10';
            this.state.productsAll.map((item) => {
                console.log(item.details.id === orderTemp.productID, item, orderTemp.productID);
                if (item.details.id === orderTemp.productID) orderTemp.product = item.details;
            });
            const prevThree = []; let count = 0;
            [].concat(this.props.dataRules.listReOrderRules.items).sort((a, b) => a.reorderRuleID.localeCompare(b.reorderRuleID)).map((order) => {
                count++; if (count < 4) prevThree.push(order);
            });

            const listReOrderRules = [orderTemp, ...prevThree];
            console.log('listReOrderRules', listReOrderRules);
            this.is2simulateUpdateRule = true;
            this.setState({
                loading: true,
                modalIsOpen: false,
                listReOrderRules
            });

            // const { updateReOrderRule } = this.props;
            console.log('updateReOrderRule -', this.props.updateOrder);
            console.log('order b4 save -', this.state.order);
            // await updateReOrderRule({ ...order });
            this.props.onUpdateRule({ ...order });
        }
        // this.setState({ loading: false });
        console.log('order after save -', this.state.order);
        this.handleSync();
    }

    handleSync = () => {
        // const { client } = this.props;
        // const query = QueryGetCompany;

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

    // handleSync2 = async () => {
    //     const { client } = this.props;
    //     const query = ListOrders;

    //     await client.query({
    //         query,
    //         variables: {
    //             limit: this.props.limit,
    //             nextToken: null,
    //             companyID: this.props.companyID
    //         },
    //         fetchPolicy: 'network-only',
    //     }, () => this.handleSync());
    // }

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

    showPreviousROR(token) {
        if (token) {
            const tokensTemp = JSON.parse(JSON.stringify(this.state.allTokensROR));
            tokensTemp.push(token);
            this.setState({ allTokensROR: tokensTemp, currentPositionROR: (tokensTemp.length - 1) });
        } else {
            this.setState(prevState => ({ allTokensROR: [null], currentPositionROR: 0 }));
        }

        this.handleFilterROR(token, this.props.companyID)
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

    showNextROR() {
        if (this.state.allTokensROR[this.state.currentPositionROR - 1]) {
            this.setState(prevState => ({ currentPositionROR: prevState.currentPositionROR - 1 }),
                () => {
                    const token = this.state.allTokensROR[this.state.currentPositionROR];
                    this.handleFilterROR(token, this.props.companyID);
                });
        } else {
            this.setState({ allTokensROR: [null], currentPositionROR: 0 },
                () => {
                    const token = this.state.allTokensROR[this.state.currentPositionROR];
                    this.handleFilterROR(token, this.props.companyID);
                });
        }
    }

    handleFilter = (val, companyID) => {
        this.props.getOrdersBatch(this.props.limit, val, companyID);
    };

    handleFilterROR = (val, companyID) => {
        this.props.getReOrderRulesBatch(this.props.limit, val, companyID);
    };

    fromTimer(id, field) {
        const z = this.getZ(id);
        console.log("ID12", id, field, z);
        if (field === "price") this.keepTillItTimesOut[z].price_ = 0;
        if (field === "status") this.keepTillItTimesOut[z].status_ = 0;
        if (field === "note") this.keepTillItTimesOut[z].note_ = 0;
        if (field === "left") this.keepTillItTimesOut[z].left_ = 0;
        if (field === "left_T") this.keepTillItTimesOut[z].left_T = 0;
        if (field === "leftCheck") this.keepTillItTimesOut[z].leftCheck_ = 0;
        if (field === "leftCheck_T") this.keepTillItTimesOut[z].leftCheck_T = 0;
        console.log('ID12 left_ fromTimer', this.keepTillItTimesOut[z].left_, this.keepTillItTimesOut[z].leftCheck_);
        this.setState(prevState => ({is2reRender: !prevState.is2reRender}));
        // console.log("ID12-keep-", JSON.stringify(this.keepTillItTimesOut));
    }

    getZ(orderID){
        let isFound = false; let Z;
        const size = this.keepTillItTimesOut.length;
        for (let z = 0; z < size; z++) {
            if (this.keepTillItTimesOut[z].orderID === orderID) {isFound = true; Z = z; break; }
        }
        if (!isFound) {
            this.keepTillItTimesOut.push({ orderID, price_: 0, status_: 0, note_: 0, left_: 0, leftCheck_: 0 });
            Z = size;
        }
        return Z;
    }

    getLeft(productID, delta = 0, initialIfNull = null, reOrderLevel = 0){
        let p = null, isFound = false;
        for (let i = 0; i < this.productLeft.length; i++) {
            if (this.productLeft[i].id === productID) { p = i; isFound = true; break; }
        }
        if (!isFound) {
            this.productLeft.push({ id: productID, left: initialIfNull });
            p = this.productLeft.length - 1;
        } else {
            this.productLeft[p].left = this.productLeft[p].left + delta;
        }
        console.log('ID123 others-', productID, delta, initialIfNull, isFound);
        
        console.log('ID123 productLeft-', this.productLeft[p]);
        // console.log('ID12 productsLeft-', this.productLeft);
        return this.productLeft[p].left;
    }

    markChangedOnes(listOrders) {
        const dataTemp = JSON.parse(JSON.stringify(listOrders));
        const dataPrev = this.listOrdersPrev === null ? dataTemp : this.listOrdersPrev;
        console.log('ID123 dataTemp', dataTemp);
        console.log('ID123 dataPrev', dataPrev);
        if (dataPrev) {
            for (let x = 0; x < dataTemp.length; x++) {
                let price, prevPrice, status, prevStatus, note, prevNote;

                for (let y = 0; y < dataPrev.length; y++) {
                    console.log('ID123 dataTemp[x], dataPrev[y]', dataTemp[x], dataPrev[y]);
                    // if new order addition is complete update balance of left items
                    if (dataPrev[y].orderID === '-10' && dataTemp[x].orderID !== '-10' && dataPrev[y].productID === dataTemp[x].productID) {
                        // check if dataTemp[x].orderID is new one and add to left only if new one (not found among prev orders)
                        let isFound2 = false;
                        for (let y2 = 0; y2 < dataPrev.length; y2++) {
                            if (dataPrev[y2].orderID === dataTemp[x].orderID) { isFound2 = true; break; }
                        }
                        let isDealMade = false; let x1 = x; let latest = dataTemp[x].orderID;
                        if (!isFound2) {
                            for (let x2 = 0; x2 < dataTemp.length; x2++) {
                                if (dataTemp[x2].orderID < latest) { latest = dataTemp[x2].orderID; x1 = x2; }
                            }
                            if (dataTemp[x1].status !== "REJECTED") isDealMade = true;
                            if (dataTemp[x1].status === "ORDER_PLACED") {isDealMade = false; dataTemp[x1].orderID = '-10';}
                            console.log('id123 dataTemp[x1]-', dataTemp[x1].status);
                            if (dataTemp[x1].status === "DEAL_MADE") {
                                const z2 = this.getZ(dataTemp[x].orderID)
                                this.keepTillItTimesOut[z2].price_ = 1;
                                this.keepTillItTimesOut[z2].status_ = 1;
                                dataTemp[x]["price_T"] = 1;
                                dataTemp[x]["status_T"] = 1;
                            }
                        }
                        if (!isFound2 && isDealMade) this.getLeft(dataTemp[x].productID, dataTemp[x].quantity, dataTemp[x].quantity);
                        // console.log('ID123 left after new order - set', left, dataTemp[x], dataPrev[y]);
                    }

                    if (dataPrev[y].orderID === dataTemp[x].orderID) {
                        prevPrice = dataPrev[y].dealPrice;
                        prevStatus = dataPrev[y].status;
                        // prevNote = dataPrev[y].note;
                        price = dataTemp[x].dealPrice;
                        status = dataTemp[x].status;
                        // note = dataTemp[x].note;
                        
                        const z = this.getZ(dataTemp[x].orderID);
                        let tempTriggerTimer;

                        if (price !== prevPrice) {
                            this.keepTillItTimesOut[z].price_ = 1;
                            tempTriggerTimer = 1;
                        } else {
                            tempTriggerTimer = 0;
                        }
                        dataTemp[x]["price_"] = this.keepTillItTimesOut[z].price_;
                        dataTemp[x]["price_T"] = tempTriggerTimer;

                        if (status !== prevStatus) {
                            this.keepTillItTimesOut[z].status_ = 1;
                            tempTriggerTimer = 1;
                        } else {
                            tempTriggerTimer = 0;
                        }
                        dataTemp[x]["status_"] = this.keepTillItTimesOut[z].status_;
                        dataTemp[x]["status_T"] = tempTriggerTimer;

                        // console.log('ID12-', note !== prevNote, note, prevNote, JSON.stringify(dataPrev));
                        // if (note !== prevNote) {
                        //     this.keepTillItTimesOut[z].note_ = 1;
                        // } else {
                        //     tempTriggerTimer = 0;
                        // }
                        // dataTemp[x]["note_"] = this.keepTillItTimesOut[z].note_;
                        // dataTemp[x]["note_T"] = tempTriggerTimer;

                    }
                }
            }
        }
        // console.log('dataTemp', dataTemp, this.keepTillItTimesOut);
        
        this.listOrdersPrev = dataTemp;
        return dataTemp;
    }

    markChangedOnesRules(listReOrdersRules) {
        const dataTemp = JSON.parse(JSON.stringify(listReOrdersRules));
        const dataPrev = this.listReOrderRulesPrev === null ? dataTemp : this.listReOrderRulesPrev;
        if (dataPrev) {
            for (let x = 0; x < dataTemp.length; x++) {
                for (let y = 0; y < dataPrev.length; y++) {
                    if (dataPrev[y].reorderRuleID === dataTemp[x].reorderRuleID) {

                        const z = this.getZ(dataTemp[x].reorderRuleID);
                        let temp, temp2, tempTriggerTimer;

                        let left = this.getLeft(dataTemp[x].productID, 0, dataTemp[x].reorderQnty);
                        
                        console.log('ID12 left, reorderLevel, leftCheck_, isJustOrdered', left, dataTemp[x].reorderLevel, this.keepTillItTimesOut[z].leftCheck_, dataPrev[y].isJustOrdered);

                        if (left >= dataTemp[x].reorderLevel && this.keepTillItTimesOut[z].leftCheck_ === 0 && dataTemp[x].isRuleEffective) {
                            left = this.getLeft(dataTemp[x].productID, ((dataTemp[x].reorderQnty - dataTemp[x].reorderLevel) / 4) * -1, dataTemp[x].reorderLevel);
                            
                            // if (left < dataTemp[x].reOrderLevel) left = this.getLeft(dataTemp[x].productID, dataTemp[x].reOrderLevel - left);
                            this.keepTillItTimesOut[z].left_ = 1;
                            this.keepTillItTimesOut[z].left_T = 1;
                            this.keepTillItTimesOut[z].leftCheck_ = 1;
                            this.keepTillItTimesOut[z].leftCheck_T = 1;
                            // dataTemp[x]["isJustOrdered"] = false;
                            if (left <= dataTemp[x].reorderLevel) { // && !dataPrev[y].isJustOrdered) {
                                dataTemp[x]["isJustOrdered"] = true;
                                const orderNew = JSON.parse(JSON.stringify(dataTemp[x]));
                                orderNew.orderID = new Date('January 1, 2022 00:00:00') - new Date();
                                orderNew.note = 'ph';
                                orderNew.dealPrice = 0;
                                orderNew.status = 'ORDER_PLACED';
                                orderNew.quantity = dataTemp[x].reorderQnty;
                                console.log('ID12 orderNew b4 add - ', orderNew);
                                this.addNewOrder(orderNew);
                            }
                        } else {
                            dataTemp[x]["isJustOrdered"] = true;
                        }
                        dataTemp[x]["left_"] = this.keepTillItTimesOut[z].left_;
                        dataTemp[x]["left_T"] = this.keepTillItTimesOut[z].left_T;
                        dataTemp[x]["leftCheck_"] = this.keepTillItTimesOut[z].leftCheck_;
                        dataTemp[x]["leftCheck_T"] = this.keepTillItTimesOut[z].leftCheck_T;
                        dataTemp[x]["left"] = this.getLeft(dataTemp[x].productID);
                        // if (dataTemp[x].left < dataTemp[x].reOrderLevel) dataTemp[x].left = dataTemp[x].reOrderLevel;
                    }
                }
            }
        }
        console.log('ID12 dataTemp-', dataTemp, this.keepTillItTimesOut);
        
        this.listReOrderRulesPrev = dataTemp;
        return dataTemp;
    }

    render() {
        console.log('newAssemblyPROPS-', this.props);
        console.log('newAssemblySTATE-', this.state);
        console.log('listOrders is2simulateUpdate', this.is2simulateUpdate);
        console.log('listOrders listOrders', this.state.listOrders);
        let listOrders;

        if (this.is2simulateUpdate) {
            listOrders = this.markChangedOnes(this.state.listOrders);
            this.is2simulateUpdate = false;
        } else {
            listOrders = (this.props.data && this.props.data.listOrders) ? this.markChangedOnes(this.props.data.listOrders.items) : null;
        };
        let listReOrderRules;
        if (this.is2simulateUpdateRule) {
            listReOrderRules = this.markChangedOnesRules(this.state.listReOrderRules);
            this.is2simulateUpdateRule = false;
        } else {
            listReOrderRules = (this.props.dataRules && this.props.dataRules.listReOrderRules) ? this.markChangedOnesRules(this.props.dataRules.listReOrderRules.items) : null;
        };
        
        if (!this.state.productsAll || this.state.productsAll.length === 0) {
            if (this.props.products.length > 0) this.handleSync();
        }

        console.log('listOrders in render', listOrders, listReOrderRules);
        
        return (
            <div>
                {this.props.products.length !== this.state.productsAll.length &&
                    this.state.productsAll.length > 0 &&
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
                                const noRuleProducts = this.noRuleProducts(productsListFromProps);
                                const productsAll = this.allProducts(productsListFromProps);
                                this.setState(() => ({
                                    products: productsAll,
                                    productsNoRule: noRuleProducts,
                                    productsAll,
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
                                const noRuleProducts = this.noRuleProducts(productsListFromProps);
                                const productsAll = this.allProducts(productsListFromProps);
                                this.setState(() => ({
                                    products: productsAll,
                                    productsNoRule: noRuleProducts,
                                    productsAll,
                                }));
                            }}>dismiss
                            </span>
                        <hr />
                    </div>
                }
                <span className="responsiveFSize">{this.props.companyName}</span>
                <br/>
                <span className="responsiveFSize">Re-order rules</span>&nbsp; &nbsp;
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
                    }}>new &nbsp;
                    </span>

                <span
                    className={(this.props.dataRules.listReOrderRules && this.props.dataRules.listReOrderRules.nextToken) ? "addnlightbg notbold cursorpointer" : "addnlightbgoff notbold"}
                    onClick={(this.props.dataRules.listReOrderRules && 
                        this.props.dataRules.listReOrderRules.nextToken) 
                        ? () => this.showPreviousROR(this.props.dataRules.listReOrderRules.nextToken) : null}
                >prev &nbsp;
                    </span>
                <span
                    className={this.state.currentPositionROR !== 0 
                        ? "addnlightbg notbold cursorpointer" : "addnlightbgoff notbold"}
                    onClick={this.state.currentPositionROR !== 0 ? () => this.showNextROR(this.props.dataRules.listReOrderRules.nextToken) : null}
                >next &nbsp;
                    </span>
                <span
                    className="addnlightbg notbold cursorpointer"
                    onClick={() => this.showPreviousROR(null)}
                >latest 4
                </span>
                <table id="tableFM">
                    <tbody>
                        <tr>
                            <td></td>
                            <td>product</td>
                            <td>reorder x @ y, rating, price</td>
                            <td>left</td>
                        </tr>
                        {listReOrderRules && listReOrderRules.length === 0 && 
                            <tr>
                                <td></td>
                                <td>&nbsp;</td>
                                <td>(no re-order rule)</td>
                                <td></td>
                            </tr>
                        }
                        {listReOrderRules && [].concat(listReOrderRules).sort((a, b) =>
                            a.reorderRuleID.localeCompare(b.reorderRuleID)).map((orderRule) =>
                                <tr key={orderRule.reorderRuleID} className={orderRule.reorderRuleID === '-10' ? 'responsiveBlue' : 'responsiveBlack'}>
                                    <td>
                                        {!orderRule.isRuleEffective && <span className="notbold cursorpointer responsiveGreen"
                                            onClick={() => this.handleSuspendResumeWithButton(orderRule)}
                                        >&#9654;</span>}
                                        {orderRule.isRuleEffective && <span className="addnlightbg notbold cursorpointer"
                                            onClick={() => this.handleSuspendResumeWithButton(orderRule)}
                                        >&#9724;</span>}
                                    </td>
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
                                    <td>{this.getThresholdText(orderRule, true)} - {orderRule.reorderLevel}</td>

                                    <td>
                                    {<span className={(orderRule.left_ === 1 && orderRule.reorderLevel !== '-10')
                                        ? 'responsiveGreen' : (orderRule.reorderRuleID === '-10' ? 'responsiveBlue' : 'responsiveBlack')}>
                                        {orderRule.left < orderRule.reorderLevel ? orderRule.reorderLevel : orderRule.left }</span>}
                                    {orderRule.left_T === 1 && orderRule.reorderRuleID !== '-10' &&
                                        setTimeout(() => this.fromTimer(orderRule.reorderRuleID, 'left'), 2500)}
                                    {orderRule.left_T === 1 && orderRule.reorderRuleID !== '-10' && this.fromTimer(orderRule.reorderRuleID, 'left_T')}
                                    {orderRule.leftCheck_T === 1 && orderRule.reorderRuleID !== '-10' &&
                                            setTimeout(() => this.fromTimer(orderRule.reorderRuleID, 'leftCheck'), Math.round(Math.random() * 2000) + 4000)}
                                    {orderRule.leftCheck_T === 1 && orderRule.reorderRuleID !== '-10' && this.fromTimer(orderRule.reorderRuleID, 'leftCheck_T')}
                                    </td>

                                </tr>
                            )}
                    </tbody>
                </table>

                <div>
                    <span className="verIndentFive"></span>
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
                        }}>new &nbsp;
                    </span>

                    <span
                        className={(this.props.data.listOrders && this.props.data.listOrders.nextToken) ? "addnlightbg notbold cursorpointer" : "addnlightbgoff notbold"}
                        onClick={(this.props.data.listOrders && this.props.data.listOrders.nextToken) ? () => this.showPrevious(this.props.data.listOrders.nextToken) : null}
                    >prev &nbsp;
                    </span>
                    <span
                        className={this.state.currentPosition !== 0 ? "addnlightbg notbold cursorpointer" : "addnlightbgoff notbold"}
                        onClick={this.state.currentPosition !== 0 ? () => this.showNext(this.props.data.listOrders.nextToken) : null}
                    >next &nbsp;  
                    </span>

                    <span
                        className="addnlightbg notbold cursorpointer"
                        onClick={() => this.showPrevious(null)}
                    >latest 4
                    </span>

                    <table id="tableFM">
                        <tbody>
                            <tr>
                                <td>qnty, rating, price (target / actual)</td>
                                <td>status</td>
                            </tr>
                            {listOrders && listOrders.length === 0 &&
                                <tr>
                                    <td>&nbsp; (no orders)</td>
                                    <td>&nbsp;</td>
                                </tr>}


                            {listOrders && [].concat(listOrders).sort((a, b) => a.orderID.localeCompare(b.orderID)).map((order, i) =>
                                <tr key={order.orderID} className={order.orderID === '-10' ? 'responsiveBlue' : 'responsiveBlack'}> 
                                {/* style={order.orderID === '-10' ? { color: 'red' } : { color: 'black' } }*/}
                                    <td>
                                        {order.product.name}-{order.product.modelNo} - {order.quantity}
                                        {order.status !== "REJECTED" && this.getThresholdText(order, false)}
                                        /&nbsp;
                                        {(order.status !== "ORDER_PLACED" && order.status !== "REJECTED" && order.dealPrice) &&
                                            <span className={(order.price_ === 1 && order.orderID !== '-10') 
                                            ? 'responsiveGreen' : (order.orderID === '-10' ? 'responsiveBlue' : 'responsiveBlack')}>
                                            ${order.dealPrice.toFixed(2)}</span>}
                                        {order.price_T === 1 && order.orderID !== '-10'
                                            && setTimeout(() => this.fromTimer(order.orderID, 'price'), 3000)}
                                        {order.status === "ORDER_PLACED" && '  --'}
                                        {order.status === "REJECTED" && <span className="responsiveGreen">
                                            {order.note}</span>}
                                        {/*order.status === "REJECTED" && order.note_T === 1 && order.orderID !== '-10' && 
                            setTimeout(() => this.fromTimer(order.orderID, 'note'), 3000 )*/}
                                    </td>
                                    <td>
                                        {<span className={(order.status_ === 1 && order.orderID !== '-10') 
                                            ? 'responsiveGreen' : (order.orderID === '-10' ? 'responsiveBlue' : 'responsiveBlack')}>
                                            {order.status.toLowerCase()}</span>}
                                        {order.status_T === 1 && order.orderID !== '-10' && 
                                        setTimeout(() => this.fromTimer(order.orderID, 'status'), 3000)}
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
            console.log('ID34 limit, nextToken, companyID-', limit, nextToken, companyID);
            
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
                    // variables: {
                    //     limit: props.ownProps.limit,
                    //     nextToken: null,
                    //     companyID: props.ownProps.companyID 
                    // },
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
    graphql(ListReOrderRules, {
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
            dataRules: {
                listReOrderRules: {
                    items: props.data.listReOrderRules ? props.data.listReOrderRules.items : [],
                    nextToken: props.data.listReOrderRules ? props.data.listReOrderRules.nextToken : [],
                }
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
    // subscription to order updates - user can not update order- but AWS Lambda changes status of orders
    // that is why this subs is added
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
                    // variables: {
                    //     limit: props.ownProps.limit,
                    //     nextToken: null,
                    //     companyID: props.ownProps.companyID
                    // },
                    updateQuery: (prev, { subscriptionData: { data: { onUpdateOrder } } }) => {
                        console.log('onUpdateOrder - ', onUpdateOrder);
                        let toReturn;
                        if (onUpdateOrder.companyID === props.ownProps.companyID) {
                            prev = {
                                ...prev,
                                listOrders: {
                                    __typename: 'OrderConnection',
                                    items: [onUpdateOrder, ...prev.listOrders.items.filter(order => order.orderID !== onUpdateOrder.orderID)]
                                }
                            }
                        }
                        toReturn = {
                            ...prev,
                            listOrders: {
                                __typename: 'OrderConnection',
                                items: [...prev.listOrders.items.filter(order => order.companyID === props.ownProps.companyID)]
                            }
                        }

                        return toReturn;
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
    graphql(ListReOrderRules, {
        options: ({ limit, nextToken, companyID }) => {
            return ({
                variables: { limit, nextToken, companyID },
                fetchPolicy: 'cache-and-network'
            });
        },
        props: props => ({
            getReOrderRulesBatch: (limit, nextToken, companyID) => {
                console.log('nextToken, companyID', nextToken, companyID);

                // searchQuery = searchQuery.toLowerCase()
                return props.data.fetchMore({
                    query: ListReOrderRules, // searchQuery === '' ? ListIceCreams : SearchIceCreams,
                    variables: {
                        limit, nextToken, companyID
                    },
                    updateQuery: (previousResult, { fetchMoreResult }) => ({
                        ...previousResult,
                        listReOrderRules: {
                            ...previousResult.listReOrderRules,
                            items: fetchMoreResult.listReOrderRules.items,
                            nextToken: fetchMoreResult.listReOrderRules.nextToken
                        }
                    })
                })
            },
            dataRules: props.data
        })
    }),
    graphql(CreateOrder, {
        props: props => ({
            onAdd: order => props.mutate({
                variables: order,
                // Optimistic Update worked when I used queries without using limit, nextToken and companyID
                // but with these variables I could not make them work. I implemented it manually and custom based
                // optimisticResponse: {
                //     __typename: 'Mutation',
                //     createOrder: { ...order, orderID: Math.round(Math.random() * -1000000), __typename: 'Order' }
                // },
                // update: (proxy, { data: { createOrder } }) => {
                //     // 1
                //     const data2 = proxy.readQuery({
                //         query: ListOrders,
                //         variables: {
                //             limit: props.ownProps.limit,
                //             nextToken: null,
                //             companyID: props.ownProps.companyID 
                //         }
                //     });
                //     console.log('data2 b4', data2.listOrders.items.length, JSON.stringify(data2));
                //     // data2.listOrders.items.push(createOrder);
                //     data2.listOrders.items = [
                //         ...data2.listOrders.items.filter(e => {
                //             // console.log('e = ', e);
                //             // console.log('e.orderID = ', e.orderID);
                //             return e.orderID !== createOrder.orderID
                //         })
                //         , createOrder];

                //     console.log('data2 after', data2.listOrders.items.length, JSON.stringify(data2));
                //     proxy.writeQuery({ query: ListOrders, data: data2 });
                    
                //     // 2
                //     // const data = proxy.readQuery({ query: QueryAllOrders });
                //     // data.listOrders.items.push(createOrder);
                //     // proxy.writeQuery({ query: QueryAllOrders, data });
                // },
                refetchQueries: [
                    {
                        query: ListOrders,
                        variables: {
                            limit: props.ownProps.limit,
                            nextToken: null,
                            companyID: props.ownProps.companyID
                        },
                    },
                ],

            })
        }),
    }),
    graphql(CreateReOrderRule, {
        props: props => ({
            onAddRule: rule => props.mutate({
                variables: rule,
                // optimisticResponse: {
                //     __typename: 'Mutation',
                //     createReOrderRule: { ...rule, id: Math.round(Math.random() * -1000000), __typename: 'ReOrderRule' }
                // },
                // update: (proxy, { data: { createReOrderRule } }) => {
                //     const data = proxy.readQuery({
                //         query: ListReOrderRules,
                //         variables: {
                //             limit: props.ownProps.limit,
                //             nextToken: null,
                //             companyID: props.ownProps.companyID
                //         }
                //     });
                //     data.listReOrderRules.items = [
                //         ...data.listReOrderRules.items.filter(e => {
                //             return e.reorderRuleID !== createReOrderRule.reorderRuleID
                //         })
                //         , createReOrderRule];
                //     proxy.writeQuery({ query: ListReOrderRules, data });
                // },
                refetchQueries: [
                    {
                        query: ListReOrderRules,
                        variables: {
                            limit: props.ownProps.limit,
                            nextToken: null,
                            companyID: props.ownProps.companyID
                        },
                    },
                ],
            })
        }),
    }),
    graphql(UpdateReOrderRule, {
        props: props => ({
            onUpdateRule: rule => props.mutate({
                variables: rule,
                // optimisticResponse: {
                //     __typename: 'Mutation',
                //     updateReOrderRule: { ...rule, id: Math.round(Math.random() * -1000000), __typename: 'ReOrderRule' }
                // },
                update: (proxy, { data: { updateReOrderRule } }) => {
                    const data = proxy.readQuery({
                        query: ListReOrderRules,
                        variables: {
                            limit: props.ownProps.limit,
                            nextToken: null,
                            companyID: props.ownProps.companyID
                        }
                    });
                    data.listReOrderRules.nextToken = null;
                    data.listReOrderRules.items = [
                        ...data.listReOrderRules.items.filter(e => {
                            return e.reorderRuleID !== updateReOrderRule.reorderRuleID
                        })
                        , updateReOrderRule];
                    
                    proxy.writeQuery({ query: ListReOrderRules, data });
                },
            })
        }),
    }),
    graphql(MutationDeleteReOrderRule, {
        props: props => ({
            deleteReOrderRule: rule => props.mutate({
                variables: rule,
                // optimisticResponse: {
                //     __typename: 'Mutation',
                //     deleteReOrderRule: { ...rule, id: Math.round(Math.random() * -1000000), __typename: 'ReOrderRule' }
                // },
                // update: (proxy, { data: { deleteReOrderRule } }) => {
                //     const data = proxy.readQuery({
                //         query: ListReOrderRules,
                //         variables: {
                //             limit: props.ownProps.limit,
                //             nextToken: null,
                //             companyID: props.ownProps.companyID
                //         }
                //     });
                //     data.listReOrderRules.items = [
                //         ...data.listReOrderRules.items.filter(e => {
                //             return e.reorderRuleID !== deleteReOrderRule.reorderRuleID
                //         })];
                //     proxy.writeQuery({ query: ListReOrderRules, data });
                // }
                refetchQueries: [
                    {
                        query: ListReOrderRules,
                        variables: {
                            limit: props.ownProps.limit,
                            nextToken: null,
                            companyID: props.ownProps.companyID
                        },
                    },
                ],

            })
        }),
    }),
)(AssemblingCo)
