import gql from "graphql-tag";

export default gql(`
query ListProducts {
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