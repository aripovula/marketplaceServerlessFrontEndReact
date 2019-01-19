import gql from "graphql-tag";

export default gql(`
query {
  listOffers(limit: 4) {
    items {
      companyID
      offerID
      productID
      modelNo
      price
      available
    }
  }
}
`);