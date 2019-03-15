import gql from "graphql-tag";

export default gql(`
mutation (
    $userID: ID!
    $companyID: String!
    $name: String!
    $yearsOfOperation: Int!
) {
  createCompanyB(input: {
    userID: $userID,
    companyID: $companyID,
    name: $name,
    yearsOfOperation: $yearsOfOperation,
  }) {
    userID,
    companyID,
    name
  }
}`);
