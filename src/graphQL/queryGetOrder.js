import gql from "graphql-tag";

export default gql(`
query($companyID: ID!, $orderID: String!) {
  getOrder(companyID: $companyID, orderID: $orderID) {
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
}`);
