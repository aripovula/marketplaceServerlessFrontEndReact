import React, { Component } from "react";
import Modal from 'react-modal';

import { v4 as uuid } from "uuid";
import { graphql } from "react-apollo";
import QueryAllProducts from "../graphQL/queryAllProducts";
import QueryGetProduct from "../graphQL/queryGetProduct";
import MutationCreateProduct from "../graphQL/mutationAddProduct";

class ModalProduct extends Component {

    // CSS for pop-up modal
    customStyles = {
        content: {
            top: '30%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            padding: '1%',
            margin: '4%'
        }
    };

    constructor(props) {
        super(props);

        this.state = {
            mainText: this.props.mainText,
            shortText: this.props.shortText,
            product: this.newProduct(),
            isExistingProduct: false

        };
        this.handleModalCloseOptionSelected = this.handleModalCloseOptionSelected.bind(this);
    }

    componentWillMount() {
        Modal.setAppElement('body');
    }

    static defaultProps = {
        createProduct: () => null,
    }

    newProduct() {
        return {
            name: "",
            modelNo: "",
            specificationURL: "",
            imageURL: '',
	        lastTenRatingAverage: 4.5
        };
    }

    handleModalCloseOptionSelected() {
        this.setState({ isExistingProduct: false, product: this.newProduct() });
        this.props.handleModalCloseOptionSelected();
    }
    
    handleChange(field, { target: { value } }) {
        const { product } = this.state;
        product[field] = value;
        this.setState({ product });
    }

    // save product to DynamoDB thru AppSync
    handleSave = async (e) => {
        this.props.handleModalCloseOptionSelected();
        
        // before saving the code checks if product with this name already exists
        let isExisting = false;
        const { client } = this.props;
        const { product } = this.state;
        let productsInStore;
        
        try {
            productsInStore = client.readQuery({
                query: QueryAllProducts
            });
        } catch(e) {
            productsInStore = null;
        }

        if (productsInStore && productsInStore.listProducts && productsInStore.listProducts.items) {
            productsInStore.listProducts.items.forEach((aProduct) => {
                if (aProduct.name === product.name && aProduct.modelNo === product.modelNo) {
                    isExisting = true;
                }
            });
        }

        if (isExisting) {
            this.setState({ isExistingProduct: true})
        // if does not exist save new one
        } else {
            e.stopPropagation();
            e.preventDefault();
            this.setState({ isExistingProduct: false })
    
            const { createProduct } = this.props;
            this.setState(prevState => ({
                product: {
                    ...prevState.product,
                    id: uuid()
                }
            }));  
    
            await createProduct({ ...product });
            
            this.handleModalCloseOptionSelected();
        }
    }

        
    render() {

        console.log('props modaL', this.props);
        const { product } = this.state;
        return (
            <div className="margintop">
                <Modal
                    isOpen={!!this.props.mainText}
                    style={this.customStyles}
                >
                    <div className="card-4" >
                        <div className="bggreen">
                            <p>{this.props.shortText}</p>
                        </div>
                        <div className="padding15">
                        <div className="">
                        <label htmlFor="name">product name (max. 14 characters)</label>
                        <input type="text" id="name" value={product.name} onChange={this.handleChange.bind(this, 'name')} />
                        </div>
                        <div className="">
                        <label htmlFor="modelNo">model #  (max. 10 characters)</label>
                        <input type="text" id="modelNo" value={product.modelNo} onChange={this.handleChange.bind(this, 'modelNo')} />
                        </div>
                            <div className="">
                                <label htmlFor="imageURL">image URL (type any value *)</label>
                                <input type="text" id="imageURL" value={product.imageURL} onChange={this.handleChange.bind(this, 'imageURL')} />
                            </div>
                        <div className="">
                        <label htmlFor="specificationURL">specification URL (type any value *)</label>
                        <input type="text" id="specificationURL" value={product.specificationURL} onChange={this.handleChange.bind(this, 'specificationURL')} />
                        <br/><label className="text14black">* assume there is a webpage that defines product standards and provides product image</label>
                                {!this.state.isExistingProduct &&
                                    <p className="text14black">only registered products can be traded in this marketplace. All traded items must meet exact same design and quality standards agreed between market members. Request adding new product</p>
                                }
                                {this.state.isExistingProduct &&
                                    <p className="warning2"><i>product with this name and model exists !</i></p>
                                }
                        <br/>
                            </div>

                            <div className="">
                                <button className="button button1" onClick={this.handleSave}>Save</button>
                                <button className="button button1" onClick={this.handleModalCloseOptionSelected}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </Modal >
            </div>
        );
    }
}

export default graphql(
    MutationCreateProduct,
    {
        props: (props) => ({
            createProduct: (product) => {
                return props.mutate({
                    update: (proxy, { data: { createProduct } }) => {
                        // Update QueryAllProducts
                        const query = QueryAllProducts;
                        const data = proxy.readQuery({ query });

                        data.listProducts.items = [...data.listProducts.items.filter(e => {
                            return e.id !== createProduct.id
                        }), createProduct];
                        proxy.writeQuery({ query, data });

                        // Create cache entry for QueryGetProduct
                        const query2 = QueryGetProduct;
                        const variables = { id: createProduct.id };
                        const data2 = { getProduct: { ...createProduct } };
                        proxy.writeQuery({ query: query2, variables, data: data2 });
                    },
                    variables: product,
                    optimisticResponse: () => (
                        {
                            createProduct: {
                                ...product, __typename: 'Product'
                            }
                        }),
                })
            }
        })
    }
)(ModalProduct);
