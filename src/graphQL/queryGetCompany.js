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
        offerID
        productID
        price
        available
        product {
          id,
          name
          modelNo
          productImages {
            items {
              productID
              s3imageID
              bucket
              key
              region
            }
          }
          specificationURL
        }
      }
    }
  }
}
`);
