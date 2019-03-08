import gql from "graphql-tag";

export default gql(`
query {
  listOffers(limit: 100) {
    items {
      companyID
      offerID
      productID
      price
      available
      product {
        id,
        name
        modelNo
        specificationURL
        imageURL
        lastTenRatingAverage
      }
    }
  }
}
`);