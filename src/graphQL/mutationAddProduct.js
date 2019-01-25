import gql from "graphql-tag";

// $productImages: CreateS3ImageInput
export default gql(`
mutation (
  $name: String!
  $modelNo: String!
  $specificationURL: String!
  
) {
  createProduct(input: {
    name: $name,
    modelNo: $modelNo,
    specificationURL: $specificationURL
  }) {
    id
    name
    modelNo
    specificationURL
    productImages {
      items {
        s3imageID
        bucket
        region
        key
      }
    }
  }
}`);
