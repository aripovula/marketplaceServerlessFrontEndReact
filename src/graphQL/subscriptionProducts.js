import gql from 'graphql-tag'

export default gql `
subscription NewProductSub {
  onCreateProduct {
    id
    name
    modelNo
    specificationURL
    imageURL
    lastTenRatingAverage
  }
}`;