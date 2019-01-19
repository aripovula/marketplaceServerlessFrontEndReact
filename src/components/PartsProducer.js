import React, { Component } from 'react'
import OfferModal from './OfferModal';

export class PartsProducer extends Component {

    constructor(props) {
        super(props);

        this.state = {
            mainText: undefined,
            shortText: undefined
        };
        this.handleModalCancelOptionSelected = this.handleModalCancelOptionSelected.bind(this);
        this.handleModalYesOptionSelected = this.handleModalYesOptionSelected.bind(this);
    }

    handleModalCancelOptionSelected = () => {
        this.setState(() => ({ mainText: undefined }));
    }

    handleModalYesOptionSelected = (id) => {
        this.setState(() => ({ mainText: undefined }));
        // this.props.dispatch(startRemovePosting({ id }));
    }

  render() {
    return (
      <div>
            <span
                className="addnlightbg notbold cursorpointer"
                data-tip="permanently deletes entry. You will be prompted to confirm"
                onClick={() => {
                    this.setState(() => ({
                        shortText: 'New offer',
                        mainText: "New offer details"
                    }));
                }}>add offer</span>
                &nbsp;&nbsp;
            <span className="responsiveFSize2">to update click product name</span>

            <OfferModal
                // selectedOption = {this.state.selectedOption}
                
                // lid={id}
                mainText={this.state.mainText}
                shortText={this.state.shortText}
                handleModalYesOptionSelected={this.handleModalYesOptionSelected}
                handleModalCancelOptionSelected={this.handleModalCancelOptionSelected}
            />

            <table className="smalltable">
                <tbody>
                <tr>
                    <td>&nbsp;</td>
                    <td>Model #</td>
                    <td>Price</td>
                    <td>Rating</td>
                    <td>Available</td>
                </tr>
                <tr>
                    <td>Caster</td>
                    <td>A125</td>
                    <td>11</td>
                    <td>4.5</td>
                    <td>20000</td>
                </tr>
                <tr>
                    <td>Gauge</td>
                    <td>162S</td>
                    <td>9</td>
                    <td>4.4</td>
                    <td>500</td>
                </tr>
                </tbody>
            </table>

      </div>
    )
  }
}

export default PartsProducer
