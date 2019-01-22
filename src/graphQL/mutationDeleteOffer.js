import gql from "graphql-tag";

export default gql(`
mutation($companyID: ID!, $offerID: String!) {
  deleteOffer( input: { companyID: $companyID, offerID: $offerID } ) {
    companyID
	offerID
	productID
	price
	available
  }
}`);
