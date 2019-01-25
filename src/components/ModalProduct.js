import React, { Component } from "react";
import Modal from 'react-modal';

// import { v4 as uuid } from "uuid";
import { graphql } from "react-apollo";
import QueryAllProducts from "../graphQL/queryAllProducts";
import QueryGetProduct from "../graphQL/queryGetProduct";
import MutationCreateProduct from "../graphQL/mutationAddProduct";

class ModalProduct extends Component {

    customStyles = {
        content: {
            top: '30%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '40%',
            padding: '1%',
            margin: '4%'
        }
    };

    constructor(props) {
        super(props);

        this.state = {
            mainText: this.props.mainText,
            shortText: this.props.shortText,
            product: {
                name: "",
                modelNo: "",
                specificationURL: "",
                productImages: {}
            }

        };
        // this.handleModalCancelOptionSelected = this.handleModalCancelOptionSelected.bind(this);
        // this.handleModalYesOptionSelected = this.handleModalYesOptionSelected.bind(this);
    }

    componentWillMount() {
        Modal.setAppElement('body');
    }

    static defaultProps = {
        createProduct: () => null,
    }

    // state = {
    //     product: {
    //         name: "",
    //         modelNo: "",
    //         specificationURL: "",
    //         productImages: {}
    //     }
    // };
    
    handleChange(field, { target: { value } }) {
        const { product } = this.state;
        product[field] = value;
        this.setState({ product });
    }

    handleSave = async (e) => {
        e.stopPropagation();
        e.preventDefault();

        const { createProduct } = this.props;
        const { product } = this.state;
        console.log('createProduct -', this.props.createProduct);
        console.log('product b4 save -', this.state.product);

        await createProduct({ ...product });
        
        this.props.handleModalCloseOptionSelected();
        // history.push('/newproduct');
    }

        
    render() {

        console.log('props modaL', this.props);
        const { product } = this.state;
        console.log('point U1');
        return (
            <div className="margintop">
                <Modal
                    isOpen={!!this.props.mainText}
                    onRequestClose={this.props.handleClearSelectedOption}

                    style={this.customStyles}
                >
                    <div className="card-4" >
                        <div className="bggreen">
                            <p>{this.props.shortText}</p>
                        </div>
                        <div className="">
                            <label htmlFor="name">product name</label>
                            <input type="text" id="name" value={product.name} onChange={this.handleChange.bind(this, 'name')} />
                        </div>
                        <div className="">
                            <label htmlFor="modelNo">model #</label>
                            <input type="text" id="modelNo" value={product.modelNo} onChange={this.handleChange.bind(this, 'modelNo')} />
                        </div>
                        <div className="">
                            <label htmlFor="specificationURL">specification URL</label>
                            <input type="text" id="specificationURL" value={product.specificationURL} onChange={this.handleChange.bind(this, 'specificationURL')} />
                        </div>

                        <div className="">
                            <button className="button1" onClick={this.handleSave}>Save</button>
                            <button className="button button1" onClick={this.props.handleModalCloseOptionSelected}>Cancel</button>
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
                console.log('point L1 at createProduct = ', product);
                return props.mutate({
                    update: (proxy, { data: { createProduct } }) => {
                        console.log('point L2 proxy - ', proxy);
                        // Update QueryAllProducts
                        const query = QueryAllProducts;
                        const data = proxy.readQuery({ query });
                        console.log('query = ', query);
                        console.log('data after read = ', data);
                        console.log('data.listProducts.items after read = ', data.listProducts.items);
                        console.log('createProduct = ', createProduct);

                        data.listProducts.items = [...data.listProducts.items.filter(e => {
                            console.log('e = ', e);
                            console.log('e.productID = ', e.productID);
                            return e.productID !== createProduct.productID
                        }), createProduct];
                        console.log('data after filter = ', data);
                        console.log('data.listProducts.items after filter = ', data.listProducts.items);
                        proxy.writeQuery({ query, data });

                        // Create cache entry for QueryGetProduct
                        const query2 = QueryGetProduct;
                        const variables = { id: createProduct.id };
                        const data2 = { getProduct: { ...createProduct } };
                        console.log('point L3 data2 = ', data2);
                        proxy.writeQuery({ query: query2, variables, data: data2 });
                        console.log('point L4 query2 = ', query2);
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
