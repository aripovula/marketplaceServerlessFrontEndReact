import gql from 'graphql-tag'

export default gql`
subscription UpdateOrderSub {
  onUpdateOrder {
    companyID
    orderID
    productID
    status
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