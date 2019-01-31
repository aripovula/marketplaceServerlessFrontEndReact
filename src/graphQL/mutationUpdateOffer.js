import gql from "graphql-tag";

export default gql(`
mutation (
    $companyID: ID!
    $offerID: String!
    $productID: String!
    $price: Float!
    $available: Int!
  ) {
    updateOffer(
      input: {
        companyID: $companyID
        offerID: $offerID
        productID: $productID
        price: $price
        available: $available
      }
    ) {
      companyID
      offerID
      productID
      price
      available
  }
}`);
