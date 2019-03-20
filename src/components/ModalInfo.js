import React, { Component } from "react";
import Modal from 'react-modal';


class ModalInfo extends Component {

    // style for modal
    customStyles = {
        content: {
            top: '30%',
            left: '45%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            padding: '1%',
            margin: '4%',
        }
    };

        
    render() {
        const {data} = this.props;
        console.log('props ModalInfo', this.props);
        return (
            <div className="margintop">
                <Modal
                    isOpen={!!this.props.data}
                    style={this.customStyles}
                >
                    <div className="card-4" >
                        <div className="bggreen">
                            <p>{this.props.data.shortText}</p>
                        </div>
                        <div className="padding15">
                            {data.type === 'prodSpec' &&
                                <div className="">
                                    <p>{data.name} - {data.model}</p>
                                    <p>Product image:</p>
                                    <p>Product specification: Lorem ipsum</p>
                                </div>
                            }
                            {data.type === 'newProds' &&
                            <div>
                            <p>{this.props.data.mainText}</p>
                                {data.newProducts.map((item) => (
                                    <ul key={item.id}>
                                        <li key={item.id}>
                                            <p>{item.name} - {item.modelNo}</p>
                                        </li>
                                    </ul>
                                ))}
                                </div>
                    }
                            {data.type === 'newBlock' &&
                                <div>
                                    <p>{this.props.data.mainText}</p>
                                    <p>{this.props.data.bIndex}
                                    <span className="horIndent"></span>
                                    <span className="horIndent"></span>
                                    <span className="smalltext" style={{ color: 'green' }}>** For simplicity separate blockchain is maintained for each product **</span>
                                    </p>
                                    <p>{this.props.data.bPHash}</p>
                                    <p>{this.props.data.bHash}</p>
                                    <p>Nonce: 0 *</p>
                                    <p></p>
                                    <p className="smalltext">* Since blockchain is maintained centrally by the marketplace admin no leading zeros are added by using other values of nonce.</p>
                                    
                                </div>
                            }
                            <div className="">
                                <button className="button button1" onClick={this.props.handleInfoModalClose}>Ok</button>
                            </div>
                        </div>
                    </div>
                </Modal >

            </div>
        );
    }
}

export default ModalInfo;
