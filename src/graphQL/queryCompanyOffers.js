import gql from "graphql-tag";

export default gql(`
query (
  $companyID: String! 
  $limit: Int!
  $nextToken: String!
) {
  listOffers(limit: $limit, nextToken: $nextToken, filter: {
    companyID: {
      eq: $companyID
    }
  }) {
    items {
      offerID
      productID
      modelNo
      price
      available
    }
    nextToken
  }
}
`);