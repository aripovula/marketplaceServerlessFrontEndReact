import gql from 'graphql-tag'

export default gql`
subscription UpdateOfferSub {
  onUpdateOffer {
      companyID
      offerID
      productID
      price
      available
  }
}`;