import gql from "graphql-tag";

export default gql(`
query ListProducts {
  listProducts{
    items {
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
}
`);