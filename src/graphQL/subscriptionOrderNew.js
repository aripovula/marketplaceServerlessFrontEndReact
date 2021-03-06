import gql from 'graphql-tag'

export default gql`
subscription OnNewOrder {
  onCreateOrder {
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