import gql from "graphql-tag";

export default gql(`
mutation (
    $name: String!
    $creditRating: CreditRating!
    $status: MemberStatus!
    $yearsOfOperation: Int!
) {
  createCompany(input: {
    name: $name,
    creditRating: $creditRating,
    status: $status,
    yearsOfOperation: $yearsOfOperation,
  }) {
    id
  }
}`);
