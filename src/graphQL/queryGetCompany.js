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
      }
    }
  }
}`);
