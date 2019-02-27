import gql from 'graphql-tag'

export default gql`
subscription ($companyID: ID) {
  onCreateOrder(
    filter: {
      companyID: {
        eq: $companyID
      }
    }
    )  {
    companyID
    orderID
    productID
    status
    note
	  dealPrice
    maxPrice
    quantity
    bestOfferType
    secondBestOfferType
    minProductRating
    isCashPayment
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