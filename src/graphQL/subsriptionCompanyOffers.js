import gql from "graphql-tag";

export default gql(`
subscription($companyId: String!) {
  onCreateOffer(companyId: $companyId) {
    companyId
    offerID
  }
}`);
