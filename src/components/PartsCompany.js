import React, { Component } from "react";
import { graphql, compose } from 'react-apollo'
import { v4 as uuid } from "uuid";
import Modal from 'react-modal';

import QueryGetCompany from "../graphQL/queryGetCompany";
import QueryAllProducts from "../graphQL/queryAllProducts";
import QueryAllOffers from "../graphQL/queryAllOffers";
import QueryAllDeals from "../graphQL/queryAllDeals";
import MutationCreateOffer from "../graphQL/mutationAddOffer";
import MutationUpdateOffer from "../graphQL/mutationUpdateOffer";
import MutationDeleteOffer from "../graphQL/mutationDeleteOffer";
import NewProductSubscription from '../graphQL/subscriptionProducts';
import UpdateOfferSubscription from '../graphQL/subscriptionOfferUpdate';
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

    offerUpdateSubscription;
    productSubscription;
    is2simulateUpdate = false;
    listOffersPrev;
    dealsPrev;
    keepTillItTimesOut = [];


    static defaultProps = {
        company: null,
        createOffer: () => null,
        updateOffer: () => null,
        getCompany: () => null,
    }

    constructor(props) {
        super(props);
        const productsListFromProps = this.props.products ? this.props.products : null;
        const noOfferProducts = this.noOfferProducts(productsListFromProps);
        this.state = {
            modalIsOpen: false,
            offer: this.newOffer(),
            listOffers: null,
            products: noOfferProducts,
            productsNoOffer: noOfferProducts,
            productsAll: this.allProducts(productsListFromProps),
            isSubmitValid: false,
            isUpdate: false,
            isUpdateAtStart: false,
            selectedOption: -1,
            loading: false,
            infoModalData: null,
            is2reRender: false
        };

        this.openModal = this.openModal.bind(this);
        this.handleModalClose = this.handleModalClose.bind(this);
        this.handleInfoModalClose = this.handleInfoModalClose.bind(this);
    }

    componentWillMount() {
        this.offerUpdateSubscription = this.props.subscribeToUpdateOffers();
        this.productSubscription = this.props.subscribeToNewProducts();
        Modal.setAppElement('body');
    }

    componentWillUnmount() {
        // this.productSubscription();
    }

    openModal() {
        this.setState({ modalIsOpen: true });
    }

    // restore modal defaults
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

    // find product name from listProducts and assign to deals array
    // if new deal is added mark it for color feedback
    dealsFromStore() {
        let dealsTemp;
        // get deals data from store 
        try {
            dealsTemp = this.props.client.readQuery({
                query: QueryAllDeals
            });
        } catch(e) {
            console.log('readQuery error-', e);
            dealsTemp = null;
        }
        
        // as deals table stores only product id find product name from products list
        let deals = (dealsTemp && dealsTemp.listDeals && dealsTemp.listDeals.items) ? dealsTemp.listDeals.items : [];
        deals = this.props.company ? deals.filter(deal => this.props.company.id === deal.producerID) : deals;
        const theProducts = this.props.products;
        if (theProducts) {
            for (let x = 0; x < deals.length; x++) {
                for (let y = 0; y < theProducts.length; y++) {
                    if (theProducts[y].id === deals[x].productID) {
                        deals[x]["productName"] = `${theProducts[y].name}-${theProducts[y].modelNo}`;
                    }
                }
            }
        }

        // checks if deal is new and if new this code sets to show the deal in green color for 3 secs and to go black again
        if (this.dealsPrev && this.dealsPrev.length > 0 && dealsTemp && dealsTemp.listDeals.items && dealsTemp.listDeals.items.length > 0) {
            for (let x = 0; x < deals.length; x++) {
                let isFound = false;
                for (let y = 0; y < this.dealsPrev.length; y++) {
                    if (this.dealsPrev[y].dealID === deals[x].dealID) {
                        isFound = true;
                    }
                }
                const z = this.getZ(deals[x].dealID);
                if (isFound) {
                    deals[x]["isNew"] = this.keepTillItTimesOut[z].isNew_;
                    deals[x]["isNew_T"] = 0;
                } else {
                    deals[x]["isNew"] = 1;
                    deals[x]["isNew_T"] = 1;
                    this.keepTillItTimesOut[z].isNew_ = 1;
                }
            }
        }
        this.dealsPrev = deals;
        return deals;
    }


    addAverageRatingToOffers(offers, deals, companyID) {
        for (let x = 0; x < offers.length; x++) {
            offers[x]["lastTenAverageRating"] = this.getLastTenAverageRating(companyID, offers[x].productID, deals);
        }
        return offers;
    }

    // upon each order ordering company provides rating ( random rating is provided in AWS Lambda function )
    // below code gets last 10 rating for a specific product and calculates average and assigns to product offer
    getLastTenAverageRating(coID, productID, dealsForRating) {
            let theRating = 0;
            let count = 0,
            total = 0;
            let allCompanyProductRatings = [];
            dealsForRating.map((deal) => {
                if (deal.producerID == coID && deal.productID == productID) {
                    allCompanyProductRatings.push({
                        rating: parseFloat(deal.productRatingByBuyer),
                        time: parseInt(deal.dealTime)
                    });
                }
            });

            // sort result by time
            // calculate average rating
            allCompanyProductRatings.sort((a, b) => b.time - a.time).map((deal) => {
                count++;
                if (count < 11) {
                    total = total + deal.rating;
                }
            });
            theRating = total ? (total / count).toFixed(2) : 'n.a.';
        return theRating;
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
        return newProducts;
    }

    // update modal UI when certain product is selected in drop-down
    handleSelectOptionChange(selected) {
        if (selected > -1) {
            let isFound = false; let xF = -1;
            for (let x = 0; x < this.props.company.offers.items.length; x++) {
                if (this.props.company.offers.items[x].productID === this.state.products[selected].details.id) {
                    isFound = true; xF = x;
                }
            }

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
    }

    handleDelete = async (offer, e) => {
        e.preventDefault();
        if (window.confirm(`Are you sure you want to delete offer ${offer.offerID}`)) {
            this.setState({ loading: true, modalIsOpen: false });
            const { deleteOffer } = this.props;
            await deleteOffer(offer);
            this.handleSync();
        }
    }

    // when new offer is submitted
    handleSaveNew = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        const { createOffer } = this.props;
        const { offer } = this.state;
        // used to simulate optimistic update
        let offerTemp = JSON.parse(JSON.stringify(offer));
        offerTemp.offerID = '-10';
        this.state.productsAll.map((item) => {
            if (item.details.id === offerTemp.productID) offerTemp.product = item.details;
        });
        const prevThree = []; let count = 0;
        [].concat(this.props.company.offers.items).sort((a, b) => a.offerID.localeCompare(b.offerID)).map((offer) => {
            count++; if (count < 4) prevThree.push(offer);
        });
        const listOffers = [offerTemp, ...prevThree];
        this.is2simulateUpdate = true;
        this.setState({
            loading: true,
            modalIsOpen: false,
            listOffers
        });

        offer.product = offerTemp.product;
        await createOffer({ ...offer });
        this.handleSync();
    }

    handleSaveUpdate = (e) => {
        this.setState({ loading: true, modalIsOpen: false });
        e.stopPropagation();
        e.preventDefault();
        const { updateOffer } = this.props;
        if (!this.state.offer.companyID) {
            this.setState(prevState => ({
                offer: {
                    ...prevState.offer,
                    companyID: this.props.company.id
                }
            }), async () => {
                const { offer } = this.state;
                await updateOffer({ ...offer });
                this.handleSync();            
            });
        }
    }

    handleSync = async () => {
        const { client } = this.props;
        const query = QueryGetCompany;
        const coId = this.props.company.id;

        client.query({
            query,
            variables: { id: coId },
            fetchPolicy: 'network-only',
        });

        this.restoreDefaults();
    }

    restoreDefaults = () => {
        const productsListFromProps = this.props.products ? this.props.products : null;
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

    // update offers when new props with changed price or qnty are received
    updateOffers(items){
        for (let x = 0; x < this.props.offers.length; x++) {
            for (let y = 0; y < items.length; y++) {
                if (this.props.offers[x].companyID === this.props.company.id &&
                this.props.offers[x].offerID === items[y].offerID) {
                    items[y].available = this.props.offers[x].available;
                    items[y].price = this.props.offers[x].price;
                }
            }
        }
        return items;
    }

    // when markChangedOnes() function below detects changed values it changes relevant value below to 1.
    // That item in render is colored to light green in table. setTimeout is set to expire in 3 secs.
    // When 3 secs pass setTimeout function calls below function (fromTimer).
    // It cancels update color feedbacks changing values back to zero and updating state.
    // This time markChangedOnes() detects no change and text is colored to black again.
    fromTimer(id, field) {
        const z = this.getZ(id);
        if (field === "price") this.keepTillItTimesOut[z].price_ = 0;
        if (field === "rating") this.keepTillItTimesOut[z].rating_ = 0;
        if (field === "available") this.keepTillItTimesOut[z].available_ = 0;
        if (field === "price_T") this.keepTillItTimesOut[z].price_T = 0;
        if (field === "rating_T") this.keepTillItTimesOut[z].rating_T = 0;
        if (field === "available_T") this.keepTillItTimesOut[z].available_T = 0;
        if (field === "isNew") this.keepTillItTimesOut[z].isNew_ = 0;
        if (field === "isNew_T") this.keepTillItTimesOut[z].isNew_T = 0;
        this.setState(prevState => ({is2reRender: !prevState.is2reRender}));
    }

    // keepTillItTimesOut stores values for a specific field of a specific offer. 
    // getZ function returns index in keepTillItTimesOut array that holds info for that offer
    // if keepTillItTimesOut for a specific offerID is not found it will add one
    getZ(offerID){
        let isFound = false; let Z;
        const size = this.keepTillItTimesOut.length;
        for (let z = 0; z < size; z++) {
            if (this.keepTillItTimesOut[z].offerID === offerID) {isFound = true; Z = z; break; }
        }
        if (!isFound) {
            this.keepTillItTimesOut.push({ offerID, price_: 0, rating_: 0, available_: 0, price_T: 0, rating_T: 0, available_T: 0 });
            Z = size;
        }
        return Z;
    }

    // markChangedOnes() detects changed values and marks them for color highlighting (light green)
    markChangedOnes(listOffers) {
        const dataTemp = JSON.parse(JSON.stringify(listOffers));
        const dataPrev = this.listOffersPrev === null ? dataTemp : this.listOffersPrev;
        if (dataPrev) {
            let isSimUpdFound = false;
            for (let y = 0; y < dataPrev.length; y++) {
                if (dataPrev[y].offerID === '-10') {
                    if (dataPrev.length === dataTemp.length + 1) {
                        for (let x = 0; x < dataTemp.length; x++) {
                            if (dataTemp[x].offerID === '-10') { isSimUpdFound = true;}
                        }
                        if (!isSimUpdFound) {
                            dataTemp.push(dataPrev[y]);
                        }
                    }
                }
            }

            for (let x = 0; x < dataTemp.length; x++) {
                let price, prevPrice, rating, prevRating, available, prevAvailable;
                for (let y = 0; y < dataPrev.length; y++) {
                    if (dataPrev[y].offerID === dataTemp[x].offerID) {
                        prevPrice = dataPrev[y].price;
                        prevRating = dataPrev[y].lastTenAverageRating;
                        prevAvailable = dataPrev[y].available;
                        price = dataTemp[x].price;
                        rating = dataTemp[x].lastTenAverageRating;
                        available = dataTemp[x].available;
                        
                        const z = this.getZ(dataTemp[x].offerID);
                        let tempTriggerTimer;

                        if (price !== prevPrice) {
                            this.keepTillItTimesOut[z].price_ = 1;
                            tempTriggerTimer = 1;
                        } else {
                            tempTriggerTimer = 0;
                        }
                        dataTemp[x]["price_"] = this.keepTillItTimesOut[z].price_;
                        dataTemp[x]["price_T"] = tempTriggerTimer;

                        if (rating !== prevRating) {
                            this.keepTillItTimesOut[z].rating_ = 1;
                            tempTriggerTimer = 1;
                        } else {
                            tempTriggerTimer = 0;
                        }
                        dataTemp[x]["rating_"] = this.keepTillItTimesOut[z].rating_;
                        dataTemp[x]["rating_T"] = tempTriggerTimer;

                        if (available !== prevAvailable) {
                            this.keepTillItTimesOut[z].available_ = 1;
                            tempTriggerTimer = 1;
                        } else {
                            tempTriggerTimer = 0;
                        }
                        dataTemp[x]["available_"] = this.keepTillItTimesOut[z].available_;
                        dataTemp[x]["available_T"] = tempTriggerTimer;
                    }
                }
            }
        }
        
        this.listOffersPrev = dataTemp;
        return dataTemp;
    }


    render() {
        console.log('props Offers - ', this.props);
        const { company, loading } = this.props;
        const loadingState = this.state.loading;
        const deals = this.dealsFromStore();
        if (this.props.company) {
            if (!this.state.productsAll || this.state.productsAll.length === 0) {
                if (this.props.products.length > 0) this.restoreDefaults();
            }
            let { company: { offers: { items } } } = this.props;
            items = this.addAverageRatingToOffers(items, deals, this.props.company.id);
            if (this.props.offers && this.props.offers.length > 0) items = this.updateOffers(items);
            if (this.is2simulateUpdate) {
                items = this.markChangedOnes(this.state.listOffers);
                this.is2simulateUpdate = false;
            } else {
                items = this.markChangedOnes(items);
            };

            return (
                <div style={(loading || loadingState)  ? sectionStyle : null}>  
                    
                    {/* if new product was added warn offering company */}
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

                    {/* if company is defined display its offers */}
                    {company && <div className="">
                        <div className="responsiveFSize">{company.name} - offered products &nbsp; &nbsp;
                        <span
                            className="addnlightbg notbold cursorpointer"
                            onClick={() => {
                                const productsListFromProps = this.props.products ? this.props.products : null;
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
                        </div>
                        <table id="tableFM">
                            <tbody>
                                <tr>
                                    <td>&nbsp;</td>
                                    <td>model #</td>
                                    <td>price</td>
                                    <td>rating</td>
                                    <td>available</td>
                                </tr>
                                {items && items.length === 0 &&
                                    <tr>
                                        <td>&nbsp; (no offers)</td>
                                        <td>&nbsp;</td>
                                        <td>&nbsp;</td>
                                        <td>&nbsp;</td>
                                        <td>&nbsp;</td>
                                    </tr>
                                }
                                {[].concat(items).sort((a, b) => a.product.name.localeCompare(b.product.name)).map((offer) =>
                                    <tr key={offer.offerID} className={offer.offerID === '-10' ? 'responsiveBlue' : 'responsiveBlack'}>
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
                                        <td>&nbsp;
                                        {<span className={(offer.price_ === 1 && offer.offerID !== '-10')
                                                ? 'responsiveGreen' : (offer.offerID === '-10' ? 'responsiveBlue' : 'responsiveBlack')}>
                                                {parseFloat(offer.price).toFixed(2)}</span>}
                                            {offer.price_T === 1 && offer.offerID !== '-10' &&
                                                setTimeout(() => this.fromTimer(offer.offerID, 'price'), 3000)}
                                            {offer.price_T === 1 && offer.offerID !== '-10' && this.fromTimer(offer.offerID, 'price_T')}
                                        </td>
                                        <td>&nbsp;
                                        {<span className={(offer.rating_ === 1 && offer.offerID !== '-10')
                                            ? 'responsiveGreen' : (offer.offerID === '-10' ? 'responsiveBlue' : 'responsiveBlack')}>
                                            {offer.lastTenAverageRating}</span>}
                                            {offer.rating_T === 1 && offer.offerID !== '-10' && 
                                            setTimeout(() => this.fromTimer(offer.offerID, 'rating'), 3000)}
                                            {offer.rating_T === 1 && offer.offerID !== '-10' && this.fromTimer(offer.offerID, 'rating_T')}
                                        </td>
                                        <td>&nbsp; {<span className={(offer.available_ === 1 && offer.offerID !== '-10')
                                            ? 'responsiveGreen' : (offer.offerID === '-10' ? 'responsiveBlue' : 'responsiveBlack')}>
                                            {offer.available}</span>}
                                            {offer.available_T === 1 && offer.offerID !== '-10' && 
                                            setTimeout(() => this.fromTimer(offer.offerID, 'available'), 3000)}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>}
                    <div className="responsiveFSize">Recent sales:</div>
                    {deals && 
                        <table id="tableFM">
                            <tbody>
                                <tr>
                                    <td>&nbsp;</td>
                                    <td>price</td>
                                    <td>quantity</td>
                                    <td>status</td>
                                    <td>block ID</td>
                                </tr>
                                {deals && deals.length === 0 && 
                                    <tr>
                                        <td>&nbsp;(no sales)</td>
                                        <td>&nbsp;</td>
                                        <td>&nbsp;</td>
                                        <td>&nbsp;</td>
                                        <td>&nbsp;</td>
                                    </tr>}
                                {[].concat(deals).sort((a, b) => a.dealID.localeCompare(b.dealID)).map((deal) =>
                                    <tr key={deal.dealID} 
                                    className={deal.isNew === 1 ? 'responsiveGreen' : 'responsiveBlack'} >
                                    {deal.isNew_T === 1 &&
                                        setTimeout(() => this.fromTimer(deal.dealID, 'isNew'), 3000)}
                                    {deal.isNew_T === 1 && this.fromTimer(deal.isNew_T, 'isNew_T')}
                                        <td>{deal.productName}</td>
                                        <td>{deal.dealPrice.toFixed(2)}</td>
                                        <td>{deal.dealQuantity}</td>
                                        <td>{deal.dealStatus.toLowerCase()}</td>
                                        <td># {deal.blockchainBlockID}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>}

                    <div>
                        {/*  Add new offer pop-up modal  */}
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
                <div>Attempting to load offers ...</div>
            )
        }
    }
}

export default compose (
    graphql(
        QueryGetCompany,
        {
            options: function ({ id }) {
                return ({
                    variables: { id },
                    fetchPolicy: 'cache-and-network',
                })
            },
            props: ({ data: { getCompany: company, loading } }) => {
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
                    return props.mutate({
                        update: (proxy, { data: { createOffer } }) => {
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
                    return props.mutate({
                        update: (proxy, { data: { updateOffer } }) => {
                            const query = QueryAllOffers;
                            const data = proxy.readQuery({ query });

                            // filter out old one if it is an update
                            data.listOffers.items = [
                                ...data.listOffers.items.filter(e => {
                                    return e.offerID !== updateOffer.offerID
                                })
                                , updateOffer];
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
    graphql(QueryAllOffers, {
        options: {
            fetchPolicy: 'cache-and-network'
        },
        props: props => ({
            offers: props.data.listOffers ? props.data.listOffers.items : [],
            subscribeToUpdateOffers: params => {
                props.data.subscribeToMore({
                    document: UpdateOfferSubscription,
                    updateQuery: (prev, { subscriptionData: { data: { onUpdateOffer } } }) => {
                        return {
                            ...prev,
                            listOffers: {
                                __typename: 'OfferConnection',
                                items: [onUpdateOffer, ...prev.listOffers.items.filter(offer => offer.offerID !== onUpdateOffer.offerID)]
                            }
                        }
                    }
                })
            }
        })
    })
)(PartsCompany);
