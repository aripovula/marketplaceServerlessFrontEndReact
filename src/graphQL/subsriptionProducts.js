import gql from 'graphql-tag'

export default gql `
subscription NewProductSub {
  onCreateProduct {
    id
    name
    modelNo
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
}`;