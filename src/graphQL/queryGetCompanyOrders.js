import gql from "graphql-tag";

export default gql(`
query ($id: ID!) {
  getCompany(id: $id) {
    id
    name
    creditRating
    status
    orders {
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
}
`);
