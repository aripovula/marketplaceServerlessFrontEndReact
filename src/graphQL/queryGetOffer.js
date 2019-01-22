import gql from "graphql-tag";

export default gql(`
query($companyID: ID!, $offerID: String!) {
  getOffer(companyID: $companyID, offerID: $offerID) {
      companyID
      offerID
      productID
      price
      available
  }
}`);
