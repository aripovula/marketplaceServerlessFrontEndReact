import React, { Component } from 'react'
import Modal from 'react-modal';

export class ModalOffers extends Component {

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
    return (
      <div>
            <Modal
                isOpen={this.props.isOpen}
                style={this.customStyles}
                contentLabel="Example Modal"
            >

                <div className="card-4" >
                    <div className="bggreen">
                        <p>{this.props.isUpdateAtStart ? 'Update an offer' : (this.props.isUpdate ? 'Update an offer' : 'Add new offer')}</p>
                    </div>
                    <div className="padding15">
                        {!this.props.isUpdateAtStart &&
                            <div>
                                <div className="floatRight" onChange={this.props.updateProductOptions.bind(this)}>
                                    <label htmlFor="noOffers">products with no offer({this.props.productsNoOffer.length})&nbsp;</label>
                                    <input id="noOffers" type="radio" value="noOffers" name="prodtype" defaultChecked />
                                    &nbsp;&nbsp;
                                        <label htmlFor="all">&nbsp;all products({this.props.productsAll.length}) &nbsp;</label>
                                    <input id="all" type="radio" value="all" name="prodtype" />
                                </div>

                                <div>
                                    <span>products </span>
                                    <select
                                        value={this.props.selectedOption}
                                        onChange={(e) => this.props.handleSelectOptionChange(e.target.value)}
                                    >
                                        <option key="-1" value='null'>( please select a product )</option>
                                        {this.props.products.map((aProduct) =>
                                            <option key={aProduct.seqNumb} value={aProduct.seqNumb}>{aProduct.details.name + ' - ' + aProduct.details.modelNo}</option>
                                        )}
                                    </select>
                                </div>
                            </div>
                        }

                        <div className="">
                            <label htmlFor="price">price</label>
                            <input type="text" id="price" value={this.props.offer.price} onChange={this.props.handleChange.bind(this, 'price')} />
                        </div>
                        <div className="">
                            <label htmlFor="available">available</label>
                            <input type="text" id="available" value={this.props.offer.available} onChange={this.props.handleChange.bind(this, 'available')} />
                        </div>
                        <br />
                        <div className="">
                            {(!this.props.isUpdateAtStart && !this.props.isUpdate) &&
                                <button className="button button1" onClick={this.props.handleSaveNew} disabled={!this.props.isSubmitValid}>
                                    Add new
                                            </button>
                            }

                            {(this.props.isUpdateAtStart || this.props.isUpdate) &&
                                <button className="button button1" onClick={this.props.handleSaveUpdate} disabled={!this.props.isSubmitValid && !this.props.isUpdateAtStart}>
                                    Update
                                            </button>
                            }

                            <button className="button button1" onClick={this.props.handleModalClose}>Cancel</button>
                            <span className="horIndent"></span>
                            {(this.props.isUpdateAtStart || this.props.isUpdate) &&
                                <button className="button button1 floatRight" onClick={this.props.handleDelete.bind(this, this.props.offer)}> Delete </button>
                            }
                        </div>
                    </div>
                </div>
            </Modal>
      </div>
    )
  }
}

export default ModalOffers
