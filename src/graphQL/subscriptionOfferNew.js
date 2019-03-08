import gql from 'graphql-tag'

export default gql`
subscription NewOfferSub {
  onCreateOffer {
      companyID
      offerID
      productID
      price
      available
      product {
        id,
        name
        modelNo
        specificationURL
        imageURL
        lastTenRatingAverage
      }
  }
}`;