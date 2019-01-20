import gql from "graphql-tag";

export default gql(`
mutation (
    $companyID: ID!
    $offerID: String!
    $productID: String!
    $modelNo: String!
    $price: Float!
    $available: Int!
  ) {
    createOffer(
      input: {
        companyID: $companyID
        offerID: $offerID
        productID: $productID
        modelNo: $modelNo
        price: $price
        available: $available
      }
    ) {
      companyID
      offerID
      productID
      modelNo
      price
      available
  }
}`);
