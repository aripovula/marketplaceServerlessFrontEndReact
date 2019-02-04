import gql from "graphql-tag";

export default gql(`
query($companyID: ID!, $orderID: String!) {
  getOrder(companyID: $companyID, orderID: $orderID) {
      companyID
      orderID
      producerID
      productID
      orderTime
      status
      price
      quantity
      orderedProductRating
      bestOfferType
      minProductRating
  }
}`);
