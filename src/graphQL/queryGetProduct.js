import gql from "graphql-tag";

export default gql(`
query ($id: ID!) {
  getProduct(id: $id)
  {
      id
      name
      specificationURL
      productImages {
        items {
          productID
          s3imageID
          region
          bucket
          key
        }
      }
  }
}
`);
