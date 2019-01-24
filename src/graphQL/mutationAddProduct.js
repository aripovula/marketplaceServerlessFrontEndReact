import gql from "graphql-tag";

export default gql(`
mutation (
  $name: String!
  $modelNo: String!
  $specificationURL: String!
  $productImages: [[String!]]
) {
  createProduct(input: {
	name: "Lever2",
	modelNo: "L232",
	specificationURL: "/42",
	productImages: [{
    s3imageID: "o18"
    bucket: "abc1",
    region: "us-east-1",
    key: "abc1"
  },
    {
    s3imageID: "o19"
    bucket: "abc2",
    region: "us-east-2",
    key: "abc2"
    }]
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
