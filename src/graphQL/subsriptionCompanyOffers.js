// import gql from "graphql-tag";

// export default gql(`
// subscription($companyID: String!) {
//   onCreateOffer(companyID: $companyID) {
//     offerID
//   }
// }`);

import gql from 'graphql-tag'

export default gql`
subscription NewOfferSub {
  onCreateOffer {
      companyID
      offerID
      productID
      price
      available
  }
}`;