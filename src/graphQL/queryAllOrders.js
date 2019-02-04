import gql from "graphql-tag";

export default gql(`
query {
  listOrders(limit: 100) {
    items {
      companyID
      orderID
      productID
      price
      quantity
    }
  }
}
`);