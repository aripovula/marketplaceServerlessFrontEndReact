import gql from "graphql-tag";

export default gql(`
query ($id: ID!) {
  getCompany(id: $id) {
    id
    name
    creditRating
    status
    offers {
      items {
        companyID
        offerID
        productID
        price
        available
        product {
          id
          name
          modelNo
          specificationURL
          imageURL
          lastTenRatingAverage

        }
      }
    }
  },
  listProducts{
    items {
      id
      name
      modelNo
      specificationURL
      imageURL
      lastTenRatingAverage
    }
  }
}
`);
