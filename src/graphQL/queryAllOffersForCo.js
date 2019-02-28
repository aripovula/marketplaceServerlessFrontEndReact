import gql from "graphql-tag";

export default gql(`
query($limit: Int, $nextToken: String, $companyID: ID) {
  listOffers(limit: $limit,
    nextToken: $nextToken, 
    filter: {
      companyID: {
        eq: $companyID
      }
    }
    ) {
    items {
      companyID
      offerID
      productID
      price
      available
    }
  }
}
`);