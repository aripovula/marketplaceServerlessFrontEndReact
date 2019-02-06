import gql from "graphql-tag";

export default gql(`
query {
  listOrders(limit: 100) {
    items {
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
  }
}
`);