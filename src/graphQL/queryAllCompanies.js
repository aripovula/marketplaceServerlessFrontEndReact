import gql from "graphql-tag";

export default gql(`
query ListCompanies{
  listCompanies {
    items {
      id
      name
      creditRating
      status
      yearsOfOperation
    }
  }
}
`);