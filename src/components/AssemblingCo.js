import React from 'react'
import Modal from 'react-modal';
import { graphql, compose } from 'react-apollo'

import CreateOrder from '../graphQL/mutationAddOrder';
import CreateReOrderRule from '../graphQL/mutationAddReorderRule';
import UpdateReOrderRule from "../graphQL/mutationUpdateReorderRule";
import ListOrders from "../graphQL/queryOrdersWithData";
import ListAllOrders from "../graphQL/queryAllOrdersForCo";
import QueryAllProducts from "../graphQL/queryAllProducts";
import ListReOrderRules from "../graphQL/queryAllReorderRules";
import ListAllReOrderRules from "../graphQL/queryAllReorderRulesNoCo";
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
    listAllOrdersPrev;
    listReOrderRulesPrev;
    listAllReOrderRulesPrev;
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
        const noRuleProducts = this.noRuleProducts(productsListFromProps);
        const productsAll = this.allProducts(productsListFromProps);
        this.state = {
            modalIsOpen: false,
            order: this.newOrder(),
            listOrders: null,
            listAllOrders: null,
            listReOrderRules: null,
            listAllReOrderRules: null,
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
            is2reRender: false,
            withPg: false,
            withPgRules: false,
            isAlertShown: false
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
        if (productsListFromProps.length > 0 && this.props.dataAllRules.listAllRules 
            && this.props.dataAllRules.listAllRules.items.length > 0) {
            let coOrders;
            const rulesForCo = this.props.dataAllRules.listAllRules.items.filter((item) => item.companyID === this.props.companyID);
            rulesForCo.forEach((item) => { coOrders = coOrders + item.productID + ';;' });
            const l = productsListFromProps.length;
            let indexedproductsNoRule = [];
            let count = 0;
            for (let x = 0; x < l; x++) {
                if (coOrders && !(coOrders.includes(productsListFromProps[x].id))) {
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

    // updates settlement type when other radio button in pop-up modal is selected
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

    // updates order type when other radio button in pop-up modal is selected
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
        return newProducts;
    }

    // generates text to display in orders table
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

    // if re-order rule already exists for this product do not create new re-order rule, offer to update existing one
    updateModalState() {
        let isFound = false; let xF = -1;
        let allRulesForCo;
        if (this.state.oneOffOrRule === 2 && this.props.dataAllRules.listAllRules) {
            allRulesForCo = this.props.dataAllRules.listAllRules.items.filter((item) => item.companyID === this.props.companyID);
            for (let x = 0; x < allRulesForCo.length; x++) {
                if (allRulesForCo[x].productID === this.state.products[this.state.selectedOption].details.id) {
                    isFound = true; xF = x;
                }
            }
        }

        // if found update only
        if (isFound) {
            const deepCopyRule = allRulesForCo ? JSON.parse(JSON.stringify(allRulesForCo[xF])) : null;
            this.setState({
                order: deepCopyRule,
                isSubmitValid: true,
                isUpdate: true
            }, () => console.log('after PR SEL', this.state.order))
        } else {
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

    // saves resume or suspend state of re-order rules
    // triggered from pop-up MODAL
    handleSuspendResume(order, e) {
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
                this.props.onUpdateRule({ ...order });
                this.restoreDefaults();
            })
        }
    }

    // saves resume or suspend state of re-order rules
    // triggered from MAIN SCREEN
    handleSuspendResumeWithButton = async (order) => {
        const suspendOrResume = order.isRuleEffective ? 'suspend' : 'resume';
        if (window.confirm(`Are you sure you want to ${suspendOrResume} this re-order rule ?`)) {
            let indexOfTurnedOn = null;
            const allRulesForCo = this.props.dataAllRules.listAllRules.items.filter((item) => item.companyID === this.props.companyID);
            for (let z = 0; z < allRulesForCo.length; z++) {
                if (allRulesForCo[z].isRuleEffective) { indexOfTurnedOn = z; break; }
            }
            if (indexOfTurnedOn) {
                const ruleToTurnOff = JSON.parse(JSON.stringify(allRulesForCo[indexOfTurnedOn]))
                ruleToTurnOff.isRuleEffective = !ruleToTurnOff.isRuleEffective;
                await this.props.onUpdateRule({ ...ruleToTurnOff });
                order.isRuleEffective = !order.isRuleEffective;
                this.props.onUpdateRule({ ...order });
                this.restoreDefaults();
            } else {
                order.isRuleEffective = !order.isRuleEffective;
                this.props.onUpdateRule({ ...order });
                this.restoreDefaults();
            }
        }
    }

    handleDelete = async (order, e) => {
        e.preventDefault();
        if (this.state.oneOffOrRule === 1) {
            // orders can not be deleted
        } else if (this.state.oneOffOrRule === 2) {
            if (window.confirm(`Are you sure you want to delete this re-order rule ?`)) {
                const allRulesForCo = this.props.dataAllRules.listAllRules.items.filter((item) => item.companyID === this.props.companyID);
                let listReOrderRules = JSON.parse(JSON.stringify(allRulesForCo));                
                listReOrderRules = listReOrderRules.filter((item) => item.reorderRuleID !== order.reorderRuleID);
                this.is2simulateUpdateRule = true;
                this.setState({
                    loading: true,
                    modalIsOpen: false,
                    listReOrderRules,
                    listAllReOrderRules: listReOrderRules
                });

                this.props.deleteReOrderRule(order);
                this.restoreDefaults();
            }
        }
    }

    handleSaveNew = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (this.state.oneOffOrRule === 1) {
            const { order } = this.state;
            this.addNewOrder(order);
        } else if (this.state.oneOffOrRule === 2) {
            const { order } = this.state;
            let orderTemp = JSON.parse(JSON.stringify(order));
            orderTemp.reorderRuleIDnext = orderTemp.reorderRuleID;
            orderTemp.reorderRuleID = '-10';
            this.state.productsAll.map((item) => {
                if (item.details.id === orderTemp.productID) orderTemp.product = item.details;
            });
            const prevThree = []; let count = 0;
            const allRulesForCo = this.props.dataAllRules.listAllRules.items.filter((item) => item.companyID === this.props.companyID);
            [].concat(allRulesForCo).sort((a, b) => a.reorderRuleID.localeCompare(b.reorderRuleID)).map((order) => {
                count++; if (count < 4) prevThree.push(order);
            });

            const listReOrderRules = [orderTemp, ...prevThree];
            const listAllReOrderRules = [orderTemp, ...this.props.dataAllRules.listAllRules.items]
            this.is2simulateUpdateRule = true;
            this.setState({
                loading: true,
                modalIsOpen: false,
                listReOrderRules,
                listAllReOrderRules
            });

            this.props.onAddRule({ ...order });
        }
        this.restoreDefaults();
    }

    addNewOrder(order) {
        let orderTemp = JSON.parse(JSON.stringify(order));
        orderTemp.orderIDnext = orderTemp.orderID;
        orderTemp.orderID = '-10';
        this.state.productsAll.map((item) => {
            if (item.details.id === orderTemp.productID) orderTemp.product = item.details;
        });
        const prevThree = []; let count = 0;
        if (this.props.data.listOrders) {
            [].concat(this.props.data.listOrders.items).sort((a, b) => a.orderID.localeCompare(b.orderID)).map((order) => {
                count++; if (count < 4) prevThree.push(order);
            });
        }
        const listOrders = [orderTemp, ...prevThree];
        this.is2simulateUpdate = true;
        this.setState({
            loading: true,
            modalIsOpen: false,
            listOrders,
            listAllOrders: [orderTemp, ...this.props.dataAll.listAllOrders.items]
        });
        this.props.onAdd({ ...order });
    }

    handleSaveUpdate = async (e) => {
        this.setState({ loading: true, modalIsOpen: false });
        e.stopPropagation();
        e.preventDefault();

        if (this.state.oneOffOrRule === 1) {
            // orders cannot be updated
        } else if (this.state.oneOffOrRule === 2) {
            const { order } = this.state;
            let orderTemp = JSON.parse(JSON.stringify(order));
            orderTemp.reorderRuleID = '-10';
            this.state.productsAll.map((item) => {
                if (item.details.id === orderTemp.productID) orderTemp.product = item.details;
            });
            const prevThree = []; let count = 0;
            const allRulesForCo = this.props.dataAllRules.listAllRules.items.filter((item) => item.companyID === this.props.companyID);
            [].concat(allRulesForCo).sort((a, b) => a.reorderRuleID.localeCompare(b.reorderRuleID)).map((order) => {
                count++; if (count < 4) prevThree.push(order);
            });

            const listReOrderRules = [orderTemp, ...prevThree];
            this.is2simulateUpdateRule = true;
            this.setState({
                loading: true,
                modalIsOpen: false,
                listReOrderRules
            });
            this.props.onUpdateRule({ ...order });
        }
        this.restoreDefaults();
    }

    restoreDefaults = () => {
        const productsListFromProps = this.props.products ? this.props.products : null;
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

    // when markChangedOnes() function below detects changed values it changes relevant value below to 1.
    // That item in render is colored to light green in table. setTimeout is set to expire in 3 secs.
    // When 3 secs pass setTimeout function calls below function (fromTimer).
    // It cancels update color feedbacks changing values back to zero and updating state.
    // This time markChangedOnes() detects no change and text is colored to black again.
    fromTimer(id, field) {
        const z = this.getZ(id);
        if (field === "price") this.keepTillItTimesOut[z].price_ = 0;
        if (field === "status") this.keepTillItTimesOut[z].status_ = 0;
        if (field === "statusCheck_T") this.keepTillItTimesOut[z].statusCheck_T = 0;
        if (field === "note") this.keepTillItTimesOut[z].note_ = 0;
        if (field === "left") this.keepTillItTimesOut[z].left_ = 0;
        if (field === "left_T") this.keepTillItTimesOut[z].left_T = 0;
        if (field === "leftCheck") this.keepTillItTimesOut[z].leftCheck_ = 0;
        if (field === "leftCheck_T") this.keepTillItTimesOut[z].leftCheck_T = 0;
        this.setState(prevState => ({is2reRender: !prevState.is2reRender}));
    }

    // keepTillItTimesOut stores values for a specific field of a specific offer. 
    // getZ function returns index in keepTillItTimesOut array that holds info for that offer
    // if keepTillItTimesOut for a specific offerID is not found it will add one
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

    // tracks volume of products left in stock - when volume in stock equals or falls below reOrder level product is re-ordered
    // uses default values as not all function calls provide all params
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
        return this.productLeft[p].left;
    }

    // markChangedOnes() detects changed values and marks them for color highlighting (light green)
    markChangedOnes(listOrders, type) {
        
        let dataTemp = JSON.parse(JSON.stringify(listOrders));
        let dataPrev;
        if (type === 0) dataPrev = this.listOrdersPrev === null ? dataTemp : this.listOrdersPrev;
        if (type === 1) dataPrev = this.listAllOrdersPrev === null ? dataTemp : this.listAllOrdersPrev;
        if (dataPrev) {
            let isFoundN = false; let yN;
            for (let y = 0; y < dataPrev.length; y++) {
                if (dataPrev[y].orderID === '-10') { isFoundN = true; yN = y; }
            }
            if (isFoundN) {
                let isNotFoundN = true;
                for (let x = 0; x < dataTemp.length; x++) {
                    if (dataTemp[x].orderID == dataPrev[yN].orderIDnext) isNotFoundN = false;
                }
                const prevThree = []; let count = 0;
                [].concat(dataTemp).sort((a, b) => a.orderID.localeCompare(b.orderID)).map((order) => {
                    count++; if (count < 4) prevThree.push(order);
                });
                
                if (isNotFoundN) dataTemp = [dataPrev[yN], ...prevThree];
            }
            
            for (let x = 0; x < dataTemp.length; x++) {
                let price, prevPrice, status, prevStatus;

                for (let y = 0; y < dataPrev.length; y++) {
                    if ( dataPrev[y].orderID === dataTemp[x].orderID || (dataPrev[y].orderID === '-10' && dataTemp[x].orderID === dataPrev[y].orderIDnext) ) {
                        prevPrice = dataPrev[y].dealPrice;
                        prevStatus = dataPrev[y].status;
                        price = dataTemp[x].dealPrice;
                        status = dataTemp[x].status;
                        
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
                            this.keepTillItTimesOut[z].statusCheck_T = 1;
                            tempTriggerTimer = 1;
                        } else {
                            tempTriggerTimer = 0;
                        }
                        dataTemp[x]["status_"] = this.keepTillItTimesOut[z].status_;
                        dataTemp[x]["statusCheck_T"] = this.keepTillItTimesOut[z].statusCheck_T;
                        dataTemp[x]["status_T"] = tempTriggerTimer;
                    }
                }
            }
        }
        
        if (type === 0) this.listOrdersPrev = dataTemp;
        if (type === 1) this.listAllOrdersPrev = dataTemp;
        return dataTemp;
    }

    markChangedOnesRules(listReOrdersRules, type) {
        let dataTemp = JSON.parse(JSON.stringify(listReOrdersRules));
        console.log('dataTemp 21', dataTemp);
        let dataPrev;
        if (type === 0) dataPrev = this.listReOrderRulesPrev === null ? dataTemp : this.listReOrderRulesPrev;
        if (type === 1) dataPrev = this.listAllReOrderRulesPrev === null ? dataTemp : this.listAllReOrderRulesPrev;

        if (dataPrev) {
                let isFoundN = false; let yN;
                for (let y = 0; y < dataPrev.length; y++) {
                    if (dataPrev[y].reorderRuleID === '-10') { isFoundN = true; yN = y; }
                }
                if (isFoundN) {
                    let isNotFoundN = true;
                    for (let x = 0; x < dataTemp.length; x++) {
                        if (dataTemp[x].reorderRuleID == dataPrev[yN].reorderRuleIDnext) isNotFoundN = false;
                    }

                    if (isNotFoundN) {
                        const prevThree = []; let count = 0;

                        [].concat(dataTemp).sort((a, b) => a.reorderRuleID.localeCompare(b.reorderRuleID)).map((order) => {
                            count++; if (count < 4) prevThree.push(order);
                        });

                        dataTemp = [dataPrev[yN], ...prevThree]; 
                    }
                }
            console.log('dataTemp 22', dataTemp);
            for (let x = 0; x < dataTemp.length; x++) {
                for (let y = 0; y < dataPrev.length; y++) {
                    if (dataPrev[y].reorderRuleID === dataTemp[x].reorderRuleID) {

                        const z = this.getZ(dataTemp[x].reorderRuleID);

                        let left = this.getLeft(dataTemp[x].productID, 0, dataTemp[x].reorderQnty);
                        
                        if (left >= dataTemp[x].reorderLevel && this.keepTillItTimesOut[z].leftCheck_ === 0 && dataTemp[x].isRuleEffective) {
                            left = this.getLeft(dataTemp[x].productID, ((dataTemp[x].reorderQnty - dataTemp[x].reorderLevel) / 4) * -1, dataTemp[x].reorderLevel);
                            
                            this.keepTillItTimesOut[z].left_ = 1;
                            this.keepTillItTimesOut[z].left_T = 1;
                            this.keepTillItTimesOut[z].leftCheck_ = 1;
                            this.keepTillItTimesOut[z].leftCheck_T = 1;
                            if (left <= dataTemp[x].reorderLevel) {
                                dataTemp[x]["isJustOrdered"] = true;
                                const orderNew = JSON.parse(JSON.stringify(dataTemp[x]));
                                orderNew.orderID = new Date('January 1, 2022 00:00:00') - new Date();
                                orderNew.note = 'ph';
                                orderNew.dealPrice = 0;
                                orderNew.status = 'ORDER_PLACED';
                                orderNew.quantity = dataTemp[x].reorderQnty;
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
                    }
                }
            }
        }

        if (type === 0) this.listReOrderRulesPrev = dataTemp;
        if (type === 1) this.listAllReOrderRulesPrev = dataTemp;
        return dataTemp;
    }

    render() {
        console.log('newAssemblyPROPS-', this.props);
        console.log('newAssemblySTATE-', this.state);
        let listOrders, listAllOrders;

        if (this.is2simulateUpdate) {
            if (this.state.withPg) listOrders = this.markChangedOnes(this.state.listOrders, 0);
            if (!this.state.withPg) listAllOrders = this.markChangedOnes(this.state.listAllOrders, 1);
            this.is2simulateUpdate = false;
        } else {
            if (this.state.withPg) listOrders = (this.props.data && this.props.data.listOrders) ? this.markChangedOnes(this.props.data.listOrders.items, 0) : null;
            if (!this.state.withPg) listAllOrders = (this.props.dataAll && this.props.dataAll.listAllOrders) ? this.markChangedOnes(this.props.dataAll.listAllOrders.items, 1) : null;
        };
        let listReOrderRules, listAllReOrderRules;
        if (this.is2simulateUpdateRule) {
            if (this.state.withPgRules) listReOrderRules = this.markChangedOnesRules(this.state.listReOrderRules, 0);
            if (!this.state.withPgRules) listAllReOrderRules = this.markChangedOnesRules(this.state.listAllReOrderRules, 1);
            this.is2simulateUpdateRule = false;
        } else {
            if (this.state.withPgRules) listReOrderRules = (this.props.dataRules && this.props.dataRules.listReOrderRules) ? this.markChangedOnesRules(this.props.dataRules.listReOrderRules.items, 0) : null;
            if (!this.state.withPgRules) listAllReOrderRules = (this.props.dataAllRules && this.props.dataAllRules.listAllRules) ? this.markChangedOnesRules(this.props.dataAllRules.listAllRules.items, 1) : null;
        };
        
        if (!this.state.productsAll || this.state.productsAll.length === 0) {
            if (this.props.products.length > 0) this.restoreDefaults();
        }
        
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
                
                    {this.state.withPgRules &&
                      <span>
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
                      </span>
                    }
                    <span className="horIndent"></span>
                    <label className="addnlightbg notbold cursorpointer">
                        with pagination
                        <input
                            name="withPgRules"
                            type="checkbox"
                            checked={this.state.withPgRules}
                            onChange={() => {
                                this.setState(prevState => ({ withPgRules: !prevState.withPgRules, isAlertShown: true }));
                                !this.state.isAlertShown && alert('Pagination works as expected and shows correct number of orders and re-order rules in most cases. However, in certain cases orders are not shown correctly - will try to fix it when I complete learning Apollo client in more detail');
                            }
                            }
                        />
                    </label>

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
                        {this.state.withPgRules && listReOrderRules && [].concat(listReOrderRules).sort((a, b) =>
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

                        {!this.state.withPgRules && listAllReOrderRules && [].concat(listAllReOrderRules)
                            .filter((item) => item.companyID === this.props.companyID)
                            .sort((a, b) => a.reorderRuleID.localeCompare(b.reorderRuleID))
                            .map((orderRule) =>
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
                                            {orderRule.left < orderRule.reorderLevel ? orderRule.reorderLevel : orderRule.left}</span>}
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

                    {this.state.withPg &&
                        <span>
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
                        </span>
                    }
                    <span className="horIndent"></span>
                    <label className="addnlightbg notbold cursorpointer">
                        with pagination
                    <input
                        name="withPg"
                        type="checkbox"
                        checked={this.state.withPg}
                        onChange={() => {
                                this.setState(prevState => ({withPg: !prevState.withPg, isAlertShown: true}));
                            !this.state.isAlertShown && alert('Pagination works as expected and shows correct number of orders and re-order rules in most cases. However, in certain cases orders are not shown correctly - will try to fix it when I complete learning Apollo client in more detail');
                            } 
                        }
                    />
                    </label>
                    
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


                            {this.state.withPg && listOrders && [].concat(listOrders).sort((a, b) => a.orderID.localeCompare(b.orderID)).map((order, i) =>
                                <tr key={order.orderID} className={order.orderID === '-10' ? 'responsiveBlue' : 'responsiveBlack'}> 
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

                            {/*  if pagination is NOT selected render this  */}
                            {!this.state.withPg && listAllOrders && [].concat(listAllOrders)
                                .filter((item) => item.companyID === this.props.companyID)
                                .sort((a, b) => a.orderID.localeCompare(b.orderID))
                                .map((order, i) =>
                                <tr key={order.orderID} className={order.orderID === '-10' ? 'responsiveBlue' : 'responsiveBlack'}>
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
                                    </td>
                                    <td>
                                        {<span className={(order.status_ === 1 && order.orderID !== '-10')
                                            ? 'responsiveGreen' : (order.orderID === '-10' ? 'responsiveBlue' : 'responsiveBlack')}>
                                            {order.status.toLowerCase()}</span>}
                                        {order.status_T === 1 && order.orderID !== '-10' &&
                                            setTimeout(() => this.fromTimer(order.orderID, 'status'), 3000)}
                                        {order.statusCheck_T === 1 && order.orderID !== '-10' && this.fromTimer(order.orderID, 'statusCheck_T')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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


// I UNDERSTAND that below code is very verbose, repetitive and un-professional.
// I am working on improving knowledge of Apollo Client
export default compose(
    graphql(ListAllOrders, {
        options: () => {
            return ({
                fetchPolicy: 'cache-and-network'
            });
        },
        props: props => ({
            dataAll: {
                listAllOrders: {
                    items: (props.data && props.data.listOrders) ? props.data.listOrders.items : [],
                }
            },
        })
    }),
    graphql(ListAllReOrderRules, {
        options: () => {
            return ({
                fetchPolicy: 'cache-and-network'
            });
        },
        props: props => ({
            dataAllRules: {
                listAllRules: {
                    items: (props.data && props.data.listReOrderRules) ? props.data.listReOrderRules.items : [],
                }
            },
        })
    }),
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
                    updateQuery: (prev, { subscriptionData: { data: { onUpdateOrder } } }) => {
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
                return props.data.fetchMore({
                    query: ListOrders,
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
                return props.data.fetchMore({
                    query: ListReOrderRules,
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
                update: (proxy, { data: { createOrder } }) => {
                    const data2 = proxy.readQuery({
                        query: ListAllOrders,
                    });
                    data2.listOrders.items = [
                        ...data2.listOrders.items.filter(e => {
                            return e.orderID !== createOrder.orderID
                        })
                        , createOrder];
                    proxy.writeQuery({ query: ListAllOrders, data: data2 });
                },
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
                update: (proxy, { data: { createReOrderRule } }) => {
                    const data2 = proxy.readQuery({
                        query: ListAllReOrderRules,
                    });
                    data2.listReOrderRules.items = [
                        ...data2.listReOrderRules.items.filter(e => {
                            return e.reorderRuleID !== createReOrderRule.reorderRuleID
                        })
                        , createReOrderRule];
                    proxy.writeQuery({ query: ListAllReOrderRules, data: data2 });
                },
                // above update section updates list of orders in cases when uses all orders.
                // When pagination is used refetchQueries is also used as adding or deleting would change default 4 orders either to 3 or 5 orders.
                // nextToken is set to null as any update or delete should take pagination to its very start
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
                update: (proxy, { data: { deleteReOrderRule } }) => {
                    const data = proxy.readQuery({
                        query: ListAllReOrderRules,
                    });
                    data.listReOrderRules.items = [
                        ...data.listReOrderRules.items.filter(e => {
                            return e.reorderRuleID !== deleteReOrderRule.reorderRuleID
                        })];
                    proxy.writeQuery({ query: ListAllReOrderRules, data });
                },
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
