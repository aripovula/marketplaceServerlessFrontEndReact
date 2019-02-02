import React, { Component } from "react";
import Modal from 'react-modal';


class ModalInfo extends Component {

    customStyles = {
        content: {
            top: '20%',
            left: '45%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            padding: '1%',
            margin: '4%'
        }
    };

        
    render() {
        const {data} = this.props;
        console.log('props modaL', this.props);
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
                        <div className="">
                            <p>{data.name} - {data.model}</p>
                            <p>Product image:</p>
                            {/*<img alt="" src={require(data.specURL)} />*/}
                            <p>Product specification: Lorem ipsum</p>

                        </div>
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
