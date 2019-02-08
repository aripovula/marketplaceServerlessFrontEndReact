import gql from "graphql-tag";

export default gql(`
mutation($companyID: ID!, $reorderRuleID: String!) {
  deleteReOrderRule( input: { companyID: $companyID, reorderRuleID: $reorderRuleID } ) {
    companyID
		reorderRuleID
  }
}`);
