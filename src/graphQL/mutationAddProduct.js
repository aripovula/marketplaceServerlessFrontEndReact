import gql from "graphql-tag";

export default gql(`
mutation (
  $name: String!
  $modelNo: String!
  $specificationURL: String!
  $imageURL: String
	$lastTenRatingAverage: Float
) {
  createProduct(input: {
      name: $name,
      modelNo: $modelNo,
      specificationURL: $specificationURL,
      imageURL: $imageURL,
      lastTenRatingAverage: $lastTenRatingAverage
  }) {
      id
      name
      modelNo
      specificationURL
      imageURL
      lastTenRatingAverage
  }
}`);
