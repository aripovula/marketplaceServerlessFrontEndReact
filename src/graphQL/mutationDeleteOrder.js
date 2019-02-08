import gql from "graphql-tag";

export default gql(`
mutation($companyID: ID!, $orderID: String!) {
  deleteOrder( input: { companyID: $companyID, orderID: $orderID } ) {
    companyID
		orderID
  }
}`);
