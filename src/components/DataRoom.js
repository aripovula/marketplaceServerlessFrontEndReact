import React, { Component } from "react";
import { Link } from "react-router-dom";

import { graphql, compose, withApollo } from "react-apollo";
import QueryAllOffers from "../graphQL/queryAllOffers";

import MutationDeleteOffer from "../graphQL/mutationDeleteOffer";

class DataRoom extends Component {

  state = {
    busy: false,
  }

  static defaultProps = {
    offers: [],
    deleteOffer: () => null,
  }

  async handleDeleteClick(offer, e) {
    e.preventDefault();

    if (window.confirm(`Are you sure you want to delete offer ${offer.offerID}`)) {
      const { deleteOffer } = this.props;
      console.log('deleteOffer = ', this.props.deleteOffer);


      await deleteOffer(offer);
    }
  }

  handleSync = async () => {
    const { client } = this.props;
    console.log('props = ', this.props);
    console.log('client = ', client);

    const query = QueryAllOffers;

    this.setState({ busy: true });

    console.log('client.query = ', client.query);
    await client.query({
      query,
      fetchPolicy: 'network-only',
    });

    this.setState({ busy: false });
  }

  renderOffer = (offer) => (
    <div className="margintop" key={offer.offerID}>
      {console.log(offer.offerID)}
      <Link to={`/offer/${offer.offerID}`} className="card" key={offer.offerID}>
        <div className="">
          <div className="">{offer.modelNo}</div>
        </div>
        <div className="">
          <div className=""><i className=""></i>{offer.price}</div>
        </div>
        <div className="">
          <i className=""></i> {offer.productID} comments
              </div>
        <button className="" onClick={this.handleDeleteClick.bind(this, offer)}>
          <i className=""></i>
          Delete
              </button>
      </Link>
    </div>
  );

  render() {
    const { busy } = this.state;
    const { offers } = this.props;

    return (
      <div className="margintop">
        <div className="ui clearing basic segment">
          <h4 className="">All Offers</h4>
          <button className="button1" onClick={this.handleSync} disabled={busy}>
            <i aria-hidden="true" className={`refresh icon ${busy && "loading"}`}></i>
            Sync with Server
          </button>
        </div>
        <div className="">
          <div className="">
            <Link to="/newoffer" className="">
              <i className=""></i>
              <p>Create new offer</p>
            </Link>
          </div>
          {console.log('droom ren-', offers)}
          {[].concat(offers).sort((a, b) => a.offerID.localeCompare(b.offerID)).map(this.renderOffer)}
        </div>
      </div>
    );
  }

}

export default withApollo(compose(
  graphql(
    QueryAllOffers,
    {
      options: {
        fetchPolicy: 'cache-first',
      },
      props: ({ data: { listOffers = { items: [] } }
      }) => ({
        offers: listOffers.items
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

          data.listOffers.items = data.listOffers.items.filter(offer => offer.id !== deleteOffer.id);

          proxy.writeQuery({ query, data });
        }
      },
      props: (props) => ({
        deleteOffer: (offer) => {
          return props.mutate({
            variables: { companyID: offer.companyID, offerID: offer.offerID },
            optimisticResponse: () => ({
              deleteOffer: {
                ...offer, __typename: 'Offer'
              }
            }),
          });
        }
      })
    }
  )
)(DataRoom));
