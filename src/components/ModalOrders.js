import React, { Component } from 'react';
import Modal from 'react-modal';

export class ModalOrders extends Component {

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
            <div>
                <Modal
                    isOpen={this.props.isOpen}
                    style={this.customStyles}
                >

                    <div className="card-4" >
                        <div className="bggreen">
                            <p>{this.props.isUpdateAtStart ? 'Update re-order rule' : (this.props.isUpdate ? 'Update re-order rule' : 'Add new order / re-order rule')}</p>
                        </div>
                        <div className="padding15 responsiveFSize">
                            {!this.props.isUpdateAtStart &&
                                <div className="floatRight" onChange={this.updateProductOptions.bind(this)}>
                                    <label htmlFor="noOrders">products with no re-order rule({this.props.productsNoRule.length})&nbsp;</label>
                                    <input id="noOrders" type="radio" value="noOrders" name="prodtype" />
                                    &nbsp;&nbsp;
                                            <label htmlFor="all">&nbsp;all products({this.props.productsAll.length}) &nbsp;</label>
                                    <input id="all" type="radio" value="all" name="prodtype" defaultChecked />
                                </div>
                            }
                            {this.props.isUpdateAtStart && <div>Update re-order rule for '{this.props.order.product.name} - {this.props.order.product.modelNo}' - works only for new orders not yet placed</div>}
                            {!this.props.isUpdateAtStart &&
                                <div>
                                    <span>Product to order </span>
                                    <select
                                        value={this.props.selectedOption}
                                        onChange={(e) => {
                                            this.setState({ selectedOption: e.target.value },
                                                () => this.handleSelectOptionChange(this.props.selectedOption));
                                        }}
                                    >
                                        <option key="-1" value='null'>( please select a product )</option>
                                        {this.props.products.map((aProduct) =>
                                            <option key={aProduct.seqNumb} value={aProduct.seqNumb}>{aProduct.details.name + ' - ' + aProduct.details.modelNo}</option>
                                        )}
                                    </select>
                                </div>
                            }

                            <br />
                            {(this.props.selectedOption > -1 || this.props.isUpdateAtStart) &&
                                <div>
                                    {!this.props.isUpdateAtStart &&
                                        <div className="">
                                            <label htmlFor="oneoff">&nbsp;one-off order &nbsp;</label>
                                            <input id="oneoff" type="radio" value="1" name="orderType"
                                                checked={this.props.oneOffOrRule === 1} onChange={this.updateOrderType.bind(this)} />
                                            &nbsp;&nbsp;
                                            <label htmlFor="ruleonly">&nbsp;re-order rule &nbsp;</label>
                                            <input id="ruleonly" type="radio" value="2" name="orderType"
                                                checked={this.props.oneOffOrRule === 2} onChange={this.updateOrderType.bind(this)} />
                                        </div>
                                    }
                                    <br />
                                    {this.props.oneOffOrRule === 0 && !this.props.isUpdateAtStart &&
                                        <div><div>( below settings apply to initial order and subsequent re-orders )</div><br /></div>}

                                    Order product with following terms:
                                        {(this.props.order.bestOfferType === 'OPTIMAL' || this.props.order.bestOfferType === 'CUSTOM') &&
                                        <div className="floatRight">
                                            <span>if no offer is found fallback to </span>
                                            <select
                                                value={this.props.order.secondBestOfferType}
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
                                            checked={this.props.order.bestOfferType === "OPTIMAL"}
                                            onChange={(e) => this.handleBestOfferTypeChange(e)} />
                                        <label htmlFor="optimal">&nbsp;cheapest price at min. rating</label>
                                        <br />
                                        &nbsp;&nbsp;<input id="cheapest" type="radio" value="CHEAPEST" name="bestorder"
                                            checked={this.props.order.bestOfferType === "CHEAPEST"}
                                            onChange={(e) => this.handleBestOfferTypeChange(e)} />
                                        <label htmlFor="cheapest">&nbsp;cheapest price</label>
                                        <br />
                                        &nbsp;&nbsp;<input id="highestrating" type="radio" value="HIGHESTRATING" name="bestorder"
                                            checked={this.props.order.bestOfferType === "HIGHESTRATING"}
                                            onChange={(e) => this.handleBestOfferTypeChange(e)} />
                                        <label htmlFor="highestrating">&nbsp;highest rating</label>
                                        <br />
                                        &nbsp;&nbsp;<input id="custom" type="radio" value="CUSTOM" name="bestorder"
                                            checked={this.props.order.bestOfferType === "CUSTOM"}
                                            onChange={(e) => this.handleBestOfferTypeChange(e)} />
                                        <label htmlFor="custom">&nbsp;custom settings</label>

                                    </div>

                                    {(this.props.order.bestOfferType === 'CUSTOM' || this.props.order.bestOfferType === 'HIGHESTRATING') &&
                                        <div className="">
                                            <label htmlFor="price">max. price</label>
                                            <input type="text" id="price" value={this.props.order.maxPrice} onChange={this.handleChange.bind(this, 'maxPrice')} />
                                            <button className="buttonSm button2a" onClick={() => this.handlePriceChange(0.99)}>- 1%</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handlePriceChange(1.01)}>+ 1%</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handlePriceChange(0.96)}>- 4%</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handlePriceChange(1.04)}>+ 4%</button>&nbsp;
                                            </div>
                                    }
                                    {(this.props.order.bestOfferType === 'CUSTOM' || this.props.order.bestOfferType === 'OPTIMAL') &&
                                        <div className="">
                                            <label htmlFor="minProductRating">min. rating</label>
                                            <input type="text" id="minProductRating" value={this.props.order.minProductRating} onChange={this.handleChange.bind(this, 'minProductRating')} />
                                            <button className="buttonSm button2a" onClick={() => this.handleRatingChange(-0.1, 1)}>- 0.1</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handleRatingChange(0.1, 1)}>+ 0.1</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handleRatingChange(4, 0)}>4.0</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handleRatingChange(4.2, 0)}>4.2</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handleRatingChange(4.4, 0)}>4.4</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handleRatingChange(4.6, 0)}>4.6</button>&nbsp;
                                            </div>
                                    }
                                    <br />

                                    {!(this.props.oneOffOrRule === 2) &&
                                        <div className="">
                                            <label htmlFor="quantity">
                                                {this.props.oneOffOrRule === 0 && <span>initial </span>}
                                                order quantity&nbsp;&nbsp;</label>
                                            <input type="text" id="quantity" value={this.props.order.quantity} onChange={this.handleChange.bind(this, 'quantity')} />
                                            <button className="buttonSm button2a" onClick={() => this.handleQuantityChange(-10)}>- 10</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handleQuantityChange(10)}>+ 10</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handleQuantityChange(-100)}>- 100</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handleQuantityChange(100)}>+ 100</button>&nbsp;
                                            </div>
                                    }

                                    {!(this.props.oneOffOrRule === 1) &&
                                        <div>
                                            <div>reorder &nbsp;
                                                <input type="text" id="reorderQnty" value={this.props.order.reorderQnty} onChange={this.handleChange.bind(this, 'reorderQnty')} />
                                                &nbsp; items&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handleReorderQntyChange(-10)}>- 10</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handleReorderQntyChange(10)}>+ 10</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handleReorderQntyChange(-100)}>- 100</button>&nbsp;
                                                <button className="buttonSm button2a" onClick={() => this.handleReorderQntyChange(100)}>+ 100</button>&nbsp;
                                            </div>
                                            <div>when stock is below&nbsp;
                                                <input type="text" id="reorderLevel" value={this.props.order.reorderLevel} onChange={this.handleChange.bind(this, 'reorderLevel')} />
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
                                            checked={!this.props.order.isCashPayment} onChange={this.updateSettlementType.bind(this)} />
                                        &nbsp;&nbsp;
                                            <label htmlFor="cash">&nbsp;cash&nbsp;</label>
                                        <input id="cash" type="radio" value="true" name="paymenttype"
                                            checked={this.props.order.isCashPayment} onChange={this.updateSettlementType.bind(this)} />
                                    </div>

                                </div>
                            }
                            <br />
                            <span className="responsiveFSize2a">Warning: best match to your order is a legally binding deal for you and offering co.</span>
                            <br /><br />
                            <div className="">

                                {(!this.props.isUpdateAtStart && !this.props.isUpdate) &&
                                    <button className="button button1" onClick={this.handleSaveNew} disabled={!this.props.isSubmitValid}>
                                        {this.props.oneOffOrRule === 1 ? 'Place new order' :
                                            (this.props.oneOffOrRule === 2 ? 'Set re-order rule' : 'Place order and set rule')}
                                    </button>
                                }

                                {(this.props.isUpdateAtStart || this.props.isUpdate) &&
                                    <button className="button button1" onClick={this.handleSaveUpdate} disabled={!this.props.isSubmitValid &&
                                        !this.props.isUpdateAtStart}>
                                        Update rule
                                            </button>
                                }

                                {(this.props.isUpdateAtStart || this.props.isUpdate) &&
                                    <span>
                                        <button className="button button1" onClick={this.handleSuspendResume.bind(this, this.props.order)}>
                                            {this.props.order.isRuleEffective ? 'Suspend rule' : 'Resume rule'}  </button>
                                        <button className="button button1 floatRight" onClick={this.handleDelete.bind(this, this.props.order)}>
                                            Delete rule</button>
                                    </span>
                                }
                                <button className="button button1" onClick={this.handleModalClose}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </Modal>

            </div>
      </div>
    )
  }
}

export default ModalOrders
